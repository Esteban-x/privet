"use client";

import { useRef, useState, useSyncExternalStore } from "react";

// Web Speech API : pas de types officiels dans lib.dom (encore expérimental
// hors Chromium). Déclarations minimales pour ce qu'on utilise réellement.
interface SpeechRecognitionResultLike {
  [index: number]: { transcript: string };
}
interface SpeechRecognitionEventLike {
  results: { [index: number]: SpeechRecognitionResultLike };
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

/** Prononce un texte à voix haute. No-op silencieux si le navigateur ne le supporte pas. */
export function speak(text: string, lang: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel(); // n'empile pas les prononciations précédentes
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  window.speechSynthesis.speak(utterance);
}

// ─── Prononciation : voix de synthèse professionnelle ───────────
//
// POURQUOI NE PAS S'EN TENIR AU NAVIGATEUR. `speechSynthesis` dépend des
// voix installées sur la machine. Sur la plupart des PC français, aucune
// voix russe ne l'est : le navigateur lit alors le cyrillique avec une
// voix française — « книга » devient « k-n-i-g-a » prononcé à la
// française — ou ne dit rien du tout. Pour une app dont la prononciation
// est un argument de vente, c'est le défaut le plus visible.
//
// L'audio vient donc du serveur (/api/tts, ElevenLabs), mis en cache
// globalement : un mot déjà synthétisé par n'importe quel apprenant est
// servi par le CDN, gratuitement et instantanément.

export type SpeechLang = "ru" | "fr";

/**
 * URL connue par (langue, texte). `null` = déjà tenté, indisponible : on ne
 * redemande pas. La langue fait partie de la clé parce que la voix en
 * dépend — sans elle, « merci » lu par la voix russe serait servi au
 * français.
 */
const audioUrls = new Map<string, string | null>();
/** Requêtes en cours, pour qu'un double-clic ne déclenche pas deux appels. */
const pending = new Map<string, Promise<string | null>>();
let currentAudio: HTMLAudioElement | null = null;

const keyOf = (lang: SpeechLang, text: string) => `${lang}|${text}`;

/**
 * « Une synthèse est-elle en cours ? », exposé comme un abonnement.
 *
 * POURQUOI PAS UN SIMPLE useState DANS LA PAGE. La lecture automatique de
 * la révision vocale part d'un `useEffect` : y poser un setState place une
 * mise à jour dans le corps synchrone de l'effet, ce que React déconseille
 * (rendus en cascade). Or cette information n'appartient pas à React — elle
 * vit dans la Map `pending` de ce module. Le motif recommandé est donc
 * exactement celui-ci : un composant s'abonne, et le setState a lieu dans
 * le callback, quand l'état externe change.
 */
const busyListeners = new Set<(busy: boolean) => void>();
let wasBusy = false;

function notifyBusy() {
  const busy = pending.size > 0;
  if (busy === wasBusy) return; // pas de rendu si rien n'a changé
  wasBusy = busy;
  for (const listener of busyListeners) listener(busy);
}

/** Renvoie la fonction de désabonnement, pour un `useEffect` d'une ligne. */
export function onSpeechBusy(listener: (busy: boolean) => void): () => void {
  busyListeners.add(listener);
  listener(pending.size > 0);
  return () => {
    busyListeners.delete(listener);
  };
}

async function resolveAudioUrl(lang: SpeechLang, text: string): Promise<string | null> {
  const key = keyOf(lang, text);
  if (audioUrls.has(key)) return audioUrls.get(key)!;
  const inFlight = pending.get(key);
  if (inFlight) return inFlight;

  const request = fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, lang }),
  })
    .then((r) => (r.ok ? r.json() : { url: null }))
    .then((d: { url?: string | null }) => {
      const url = typeof d.url === "string" ? d.url : null;
      audioUrls.set(key, url);
      return url;
    })
    .catch(() => {
      audioUrls.set(key, null);
      return null;
    })
    .finally(() => {
      pending.delete(key);
      notifyBusy();
    });

  pending.set(key, request);
  notifyBusy();
  return request;
}

/**
 * Prononce un mot, avec repli sur la voix du navigateur.
 *
 * Le repli n'est pas un détail : il couvre la clé ElevenLabs absente, le
 * quota épuisé, la panne réseau et le navigateur qui refuse la lecture
 * automatique. Dans tous ces cas l'apprenant entend quelque chose plutôt
 * qu'un bouton mort — et en français, la voix du navigateur est même tout
 * à fait correcte sur un poste francophone.
 */
export async function speakIn(lang: SpeechLang, text: string) {
  if (typeof window === "undefined") return;

  // Coupe la prononciation précédente, quelle que soit sa source.
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  const url = await resolveAudioUrl(lang, text);
  if (!url) {
    speak(text, lang === "ru" ? "ru-RU" : "fr-FR");
    return;
  }

  try {
    const audio = new Audio(url);
    currentAudio = audio;
    await audio.play();
  } catch {
    // Lecture refusée (politique d'autoplay, fichier illisible) : la voix
    // du navigateur, elle, part d'un geste utilisateur déjà validé.
    currentAudio = null;
    speak(text, lang === "ru" ? "ru-RU" : "fr-FR");
  }
}

/** Raccourcis : la langue est presque toujours connue à l'appel. */
export const speakRu = (text: string) => speakIn("ru", text);
export const speakFr = (text: string) => speakIn("fr", text);

/**
 * Prépare l'audio du mot SUIVANT sans le jouer.
 *
 * En révision, le mot défile toutes les quelques secondes : sans ça, le
 * premier appel de chaque mot attend l'aller-retour réseau et le son
 * arrive après que l'apprenant a déjà lu. Le résultat est mis en cache,
 * donc la lecture est ensuite immédiate.
 */
export function prefetch(lang: SpeechLang, text: string | undefined) {
  if (text && !audioUrls.has(keyOf(lang, text))) void resolveAudioUrl(lang, text);
}

export const prefetchRu = (text: string | undefined) => prefetch("ru", text);

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Reconnaissance vocale, comme aide d'auto-vérification uniquement — le
 * transcript n'est jamais noté automatiquement (fiabilité trop variable
 * selon navigateur/accent), juste affiché pour que l'apprenant compare
 * lui-même à ce qu'il visait. Indisponible sur Safari/Firefox : le bouton
 * d'enregistrement se masque proprement dans ce cas (voir `supported`).
 */
function hasRecognition(): boolean {
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/** Rien à surveiller : la capacité du navigateur ne change pas en cours de visite. */
function subscribeNever(): () => void {
  return () => {};
}

export function useSpeechRecognition(lang: string) {
  // La présence de l'API est un état EXTERNE, pas un état React : elle
  // dépend du navigateur et ne change jamais. Un `useState(false)` corrigé
  // par un effet au montage donnait un rendu de plus à chaque page vocale —
  // et le linter le refuse à juste titre. `useSyncExternalStore` lit la
  // valeur au bon moment (le serveur rend `false`, le client la vraie), sans
  // second rendu ni écart d'hydratation. Même mécanique que ThemeToggle.
  const supported = useSyncExternalStore(subscribeNever, hasRecognition, () => false);

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  function start() {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return;
    setTranscript("");
    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e) => setTranscript(e.results[0]?.[0]?.transcript ?? "");
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  function stop() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  return { supported, listening, transcript, start, stop };
}
