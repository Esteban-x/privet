import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

/**
 * Un pilote de navigateur, sans dépendance.
 *
 * POURQUOI IL EXISTE. Les 28 000 contrôles du dépôt portent sur des
 * fonctions pures : une déclinaison, une clé de doublon, un tirage. Tout ce
 * qui vit à l'écran n'était vérifié que par quelqu'un qui regarde — et le
 * mode Voix a produit quatre défauts qu'aucun de ces contrôles ne pouvait
 * voir : un bouton bloqué sur « J'écoute… », un micro câblé sur la mauvaise
 * langue, une fin d'écoute muette, une rangée qui passait à la ligne. Un
 * domaine entier sans filet.
 *
 * POURQUOI PAS PLAYWRIGHT. Il installe 300 Mo de navigateurs pour faire ce
 * que Chrome fait déjà : parler le protocole DevTools sur une WebSocket, que
 * Node sert nativement depuis la v22. Ce fichier tient en deux cents lignes,
 * n'ajoute aucune dépendance, et se lit en entier — trois propriétés qui
 * comptent plus que la couverture d'API pour un contrôle qu'on veut garder
 * en état des années.
 *
 * CE QU'IL NE FAIT PAS. Ni capture d'écran comparée, ni test de rendu : on
 * n'attrape pas une régression esthétique ici. On attrape ce qui est
 * VÉRIFIABLE — un statut, un texte présent, un bouton qui change d'état, un
 * appel réseau et son contenu.
 */

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  `${os.homedir()}/AppData/Local/Google/Chrome/Application/chrome.exe`,
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

export function findChrome() {
  return CHROME_CANDIDATES.find((p) => p && fs.existsSync(p)) ?? null;
}

const PORT = Number(process.env.CDP_PORT || 9333);

export async function launchChrome() {
  const bin = findChrome();
  if (!bin) return null;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "privetik-cdp-"));
  const child = spawn(
    bin,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profile}`,
      "--window-size=430,932",
      "about:blank",
    ],
    { stdio: "ignore", detached: false }
  );

  // On attend que le point d'entrée réponde plutôt que de dormir : le
  // démarrage varie du simple au triple selon la machine.
  for (let i = 0; i < 60; i += 1) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) return { child, profile };
    } catch {
      /* pas encore là */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  child.kill();
  return null;
}

export function killChrome(handle) {
  if (!handle) return;
  try {
    handle.child.kill();
  } catch {
    /* déjà mort */
  }
  try {
    fs.rmSync(handle.profile, { recursive: true, force: true });
  } catch {
    /* le profil part au prochain nettoyage du système */
  }
}

export async function connect() {
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = list.find((t) => t.type === "page");
  if (!page) throw new Error("aucun onglet ouvert");

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });

  let id = 0;
  const waiting = new Map();
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (!msg.id || !waiting.has(msg.id)) return;
    const { res, rej } = waiting.get(msg.id);
    waiting.delete(msg.id);
    msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result);
  };

  const send = (method, params = {}) =>
    new Promise((res, rej) => {
      const n = (id += 1);
      waiting.set(n, { res, rej });
      ws.send(JSON.stringify({ id: n, method, params }));
    });

  await send("Page.enable");
  await send("Runtime.enable");

  const api = {
    send,
    close: () => ws.close(),

    /** Injecte un script AVANT le chargement — pour poser un faux moteur. */
    beforeLoad: (source) => send("Page.addScriptToEvaluateOnNewDocument", { source }),

    async evaluate(expression) {
      const r = await send("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      if (r.exceptionDetails) throw new Error(`${r.exceptionDetails.text} :: ${expression}`);
      return r.result.value;
    },

    async goto(url, waitForText = null) {
      await send("Page.navigate", { url });
      if (waitForText) return api.waitForText(waitForText);
      return api.settle(1200);
    },

    settle: (ms = 800) => new Promise((r) => setTimeout(r, ms)),

    /**
     * Attend qu'un texte apparaisse. Une attente sur CE QU'ON CHERCHE plutôt
     * qu'une pause fixe : la pause est toujours soit trop courte sur une
     * machine chargée, soit du temps perdu sur une machine rapide.
     */
    async waitForText(needle, timeout = 20000) {
      const start = Date.now();
      while (Date.now() - start < timeout) {
        const found = await api.evaluate(
          `document.body.innerText.includes(${JSON.stringify(needle)})`
        );
        if (found) return true;
        await api.settle(200);
      }
      throw new Error(`texte jamais apparu : « ${needle} »`);
    },

    text: () => api.evaluate("document.body.innerText"),

    /** Clique par texte visible, correspondance exacte d'abord. */
    async click(label, tag = "button, a") {
      const js =
        "(() => { const want = " +
        JSON.stringify(label) +
        "; const els = [...document.querySelectorAll(" +
        JSON.stringify(tag) +
        ")].filter(e => e.offsetParent !== null);" +
        " const txt = e => (e.innerText || '').trim();" +
        " const el = els.find(e => txt(e) === want) || els.find(e => txt(e).includes(want));" +
        " if (!el) return false; el.scrollIntoView({ block: 'center' }); el.click(); return true; })()";
      if (!(await api.evaluate(js))) throw new Error(`bouton introuvable : « ${label} »`);
      await api.settle(700);
    },

    /** Remplit un champ contrôlé par React (le setter natif, puis l'événement). */
    async fill(selector, value) {
      const js =
        "(() => { const el = document.querySelector(" +
        JSON.stringify(selector) +
        "); if (!el) return false;" +
        " const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement : HTMLInputElement;" +
        " Object.getOwnPropertyDescriptor(proto.prototype, 'value').set.call(el, " +
        JSON.stringify(value) +
        ");" +
        " el.dispatchEvent(new Event('input', { bubbles: true })); return true; })()";
      if (!(await api.evaluate(js))) throw new Error(`champ introuvable : ${selector}`);
      await api.settle(500);
    },
  };

  return api;
}
