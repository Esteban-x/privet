"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  suggestTranslation,
  type CustomVocabWord,
  type TranslationSuggestion,
} from "@/lib/vocabulary/custom";
import { loadAddWordFirstSide, saveAddWordFirstSide } from "@/lib/storage";
import { LoadingDots } from "@/components/ui/Skeleton";
import AiSpark from "@/components/ui/AiSpark";
import { PlusIcon, SwapIcon } from "@/components/ui/icons";
import Link from "next/link";
import { NOUNS } from "@/lib/grammar/nouns-data";
import CompletionList from "@/components/vocabulary/CompletionList";
import { completeFr, completeRu, type Completion } from "@/lib/vocabulary/autocomplete";

/**
   * Ajout d'un mot, dans le sens qu'on veut.
   *
   * DEUX PORTES D'ENTRÉE. On tape un mot russe entendu quelque part et sa
   * traduction arrive ; on tape un mot français et c'est le mot russe qui
   * arrive. Le champ rempli en premier décide du sens, et une flèche entre les
   * deux le montre. N'accepter que le russe supposait qu'on part toujours de
   * ce qu'on a entendu, jamais de ce qu'on cherche à dire.
   *
   * LA SUGGESTION REMPLIT, ELLE NE VERROUILLE PAS. Tant que l'apprenant n'a
   * pas touché le champ d'en face, celui-ci porte un liseré et un badge ; sa
   * première frappe le fait basculer en « la sienne » et la proposition ne
   * revient plus. Écrire soi-même ne demande donc aucun geste — c'est le
   * comportement par défaut d'un champ de texte, la suggestion se contente de
   * le pré-remplir.
   *
   * COÛT : un appel par mot saisi, déclenché après une pause de frappe et
   * annulé si la saisie repart. Les 451 noms de la banque curée répondent sans
   * appel du tout, côté serveur, dans les deux sens.
   */

const DEBOUNCE_MS = 650;
/** Taille de la banque curée, citée dans le message de refus. */
const NOUN_COUNT = NOUNS.length;

export default function AddWordForm({
  onAdd,
}: {
  onAdd: (word: {
    ru: string;
    fr: string;
    transliteration?: string;
  }) => Promise<CustomVocabWord | null>;
}) {
  const [ru, setRu] = useState("");
  const [fr, setFr] = useState("");
  /**
     * Quelle langue occupe la PREMIÈRE colonne. Purement visuel : `ru` et
     * `fr` restent chacun leur langue, seul l'ordre d'affichage change — un
     * échange des valeurs transformerait « спасибо/merci » en
     * « merci/спасибо », ce qui serait faux.
     *
     * Le choix est mémorisé : quelqu'un qui part systématiquement du
     * français ne doit pas le redire à chaque mot.
     */
  const [frFirst, setFrFirst] = useState(() => loadAddWordFirstSide() === "fr");
  const [transliteration, setTransliteration] = useState("");
  const [showTranslit, setShowTranslit] = useState(false);

  const [suggestion, setSuggestion] = useState<TranslationSuggestion | null>(null);
  /**
   * Motif d'un REFUS de suggestion, distinct d'une absence de résultat.
   *
   * Sans cette distinction, un compte gratuit — pour lequel la suggestion
   * automatique est fermée — voyait le champ d'en face rester vide, sans
   * rien pour dire s'il s'agissait d'un mot introuvable, d'une panne, ou
   * d'une fonctionnalité qu'il n'a pas. C'est le pire des trois états : on
   * ne peut ni corriger, ni réessayer, ni comprendre.
   */
  const [blocked, setBlocked] = useState<{ upgrade: boolean } | null>(null);

  /**
   * La complétion locale, calculée à CHAQUE FRAPPE sans réseau ni token.
   *
   * Elle ne remplace pas la suggestion du modèle, elle la précède : la
   * banque curée répond en une fraction de milliseconde pour les 583 mots
   * qu'elle connaît — avec l'accent tonique correct et une traduction relue
   * à la main — pendant que le modèle, lui, sert la longue traîne après la
   * pause de frappe. Deux mécanismes, deux rôles.
   */
  const [openList, setOpenList] = useState<"ru" | "fr" | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const completions = useMemo(() => {
    if (openList === "ru") return completeRu(ru);
    if (openList === "fr") return completeFr(fr);
    return [];
  }, [openList, ru, fr]);

  /**
   * La paire retenue dans le menu de complétion, sous la forme « ru|fr ».
   *
   * ELLE EST EN ÉTAT, PAS EN REF, et c'est imposé par le compilateur React :
   * `pick` est appelée depuis un composant enfant, donc tout ce qu'elle
   * touche en sort. Muter une ref depuis là ferait considérer cette ref
   * comme figée PARTOUT, y compris dans `reset()` — le compilateur refusait
   * la construction pour cette raison. L'état, lui, se met à jour d'où l'on
   * veut.
   *
   * Son rôle : empêcher l'effet de suggestion de repartir sur une paire
   * qu'on vient de choisir dans la banque, laquelle a déjà répondu, et
   * mieux que le modèle ne le ferait.
   */
  const [pickedPair, setPickedPair] = useState<string | null>(null);

  /** Insère une proposition dans LES DEUX champs : c'est une paire. */
  function pick(item: Completion) {
    setRu(item.ru);
    setFr(item.fr);
    setPickedPair(`${item.ru}|${item.fr}`);
    setFilled(null);
    setSuggestion(null);
    setBlocked(null);
    setOpenList(null);
    setActiveIndex(0);
  }

  /**
   * Le clavier du champ.
   *
   * TAB COMPLÈTE, et c'est le geste demandé. Il faut donc le détourner de
   * son rôle habituel — passer au champ suivant — mais UNIQUEMENT quand une
   * proposition est affichée : sinon on emprisonnerait la tabulation dans
   * le formulaire, ce qui est l'un des pires défauts d'accessibilité qu'on
   * puisse introduire.
   */
  function onFieldKeyDown(e: React.KeyboardEvent<HTMLInputElement>, side: "ru" | "fr") {
    if (openList !== side || completions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % completions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + completions.length) % completions.length);
    } else if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      pick(completions[activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpenList(null);
    }
  }
  const [suggesting, setSuggesting] = useState(false);
  /** Le champ actuellement rempli par une proposition, s'il y en a un. */
  const [filled, setFilled] = useState<"ru" | "fr" | null>(null);
  /** Le champ que l'apprenant pilote — sert aussi à orienter la flèche. */
  const [driver, setDriver] = useState<"ru" | "fr" | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const firstInput = useRef<HTMLInputElement>(null);
  // « L'apprenant a-t-il écrit dans ce champ ? » est une information de
  // saisie : en refs, elles sont lues à jour dans le callback de la requête
  // sans le relancer à chaque frappe.
  const ruTouched = useRef(false);
  const frTouched = useRef(false);
  const translitTouched = useRef(false);
  /** Dernière requête émise, pour ne pas la rejouer quand elle se remplit. */
  const lastQuery = useRef("");
  /**
   * Numéro de la dernière requête lancée. Une réponse dont le numéro n'est
   * plus celui-ci est périmée : on la jette. C'est ce compteur qui remplace
   * l'annulation — voir la note dans l'effet ci-dessous.
   */
  const requestId = useRef(0);
  /**
   * Nombre de requêtes réellement en vol.
   *
   * SÉPARÉ DU NUMÉRO, et c'est nécessaire : le numéro dit QUELLE réponse
   * compte, ce compteur dit S'IL FAUT ENCORE ATTENDRE. Les confondre laisse
   * l'indicateur de chargement allumé pour toujours dès qu'une réponse est
   * jetée sans qu'une autre lui succède — par exemple quand l'apprenant
   * efface jusqu'à une seule lettre pendant qu'une requête est partie.
   */
  const inFlight = useRef(0);

  function toggleFirstSide() {
    const next = !frFirst;
    setFrFirst(next);
    saveAddWordFirstSide(next ? "fr" : "ru");
    // LE FOCUS APRÈS LE RENDU, pas pendant. `firstInput` ne désignera le
    // nouveau premier champ qu'une fois React repassé : appelé tout de
    // suite, `focus()` visait encore l'ANCIEN premier champ, ce qui donnait
    // l'impression que le curseur — et donc le texte qu'on continuait de
    // taper — restait du mauvais côté après l'inversion.
    requestAnimationFrame(() => firstInput.current?.focus());
  }

  useEffect(() => {
    // Un seul champ touché : c'est lui qui pilote. Les deux touchés : il n'y
    // a plus rien à proposer.
    const side =
      ruTouched.current && !frTouched.current
        ? "ru"
        : frTouched.current && !ruTouched.current
          ? "fr"
          : null;
    if (!side) return;
    const word = (side === "ru" ? ru : fr).trim();
    const query = `${side}:${word}`;
    // Le remplissage du champ d'en face rejoue cet effet : sans cette garde
    // on redemanderait la même chose en boucle.
    if (word.length < 2 || query === lastQuery.current) return;
    // Paire choisie dans la banque : rien à demander au modèle.
    if (pickedPair === `${ru}|${fr}`) return;

    // NUMÉROTATION PLUTÔT QU'ANNULATION — le modèle des traducteurs à
    // saisie continue.
    //
    // Deux tentatives avec `AbortController` ont laissé fuir un
    // `AbortError` jusqu'à l'écran : une requête annulée REJETTE, et ce
    // rejet peut surgir à plusieurs endroits (la requête, la lecture du
    // corps, la couche de transport du framework). Il suffit d'un chemin
    // oublié pour que l'erreur remonte, et se battre garde après garde
    // revenait à traiter le symptôme.
    //
    // Ici, plus rien n'est annulé : chaque requête reçoit un NUMÉRO, et sa
    // réponse n'est prise en compte que si ce numéro est encore le dernier
    // émis. Une réponse périmée est simplement ignorée. Aucune promesse
    // n'est jamais rejetée par nous, donc aucune ne peut fuir — c'est une
    // propriété de la structure, pas d'un filet.
    //
    // Le prix : une requête abandonnée va au bout de son aller-retour.
    // Compte tenu de la temporisation de frappe (650 ms), c'est au plus un
    // appel par pause réellement marquée — la banque curée répondant en
    // plus sans modèle pour ses 451 noms.
    const id = ++requestId.current;

    const timer = setTimeout(async () => {
      lastQuery.current = query;
      inFlight.current += 1;
      setSuggesting(true);

      let data: Awaited<ReturnType<typeof suggestTranslation>> | null = null;
      try {
        data = await suggestTranslation(word, side);
      } catch {
        // Réseau, serveur, réponse illisible : la suggestion est un
        // confort, jamais un prérequis. On ne signale rien.
      } finally {
        // L'indicateur s'éteint dès que PLUS RIEN n'est en vol — que la
        // réponse ait servi ou non. C'est ce qui évite des points de
        // chargement qui tournent indéfiniment après une réponse jetée.
        inFlight.current -= 1;
        if (inFlight.current === 0) setSuggesting(false);
      }

      // LE TEST QUI REMPLACE L'ANNULATION. Une réponse qui n'est plus la
      // dernière attendue est jetée : une requête plus récente la
      // remplacera, ou l'apprenant a changé d'avis.
      if (id !== requestId.current) return;
      if (!data) return;
      setBlocked(data.quota ? { upgrade: data.quota.upgrade } : null);
      setSuggestion(data.suggestion);
      if (!data.suggestion) return;

      // Pré-remplissage : uniquement dans le champ d'en face, et uniquement
      // s'il n'a pas été touché. Écraser ce que l'apprenant a écrit serait
      // exactement le contraire de « garder la sienne ».
      if (side === "ru" && !frTouched.current) {
        setFr(data.suggestion.fr);
        setFilled("fr");
      } else if (side === "fr" && !ruTouched.current) {
        setRu(data.suggestion.ru);
        setFilled("ru");
      }
      if (data.suggestion.transliteration && !translitTouched.current) {
        setTransliteration(data.suggestion.transliteration);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      // Invalide la requête en vol : sa réponse arrivera peut-être, elle
      // ne sera plus la dernière. C'est tout ce que faisait `abort()`, sans
      // le rejet.
      requestId.current += 1;
    };
  }, [ru, fr, pickedPair]);

  function reset() {
    setRu("");
    setFr("");
    setTransliteration("");
    setSuggestion(null);
    setBlocked(null);
    setPickedPair(null);
    setFilled(null);
    setDriver(null);
    setShowTranslit(false);
    ruTouched.current = false;
    frTouched.current = false;
    translitTouched.current = false;
    lastQuery.current = "";
    firstInput.current?.focus();
  }

  function edit(side: "ru" | "fr", value: string) {
    const touched = side === "ru" ? ruTouched : frTouched;
    touched.current = value.length > 0;
    if (side === "ru") setRu(value);
    else setFr(value);
    // Le champ redevient celui de l'apprenant dès qu'il y écrit.
    if (filled === side) setFilled(null);
    setDriver(
      ruTouched.current && !frTouched.current
        ? "ru"
        : frTouched.current && !ruTouched.current
          ? "fr"
          : null,
    );
    if (value.trim().length < 2) setSuggestion(null);
    // Chaque frappe rouvre la liste et repart de la première proposition :
    // garder l'index précédent pointerait sur un mot qui n'a plus rien à
    // voir avec ce qui est écrit.
    setOpenList(side);
    setActiveIndex(0);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ru.trim() || !fr.trim() || submitting) return;
    setSubmitting(true);
    const added = await onAdd({
      ru: ru.trim(),
      fr: fr.trim(),
      transliteration: transliteration.trim() || undefined,
    });
    setSubmitting(false);
    if (added) {
      setJustAdded(added.ru);
      reset();
    }
  }

  // Une seule marque, sur le champ concerné : d'où vient ce qui s'y trouve,
  // et si le modèle en répond. Le champ reste modifiable à la frappe — c'est
  // l'affordance, elle n'a pas besoin d'un bouton pour la répéter.
  const badge =
    suggestion && filled ? (
      suggestion.source === "bank" ? (
        <span
          className="rounded-full bg-success/15 px-2 py-0.5 font-display text-[10px] font-bold normal-case tracking-normal text-success"
          title="Traduction vérifiée à la main — celle qui sert aussi aux exercices de déclinaison"
        >
          ✓ vérifié
        </span>
      ) : (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-display text-[10px] font-bold normal-case tracking-normal ${
            suggestion.confident
              ? "bg-accent2/15 text-accent2"
              : "bg-accent2-deep/20 text-accent2-deep"
          }`}
          title={
            suggestion.confident
              ? "Proposition générée par l'IA — corrige-la si besoin"
              : "L'IA n'est pas sûre de cette traduction — vérifie-la"
          }
        >
          <AiSpark className="h-3 w-3" />
          {suggestion.confident ? "proposé" : "à vérifier"}
        </span>
      )
    ) : null;

  // Définis ici pour pouvoir être ORDONNÉS dans la grille. `firstInput`
  // suit l'ordre d'affichage : après un ajout, le curseur doit revenir dans
  // le champ par lequel l'apprenant commence, pas systématiquement le russe.
  const ruField = (
    <Field
      key="ru"
      inputRef={frFirst ? undefined : firstInput}
      label="Russe"
      value={ru}
      placeholder="спасибо"
      suggested={filled === "ru"}
      badge={filled === "ru" ? badge : null}
      loading={suggesting && driver === "fr"}
      onChange={(v) => edit("ru", v)}
      onKeyDown={(e) => onFieldKeyDown(e, "ru")}
      onFocus={() => setOpenList("ru")}
      onBlur={() => setOpenList(null)}
      listId="ru-completions"
      activeId={openList === "ru" && completions.length ? `ru-completions-${activeIndex}` : undefined}
      menu={
        openList === "ru" && completions.length > 0 ? (
          <CompletionList
            items={completions}
            activeIndex={activeIndex}
            onPick={(item) => pick(item)}
            onHover={setActiveIndex}
            listId="ru-completions"
          />
        ) : undefined
      }
      spellCheck={false}
    />
  );

  const frField = (
    <Field
      key="fr"
      inputRef={frFirst ? firstInput : undefined}
      label="Français"
      value={fr}
      placeholder="merci"
      suggested={filled === "fr"}
      badge={filled === "fr" ? badge : null}
      loading={suggesting && driver === "ru"}
      onChange={(v) => edit("fr", v)}
      onKeyDown={(e) => onFieldKeyDown(e, "fr")}
      onFocus={() => setOpenList("fr")}
      onBlur={() => setOpenList(null)}
      listId="fr-completions"
      activeId={openList === "fr" && completions.length ? `fr-completions-${activeIndex}` : undefined}
      menu={
        openList === "fr" && completions.length > 0 ? (
          <CompletionList
            items={completions}
            activeIndex={activeIndex}
            onPick={(item) => pick(item)}
            onHover={setActiveIndex}
            listId="fr-completions"
          />
        ) : undefined
      }
    />
  );

  return (
    <form onSubmit={submit} className="surface rounded-2xl p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent"
          >
            <PlusIcon className="h-[18px] w-[18px]" />
          </span>
          <h2 className="font-display text-base font-bold">Ajouter un mot</h2>
        </div>
        {justAdded && (
          <p className="animate-fade-in font-display text-xs text-success">
            ✓ « {justAdded} » ajouté
          </p>
        )}
      </div>

      {/* Les deux champs à égalité : commencer par l'un ou par l'autre est
         le même geste, et le bouton central décide seulement lequel tombe
         sous le curseur en premier. La flèche passive qui occupait cette
         place disait dans quel sens la proposition circulait — le liseré
         et le badge portés par le champ rempli le disent déjà, et mieux. */}
      <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
        {frFirst ? frField : ruField}

        <button
          type="button"
          onClick={toggleFirstSide}
          aria-label={frFirst ? "Commencer par le russe" : "Commencer par le français"}
          title={frFirst ? "Commencer par le russe" : "Commencer par le français"}
          className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-full surface-interactive text-muted duration-200 hover:scale-110 hover:text-accent active:scale-95 sm:mb-2.5 sm:self-center"
          style={{ transitionTimingFunction: "var(--ease)" }}
        >
          <SwapIcon className="h-4 w-4" />
        </button>

        {frFirst ? ruField : frField}
      </div>

      {/* Une ligne, pas un bloc : c'est une information de contexte pendant
          la saisie, pas un mur. Le formulaire reste entièrement utilisable —
          on écrit simplement les deux côtés soi-même. */}
      {blocked && (
        <p className="mt-3 flex flex-wrap items-center gap-1.5 font-display text-xs text-muted">
          <AiSpark className="h-3.5 w-3.5 shrink-0 text-accent2" />
          {blocked.upgrade ? (
            <>
              La traduction automatique fait partie de{" "}
              <Link
                href="/premium"
                className="font-semibold text-accent underline-offset-2 hover:underline"
              >
                Privetik Pro
              </Link>
              . Les {NOUN_COUNT} mots de la banque restent proposés gratuitement.
            </>
          ) : (
            <>Plafond de suggestions atteint pour aujourd&apos;hui. Écris la traduction toi-même.</>
          )}
        </p>
      )}

      {showTranslit ? (
        <label className="mt-3 block">
          <span className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-wide text-muted">
            Translittération
          </span>
          <input
            value={transliteration}
            onChange={(e) => {
              translitTouched.current = e.target.value.length > 0;
              setTransliteration(e.target.value);
            }}
            placeholder="spassiba"
            autoComplete="off"
            maxLength={100}
            className="w-full rounded-xl surface px-3.5 py-2.5 font-display text-sm text-text placeholder:text-muted/50 field-focus focus:outline-none"
          />
        </label>
      ) : (
        <button
          type="button"
          onClick={() => setShowTranslit(true)}
          className="mt-3 font-display text-xs font-semibold text-muted underline-offset-2 hover:text-accent hover:underline"
        >
          + Translittération
          {transliteration && <span className="ml-1.5 text-accent2">({transliteration})</span>}
        </button>
      )}

      {/* Le bouton ne se réécrit pas en « Ajout… » : le libellé et les points
         occupent la même case de grille et se croisent en fondu, sans que la
         largeur du texte ni la hauteur de la ligne ne bougent. Remplacer le
         mot faisait clignoter le bouton à chaque ajout. */}
      <button
        type="submit"
        disabled={submitting || !ru.trim() || !fr.trim()}
        aria-busy={submitting}
        className={`btn btn-primary btn-sheen mt-5 grid h-12 w-full place-items-center rounded-xl px-4 font-display text-sm ${
          submitting ? "cursor-wait" : "disabled:cursor-not-allowed disabled:opacity-40"
        }`}
      >
        <span
          className={`col-start-1 row-start-1 transition-[opacity,transform] duration-200 ${
            submitting ? "-translate-y-1 opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          Ajouter le mot
        </span>
        <span
          aria-hidden
          className={`col-start-1 row-start-1 flex gap-1.5 transition-[opacity,transform] duration-200 ${
            submitting ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
          }`}
        >
          <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-white [animation-delay:0ms]" />
          <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-white [animation-delay:160ms]" />
          <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-white [animation-delay:320ms]" />
        </span>
      </button>
    </form>
  );
}

function Field({
  inputRef,
  label,
  value,
  placeholder,
  suggested,
  badge,
  loading,
  onChange,
  onKeyDown,
  onBlur,
  onFocus,
  menu,
  activeId,
  listId,
  spellCheck = true,
}: {
  inputRef?: React.RefObject<HTMLInputElement | null>;
  label: string;
  value: string;
  placeholder: string;
  suggested: boolean;
  badge: React.ReactNode;
  loading: boolean;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  /** Le menu de complétion, positionné par le <label> relatif. */
  menu?: React.ReactNode;
  activeId?: string;
  listId?: string;
  spellCheck?: boolean;
}) {
  return (
    // `relative` : c'est ce bloc qui ancre le menu de complétion, pas la
    // grille — sinon le menu se placerait par rapport aux deux colonnes et
    // déborderait sur le champ voisin.
    <label className="relative block">
      <span className="mb-1.5 flex items-center justify-between gap-2 font-display text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
        {loading ? (
          <span className="normal-case">
            <LoadingDots label="" />
          </span>
        ) : (
          badge
        )}
      </span>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        onFocus={onFocus}
        // `autoComplete="off"` ne suffit pas à écarter le menu du
        // navigateur sur Chrome ; `role="combobox"` le fait, et c'est de
        // toute façon le rôle correct pour un champ qui pilote une liste.
        role={menu ? "combobox" : undefined}
        aria-expanded={menu ? true : undefined}
        aria-controls={listId}
        aria-activedescendant={activeId}
        aria-autocomplete={menu ? "list" : undefined}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={spellCheck}
        maxLength={200}
        /* Le focus se signale par un ANNEAU en plus de la bordure : sur un
           champ, la seule bordure qui change de teinte est trop discrète
           pour dire où l'on tape, surtout en thème clair. L'anneau est en
           `box-shadow`, donc il ne déplace rien. */
        className={`h-12 w-full rounded-xl border bg-bg px-4 font-display text-base text-text transition-shadow duration-200 placeholder:text-muted/50 field-focus focus:outline-none ${
          suggested ? "border-accent2/60" : "border-border"
        }`}
        style={{ transitionTimingFunction: "var(--ease)" }}
      />
      {menu}
    </label>
  );
}
