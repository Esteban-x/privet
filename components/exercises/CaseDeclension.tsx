"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CaseInfo, FrenchGender, Noun } from "@/lib/grammar/types";
import { CefrLevel } from "@/lib/supabase/types";
import { declineNoun } from "@/lib/grammar/decline";
import { fillFrenchBlank, frenchNounPhrase } from "@/lib/grammar/french-article";
import {
  CaseExercise,
  DECLINABLE_NOUNS,
  checkAnswer,
  generateAdjectiveExercise,
  generateIsolatedExercise,
  generateMcqExercise,
  generateNumeralExercise,
  generateSentenceExercise,
} from "@/lib/grammar/exercise-generator";
import { ADJECTIVES } from "@/lib/grammar/adjectives-data";
import { PROPER_NOUN_TRIGGER_ID, triggersForCase } from "@/lib/grammar/triggers";
import { getNoun } from "@/lib/grammar/nouns-data";
import { pickWeightedTrigger } from "@/lib/grammar/exercise-selector";
import {
  accuracyFor,
  loadCaseProgress,
  loadTriggerProgress,
  recordCaseAttempt,
  recordTriggerAttempt,
  syncCaseAttempt,
} from "@/lib/storage";
import { declinableToNoun, fetchDeclinableWords } from "@/lib/vocabulary/custom";

type Tab = "isolated" | "sentence" | "mcq" | "numeral" | "adjective";
type Feedback = { status: "correct" | "incorrect" | "revealed"; exercise: CaseExercise; picked?: string } | null;
type TriggerStats = Record<string, { attempts: number; correct: number }>;

const TAB_LABEL: Record<Tab, string> = {
  isolated: "Déclinaison isolée",
  sentence: "Phrase",
  mcq: "QCM",
  numeral: "Chiffres",
  adjective: "Accord adjectif",
};

const GENDER_LABEL: Record<string, string> = {
  masculine: "masc.",
  feminine: "fém.",
  neuter: "neutre",
};

const COUNT_FORM_LABEL: Record<string, string> = {
  "nom-sg": "1 (et 21, 31…) → nominatif singulier",
  "gen-sg": "2-4 (et 22-24…) → génitif singulier",
  "gen-pl": "0, 5-20, 25-30… → génitif pluriel",
};

// Filet de sécurité si l'IA choisit un emprunt indéclinable sans le
// signaler via son champ "indeclinable" — liste des cas les plus courants
// (le prompt lui demande déjà explicitement de les éviter, voir
// lib/ai/prompts.ts).
const KNOWN_INDECLINABLE = new Set([
  "кофе",
  "метро",
  "такси",
  "кино",
  "меню",
  "пальто",
  "кафе",
  "шоссе",
  "купе",
  "радио",
  "какао",
  "пианино",
  "бюро",
  "жалюзи",
]);

export default function CaseDeclension({
  caseInfo,
  userLevel,
}: {
  caseInfo: CaseInfo;
  userLevel?: CefrLevel;
}) {
  const tabs: Tab[] = useMemo(
    () =>
      caseInfo.id === "genitive"
        ? ["isolated", "sentence", "mcq", "numeral", "adjective"]
        : ["isolated", "sentence", "mcq", "adjective"],
    [caseInfo.id]
  );

  const [tab, setTab] = useState<Tab>("isolated");
  const [exercise, setExercise] = useState<CaseExercise | null>(null);
  const [exerciseSeq, setExerciseSeq] = useState(0); // incrémenté à chaque nouvel exercice, pour rejouer l'animation d'entrée
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [streak, setStreak] = useState(0);
  const [progressTick, setProgressTick] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  // Incrémenté à chaque loadExercise("sentence") : permet à un appel IA
  // devenu périmé (l'utilisateur a changé d'onglet/de cas entre-temps) de
  // se reconnaître obsolète à son retour et de ne PAS écraser l'exercice
  // affiché depuis — un simple AbortController ne suffirait pas à lui seul
  // ici puisque le repli sur le gabarit fixe (catch) doit, lui aussi, être
  // ignoré s'il est périmé.
  const aiRequestSeq = useRef(0);
  // Derniers lemmes vus en mode "Phrase" IA (tous cas confondus, cette
  // session) — envoyés au prompt pour qu'il évite de reproposer les mêmes
  // mots en boucle (typiquement le mot le plus "évident" d'un thème avec un
  // seul thème choisi). Volontairement en mémoire seule (pas persisté) :
  // juste assez pour casser une répétition immédiate, pas un vrai suivi de
  // fréquence.
  const recentAiLemmas = useRef<string[]>([]);

  function applyExercise(ex: CaseExercise) {
    setExercise(ex);
    setExerciseSeq((s) => s + 1);
  }

  const [personalNouns, setPersonalNouns] = useState<Noun[]>([]);
  const [usePersonalVocab, setUsePersonalVocab] = useState(false);
  const [triggerStats, setTriggerStats] = useState<TriggerStats>({});

  // Vocabulaire perso classifié (genre connu) : vient enrichir le pool par
  // défaut si l'utilisateur en a assez pour que ce soit utile.
  useEffect(() => {
    fetchDeclinableWords()
      .then(({ words }) => {
        const nouns = words.map(declinableToNoun);
        setPersonalNouns(nouns);
        if (nouns.length >= 5) setUsePersonalVocab(true);
      })
      .catch(() => {});
  }, []);

  // Progression par déclencheur : locale d'abord (fonctionne hors-ligne),
  // complétée par le serveur si connecté — pilote le tirage adaptatif.
  useEffect(() => {
    const local = loadTriggerProgress();
    const initial: TriggerStats = {};
    for (const [id, entry] of Object.entries(local)) {
      initial[id] = { attempts: entry.attempts, correct: entry.correct };
    }
    setTriggerStats(initial);

    fetch("/api/cases/progress")
      .then((r) => r.json())
      .then((data: { triggerProgress?: { case_id: string; trigger_id: string; attempts: number; correct: number }[] }) => {
        const rows = data.triggerProgress ?? [];
        if (!rows.length) return;
        setTriggerStats((prev) => {
          const next = { ...prev };
          for (const row of rows) next[row.trigger_id] = { attempts: row.attempts, correct: row.correct };
          return next;
        });
      })
      .catch(() => {});
  }, []);

  // DECLINABLE_NOUNS est déjà filtré, mais le vocabulaire perso peut
  // contenir un mot classifié indéclinable (кофе, метро...) — filtré ici
  // aussi, sinon un exercice de cas lui inventerait une fausse déclinaison.
  const pool = useMemo(() => {
    const combined =
      usePersonalVocab && personalNouns.length > 0 ? [...DECLINABLE_NOUNS, ...personalNouns] : DECLINABLE_NOUNS;
    return combined.filter((n) => !n.indeclinable);
  }, [usePersonalVocab, personalNouns]);

  async function loadExercise(nextTab: Tab) {
    setFeedback(null);
    setInput("");
    setVerifying(false);
    // Invalide toute requête IA encore en vol : quel que soit le prochain
    // onglet, sa réponse tardive ne doit plus pouvoir écraser l'exercice
    // affiché entre-temps.
    aiRequestSeq.current += 1;

    if (nextTab === "isolated") {
      applyExercise(generateIsolatedExercise(caseInfo.id, pool));
      return;
    }
    if (nextTab === "numeral") {
      applyExercise(generateNumeralExercise(pool));
      return;
    }
    if (nextTab === "mcq") {
      const trigger = pickWeightedTrigger(triggersForCase(caseInfo.id), triggerStats, userLevel);
      applyExercise(generateMcqExercise(caseInfo.id, pool, trigger));
      return;
    }
    if (nextTab === "adjective") {
      const trigger = pickWeightedTrigger(triggersForCase(caseInfo.id), triggerStats, userLevel);
      applyExercise(generateAdjectiveExercise(caseInfo.id, pool, ADJECTIVES, trigger));
      return;
    }

    // "Phrase" : IA en premier (personnalisée, ciblée sur le déclencheur
    // choisi), repli SILENCIEUX sur le gabarit fixe si indisponible/erreur.
    const trigger = pickWeightedTrigger(triggersForCase(caseInfo.id), triggerStats, userLevel);

    // Exception : "Меня зовут ___" n'a de sens qu'avec un prénom (jamais un
    // nom commun) et reste toujours au nominatif (aucune vraie déclinaison
    // à tester) — le gabarit fixe + la banque de prénoms réservée
    // (RUSSIAN_NAMES, voir exercise-generator.ts) couvrent déjà l'exercice
    // parfaitement. Pas de valeur à risquer une phrase IA imprévisible ici.
    if (trigger.id === PROPER_NOUN_TRIGGER_ID) {
      applyExercise(generateSentenceExercise(caseInfo.id, pool, trigger));
      return;
    }

    const requestId = aiRequestSeq.current;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: caseInfo.id,
          triggerId: trigger.id,
          recentLemmas: recentAiLemmas.current,
        }),
      });
      if (requestId !== aiRequestSeq.current) return; // périmé (nouvel exercice demandé entre-temps)
      if (!res.ok) throw new Error("ai unavailable");
      const { exercise: ai, pool_noun_id: poolNounId } = await res.json();
      // Le prompt demande explicitement d'éviter les emprunts indéclinables
      // (кофе, метро...), mais si le modèle en choisit quand même un —
      // qu'il l'ait signalé via "indeclinable" ou pas —, décliner ce mot
      // produirait une fausse forme (ex. "кофеа"). On traite ça comme un
      // échec IA : repli silencieux sur le gabarit fixe (pool sans mots
      // indéclinables, voir plus haut).
      if (ai.indeclinable || KNOWN_INDECLINABLE.has((ai.lemma ?? "").toLowerCase())) {
        throw new Error("indeclinable lemma");
      }
      if (ai.lemma) {
        // Fenêtre glissante : garde les ~12 plus récents pour rester un
        // signal utile côté prompt sans le laisser grossir indéfiniment.
        recentAiLemmas.current = [...recentAiLemmas.current, ai.lemma].slice(-12);
      }
      const hint: string = (ai.hint || ai.lemma || "").trim();
      const frenchGender: FrenchGender = ai.french_gender === "f" ? "f" : "m";
      // Le serveur ne renvoie un pool_noun_id que pour un mot de la banque
      // curée (jamais le vocabulaire perso, qui n'a pas cette donnée) — s'il
      // est présent, on va chercher l'objet Noun complet plutôt que d'en
      // reconstruire un de zéro à partir des seuls champs JSON, pour ne pas
      // perdre d'éventuelles formes irrégulières mémorisées (noun.irregular).
      const noun: Noun = (poolNounId && getNoun(poolNounId)) || {
        id: `ai:${ai.lemma}`,
        lemma: ai.lemma,
        translation: hint,
        frenchGender,
        gender: ai.gender,
        animacy: ai.animate ? "animate" : "inanimate",
        stemType: "hard",
      };
      // Certains déclencheurs imposent le pluriel (много/мало/несколько,
      // среди, "мн. число"...) — ignoré ici, la forme attendue était
      // toujours calculée au singulier même quand l'IA écrivait à raison
      // une phrase au pluriel (ex. "музыканты", pas "музыкант").
      const plural = trigger.plural ?? false;
      const result = declineNoun(noun, caseInfo.id, plural);
      // Filet de sécurité : le prompt demande une traduction française sans
      // trou, mais si le modèle en laisse quand même un (ambiguïté du style
      // "sans ___" — impossible de deviner sucre/lait sans indice), on le
      // comble nous-mêmes avec le hint (et l'article approprié) plutôt que
      // de laisser l'apprenant deviner à l'aveugle.
      const sentenceFr =
        hint && ai.sentence_fr?.includes("___")
          ? fillFrenchBlank(ai.sentence_fr, frenchNounPhrase(hint, frenchGender, trigger.article, plural))
          : ai.sentence_fr;
      applyExercise({
        kind: "sentence-ai",
        noun,
        targetCase: caseInfo.id,
        plural,
        correctForm: result.form,
        ruleApplied: result.ruleApplied,
        trigger,
        sentenceTemplate: ai.sentence_ru,
        sentenceFr,
        hint,
      });
    } catch {
      if (requestId === aiRequestSeq.current) {
        applyExercise(generateSentenceExercise(caseInfo.id, pool, trigger));
      }
    } finally {
      if (requestId === aiRequestSeq.current) setAiLoading(false);
    }
  }

  useEffect(() => {
    loadExercise(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, caseInfo.id]);

  const progress = useMemo(() => {
    const map = loadCaseProgress();
    if (!exercise) return null;
    const entry = map[`${caseInfo.id}:${exercise.noun.gender}`];
    return accuracyFor(entry);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressTick, exercise, caseInfo.id]);

  function recordResult(isCorrect: boolean, picked?: string, revealed = false) {
    if (!exercise) return;
    recordCaseAttempt(caseInfo.id, exercise.noun.gender, isCorrect);
    // Vérifiable côté serveur seulement si le nom vient de la banque curée ou
    // du vocabulaire perso (identifiable par id) et que l'exercice ne dépend
    // pas d'une phrase générée par IA — le serveur recalcule alors la forme
    // attendue lui-même plutôt que de faire confiance au booléen `isCorrect`
    // (qui reste envoyé en repli pour les cas non vérifiables).
    const verifiable = !exercise.noun.id.startsWith("ai:");
    syncCaseAttempt(caseInfo.id, exercise.noun.gender, isCorrect, exercise.trigger?.id, {
      nounId: exercise.noun.id,
      plural: exercise.plural,
      userAnswer: picked ?? input,
      verifiable,
      adjectiveId: exercise.adjective?.id,
    });
    if (exercise.trigger) {
      const triggerId = exercise.trigger.id;
      recordTriggerAttempt(triggerId, isCorrect);
      setTriggerStats((prev) => {
        const cur = prev[triggerId] ?? { attempts: 0, correct: 0 };
        return { ...prev, [triggerId]: { attempts: cur.attempts + 1, correct: cur.correct + (isCorrect ? 1 : 0) } };
      });
    }
    setFeedback({ status: revealed ? "revealed" : isCorrect ? "correct" : "incorrect", exercise, picked });
    setStreak((s) => (isCorrect ? s + 1 : 0));
    setProgressTick((t) => t + 1);
  }

  async function submit() {
    if (!exercise || !input.trim() || verifying) return;
    if (checkAnswer(exercise, input)) {
      recordResult(true);
      return;
    }
    // Filet de sécurité IA : le moteur de règles dit "faux", mais avant
    // d'afficher ça à l'apprenant on demande une seconde vérification —
    // couvre à la fois une vraie faute (confirmée par l'IA) ET une
    // variante correcte que la comparaison de chaînes aurait refusée à
    // tort (accent, orthographe alternative, ou bug du moteur lui-même).
    // Ne coûte des tokens QUE sur une réponse déjà jugée fausse, jamais
    // sur le chemin heureux.
    setVerifying(true);
    try {
      const res = await fetch("/api/cases/verify-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lemma: exercise.noun.lemma,
          gender: exercise.noun.gender,
          animacy: exercise.noun.animacy,
          targetCase: exercise.targetCase,
          plural: exercise.plural,
          computedForm: exercise.correctForm,
          userAnswer: input,
        }),
      });
      const data = await res.json().catch(() => ({}));
      recordResult(Boolean(data.acceptable));
    } catch {
      recordResult(false);
    } finally {
      setVerifying(false);
    }
  }

  function selectOption(opt: string) {
    if (!exercise || feedback) return;
    recordResult(opt === exercise.correctForm, opt);
  }

  // Pour quelqu'un qui ne sait vraiment pas — évite de taper n'importe quoi
  // juste pour débloquer "Vérifier" et voir la réponse (ou, en QCM, de
  // cliquer une option au hasard). Compte comme un échec côté progression
  // (même logique que "incorrect" : la maîtrise doit encore progresser sur
  // ce déclencheur), mais affiché sans le ton "faute" du rouge.
  function reveal() {
    if (!exercise || feedback) return;
    recordResult(false, undefined, true);
  }

  function nextExercise() {
    loadExercise(tab);
  }

  if (!exercise) return null;

  const isMcq = exercise.kind === "trigger-mcq";
  const isSentenceLike = exercise.kind === "sentence-fixed" || exercise.kind === "sentence-ai" || isMcq || exercise.kind === "adjective-agreement";

  return (
    <div className="overflow-hidden rounded-[20px] border border-border bg-bg2 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
      {/* En-tête */}
      <div
        className="flex items-center justify-between px-6 py-3.5 text-white"
        style={{ background: caseInfo.color }}
      >
        <span className="font-display text-sm font-semibold uppercase tracking-wide">
          {caseInfo.nameRu} · {caseInfo.question}
        </span>
        <span className="font-display text-xs font-bold">Série : {streak}</span>
      </div>

      {/* Sélecteur de mode */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-6 py-3.5">
        <div className="inline-flex flex-wrap rounded-full border border-border bg-bg p-1">
          {tabs.map((t) => (
            <ModeButton key={t} active={tab === t} onClick={() => setTab(t)}>
              {TAB_LABEL[t]}
            </ModeButton>
          ))}
        </div>
        {personalNouns.length > 0 && (
          <label className="ml-2 flex items-center gap-1.5 font-display text-xs text-muted">
            <input
              type="checkbox"
              checked={usePersonalVocab}
              onChange={(e) => setUsePersonalVocab(e.target.checked)}
              className="accent-accent"
            />
            Utiliser mon vocabulaire ({personalNouns.length})
          </label>
        )}
        {progress !== null && (
          <span className="ml-auto font-display text-xs text-muted">
            Précision ({GENDER_LABEL[exercise.noun.gender]}) : {progress}%
          </span>
        )}
      </div>

      <div className="p-7">
        {aiLoading ? (
          <SentencePhraseSkeleton />
        ) : (
          <div key={exerciseSeq} className="animate-fade-in">
            {exercise.trigger && (
              <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-bg3 px-3 py-1 font-display text-xs font-semibold text-muted">
                Déclencheur :
                <span style={{ color: caseInfo.color }}>{exercise.trigger.ru}</span>
                <span className="font-normal">— {exercise.trigger.meaningFr}</span>
                {exercise.kind === "sentence-ai" && <span title="Phrase générée par IA">✨</span>}
              </p>
            )}

            {exercise.kind === "isolated" && (
              <div className="mb-6">
                <p className="font-display text-sm text-muted">
                  {exercise.targetCase === "nominative" ? "Mets ce mot au pluriel :" : "Décline ce mot :"}
                </p>
                <p className="font-display text-3xl font-bold">
                  {exercise.noun.lemma}{" "}
                  <span className="font-display text-lg font-normal text-muted">({exercise.noun.translation})</span>
                </p>
              </div>
            )}

            {exercise.kind === "numeral" && exercise.numeral !== undefined && (
              <div className="mb-6">
                <p className="font-display text-sm text-muted">Accorde le nom avec le chiffre :</p>
                <p className="font-display text-3xl font-bold">
                  {exercise.numeral} + {exercise.noun.lemma}{" "}
                  <span className="font-display text-lg font-normal text-muted">({exercise.noun.translation})</span>
                </p>
                {exercise.countForm && (
                  <p className="mt-2 font-display text-xs text-muted">{COUNT_FORM_LABEL[exercise.countForm]}</p>
                )}
              </div>
            )}

            {isSentenceLike && (
              <div className="mb-6">
                <p className="font-display text-sm text-muted">Complète la phrase :</p>
                <p className="font-display text-2xl font-bold">
                  {exercise.sentenceTemplate?.split("___")[0]}
                  <span className="inline-block min-w-[80px] border-b-2 border-accent">&nbsp;</span>
                  {exercise.sentenceTemplate?.split("___")[1]}
                </p>
                <p className="mt-1 font-display text-sm italic text-muted">{exercise.sentenceFr}</p>
                {exercise.kind === "adjective-agreement" && exercise.adjective && (
                  <p className="mt-1 font-display text-xs text-muted">
                    Accorde aussi l&apos;adjectif « {exercise.adjective.lemmaM} » ({exercise.adjective.translation}).
                  </p>
                )}
              </div>
            )}

            {isMcq ? (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {exercise.options?.map((opt) => {
                  const isPicked = feedback?.picked === opt;
                  const isCorrectOpt = feedback && opt === exercise.correctForm;
                  return (
                    <button
                      key={opt}
                      onClick={() => selectOption(opt)}
                      disabled={!!feedback}
                      className={`rounded-[10px] border px-4 py-3 font-display text-lg font-semibold transition-colors ${
                        isCorrectOpt
                          ? "border-success bg-success/10 text-success"
                          : isPicked
                            ? "border-danger bg-danger/10 text-danger"
                            : "border-border bg-bg text-text hover:border-accent"
                      } disabled:cursor-default`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex gap-2.5">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (feedback ? nextExercise() : submit())}
                  placeholder="Écris la réponse en russe…"
                  readOnly={verifying}
                  className={`flex-1 rounded-[10px] border border-border bg-bg px-4 py-3 font-display text-lg text-text outline-none placeholder:text-muted/60 focus:border-accent ${
                    verifying ? "opacity-60" : ""
                  }`}
                  autoFocus
                />
                {feedback ? (
                  <button
                    onClick={nextExercise}
                    className="rounded-[10px] bg-bg3 px-6 font-display text-sm font-semibold text-text transition-colors hover:bg-accent"
                  >
                    Suivant →
                  </button>
                ) : (
                  <button
                    onClick={submit}
                    disabled={!input.trim() || verifying}
                    className="rounded-[10px] bg-accent px-6 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {verifying ? "Vérification…" : "Vérifier"}
                  </button>
                )}
              </div>
            )}

            {!feedback && (
              <button
                onClick={reveal}
                disabled={verifying}
                className="mt-3 w-full rounded-[10px] border border-border py-2.5 font-display text-sm font-semibold text-muted transition-colors hover:border-accent2 hover:text-accent2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                💡 Je ne sais pas — voir la réponse
              </button>
            )}

            {isMcq && feedback && (
              <button
                onClick={nextExercise}
                className="mt-4 rounded-[10px] bg-bg3 px-6 py-3 font-display text-sm font-semibold text-text transition-colors hover:bg-accent"
              >
                Suivant →
              </button>
            )}

            {feedback && (
              <div
                className={`mt-5 rounded-xl border p-4 ${
                  feedback.status === "correct"
                    ? "border-success bg-success/10"
                    : feedback.status === "revealed"
                      ? "border-border bg-bg3"
                      : "border-danger bg-danger/10"
                }`}
              >
                <p className="font-display text-sm font-bold uppercase tracking-wide">
                  {feedback.status === "correct"
                    ? "✓ Correct"
                    : feedback.status === "revealed"
                      ? "Réponse"
                      : "✗ Pas tout à fait"}
                </p>
                <p className="mt-1 font-display text-xl font-bold">{exercise.correctForm}</p>
                <p className="mt-1 font-display text-sm text-muted">{exercise.ruleApplied}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Pendant l'appel IA du mode "Phrase" : plutôt que de laisser l'ancien
// exercice affiché avec juste un libellé changé (source de confusion —
// contenu et onglet ne correspondaient plus), un squelette qui épouse la
// forme du contenu à venir (déclencheur, phrase, ligne de réponse).
function SentencePhraseSkeleton() {
  return (
    <div className="animate-fade-in">
      <p className="mb-4 inline-flex items-center gap-2 font-display text-xs font-semibold text-muted">
        <span className="flex gap-1">
          <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-accent [animation-delay:0ms]" />
          <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-accent [animation-delay:160ms]" />
          <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-accent [animation-delay:320ms]" />
        </span>
        Génération d&apos;une phrase…
      </p>
      <div className="mb-6 space-y-3">
        <div className="skeleton h-4 w-24 rounded-full" />
        <div className="skeleton h-8 w-4/5 rounded-lg" />
        <div className="skeleton h-4 w-2/5 rounded-lg" />
      </div>
      <div className="skeleton h-[50px] w-full rounded-[10px]" />
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 font-display text-xs font-semibold transition-colors ${
        active ? "bg-accent text-white" : "text-muted hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}
