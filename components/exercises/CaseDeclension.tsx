"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CaseInfo } from "@/lib/grammar/types";
import { CefrLevel } from "@/lib/supabase/types";
import { declineNoun } from "@/lib/grammar/decline";
import { fillFrenchBlank, frenchNounPhrase } from "@/lib/grammar/french-article";
import {
  CaseExercise,
  checkAnswer,
  generateAdjectiveExercise,
  generateIsolatedExercise,
  generateMcqExercise,
  generateNumeralExercise,
  generateSentenceExercise,
} from "@/lib/grammar/exercise-generator";
import { PROPER_NOUN_TRIGGER_ID, triggersForCase } from "@/lib/grammar/triggers";
import { getNoun } from "@/lib/grammar/nouns-data";
import { pickWeightedTrigger } from "@/lib/grammar/exercise-selector";

type Tab = "isolated" | "sentence" | "mcq" | "numeral" | "adjective";
type Feedback = {
  status: "correct" | "incorrect" | "revealed";
  exercise: CaseExercise;
  picked?: string;
  reason?: string | null;
} | null;
type TriggerStats = Record<string, { attempts: number; correct: number }>;
type CaseAccuracy = Record<string, number>; // clé = `${caseId}:${gender}`

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

/**
 * Construit l'exercice suivant. Fonction PURE au sens React (aucun setState) :
 * elle est appelée depuis un effet et son résultat n'est appliqué qu'au
 * retour de la promesse, ce qui évite la cascade de rendus d'un setState
 * synchrone dans l'effet.
 */
async function buildExercise(
  tab: Tab,
  caseInfo: CaseInfo,
  triggerStats: TriggerStats,
  userLevel: CefrLevel | undefined,
  recentLemmas: string[]
): Promise<CaseExercise> {
  if (tab === "isolated") return generateIsolatedExercise(caseInfo.id);
  if (tab === "numeral") return generateNumeralExercise();

  // L'onglet "Accord adjectif" exclut "Меня зовут ___" du tirage : ce
  // gabarit demande un prénom, sur lequel accorder un adjectif n'a pas de
  // sens ("Меня зовут синий Александр"). Filtré AVANT la pondération pour
  // que le tirage adaptatif porte sur les déclencheurs réellement jouables.
  const eligible =
    tab === "adjective"
      ? triggersForCase(caseInfo.id).filter((t) => t.id !== PROPER_NOUN_TRIGGER_ID)
      : triggersForCase(caseInfo.id);
  const trigger = pickWeightedTrigger(eligible, triggerStats, userLevel);

  if (tab === "mcq") return generateMcqExercise(caseInfo.id, trigger);
  if (tab === "adjective") return generateAdjectiveExercise(caseInfo.id, trigger);

  // "Phrase" : IA en premier (phrase personnalisée, ciblée sur le
  // déclencheur choisi), repli SILENCIEUX sur le gabarit fixe si
  // indisponible/erreur.
  //
  // Exception : "Меня зовут ___" n'a de sens qu'avec un prénom et reste
  // toujours au nominatif (aucune vraie déclinaison à tester) — le gabarit
  // fixe + la banque de prénoms couvrent déjà l'exercice parfaitement,
  // aucune valeur à risquer une phrase IA imprévisible ici.
  if (trigger.id === PROPER_NOUN_TRIGGER_ID) {
    return generateSentenceExercise(caseInfo.id, trigger);
  }

  try {
    const res = await fetch("/api/ai/exercise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId: caseInfo.id, triggerId: trigger.id, recentLemmas }),
    });
    if (!res.ok) throw new Error("ai unavailable");
    const ai = await res.json();
    // Le serveur ne renvoie que l'ID d'un mot de la banque curée : on
    // recharge l'objet complet plutôt que de reconstruire un Noun à partir
    // du JSON, sinon irrégularités (друзья), voyelle mobile (отца) et
    // schéma accentuel (днём) seraient perdus.
    const noun = getNoun(ai.noun_id);
    if (!noun) throw new Error("mot hors banque");

    const plural = trigger.plural ?? false;
    const result = declineNoun(noun, caseInfo.id, plural);
    // Filet de sécurité : le prompt demande une traduction française sans
    // trou, mais si le modèle en laisse quand même un (ambiguïté du style
    // "sans ___" — impossible de deviner sucre/lait sans indice), on le
    // comble avec la traduction de la banque plutôt que de laisser
    // l'apprenant deviner à l'aveugle.
    const sentenceFr =
      typeof ai.sentence_fr === "string" && ai.sentence_fr.includes("___")
        ? fillFrenchBlank(
            ai.sentence_fr,
            frenchNounPhrase(noun.translation, noun.frenchGender, trigger.article, plural)
          )
        : ai.sentence_fr;
    return {
      kind: "sentence-ai",
      noun,
      targetCase: caseInfo.id,
      plural,
      correctForm: result.form,
      accentedForm: result.accented,
      ruleApplied: result.ruleApplied,
      trigger,
      sentenceTemplate: ai.sentence_ru,
      sentenceFr,
      hint: noun.translation,
    };
  } catch {
    return generateSentenceExercise(caseInfo.id, trigger);
  }
}

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
  const [round, setRound] = useState(0); // incrémenté à chaque "Suivant" pour relancer le tirage
  const [exercise, setExercise] = useState<CaseExercise | null>(null);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [streak, setStreak] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [triggerStats, setTriggerStats] = useState<TriggerStats>({});
  const [caseAccuracy, setCaseAccuracy] = useState<CaseAccuracy>({});

  // Derniers lemmes vus en mode "Phrase" IA (tous cas confondus, cette
  // session) — envoyés au prompt pour qu'il évite de reproposer les mêmes
  // mots en boucle. Volontairement en mémoire seule (pas persisté) : juste
  // assez pour casser une répétition immédiate, pas un vrai suivi.
  const recentAiLemmas = useRef<string[]>([]);

  // Progression serveur : pilote le tirage adaptatif (par déclencheur) et
  // l'indicateur de précision (par cas × genre). Source unique — le module
  // exige un compte (voir proxy.ts), il n'y a pas de mode hors-ligne à
  // couvrir avec un stockage local parallèle.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/cases/progress")
      .then((r) => r.json())
      .then(
        (data: {
          caseProgress?: { case_id: string; gender: string; attempts: number; correct: number }[];
          triggerProgress?: { trigger_id: string; attempts: number; correct: number }[];
        }) => {
          if (cancelled) return;
          const triggers: TriggerStats = {};
          for (const row of data.triggerProgress ?? []) {
            triggers[row.trigger_id] = { attempts: row.attempts, correct: row.correct };
          }
          setTriggerStats(triggers);

          const accuracy: CaseAccuracy = {};
          for (const row of data.caseProgress ?? []) {
            if (row.attempts > 0) {
              accuracy[`${row.case_id}:${row.gender}`] = Math.round(
                (row.correct / row.attempts) * 100
              );
            }
          }
          setCaseAccuracy(accuracy);
        }
      )
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Tirage de l'exercice. `exercise === null` sert d'état de chargement :
  // les gestionnaires de clic (onglet, "Suivant") le remettent à null, ce
  // qui relance cet effet et affiche le squelette entre-temps.
  useEffect(() => {
    let cancelled = false;
    buildExercise(tab, caseInfo, triggerStats, userLevel, recentAiLemmas.current)
      .then((ex) => {
        if (cancelled) return;
        if (ex.kind === "sentence-ai") {
          // Fenêtre glissante : garde les ~12 plus récents pour rester un
          // signal utile côté prompt sans le laisser grossir indéfiniment.
          recentAiLemmas.current = [...recentAiLemmas.current, ex.noun.lemma].slice(-12);
        }
        setExercise(ex);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // triggerStats/userLevel ne sont volontairement pas des dépendances :
    // ils biaisent le tirage suivant, ils ne doivent pas remplacer
    // l'exercice affiché quand la progression arrive du serveur.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, caseInfo.id, round]);

  function nextExercise() {
    setFeedback(null);
    setInput("");
    setVerifying(false);
    setExercise(null);
    setRound((r) => r + 1);
  }

  function selectTab(next: Tab) {
    if (next === tab) return;
    setFeedback(null);
    setInput("");
    setVerifying(false);
    setExercise(null);
    setTab(next);
  }

  /**
   * Envoie la réponse au serveur, qui recalcule lui-même la forme attendue
   * et tranche (avec, si besoin, une seconde lecture par l'IA). Le client
   * n'enregistre aucun verdict de son côté : il affiche celui du serveur,
   * donc l'écran et la base disent toujours la même chose.
   */
  async function record(
    userAnswer: string,
    options: { revealed?: boolean; optimistic?: boolean; multipleChoice?: boolean } = {}
  ) {
    if (!exercise) return;
    const { revealed = false, optimistic = false, multipleChoice = false } = options;

    if (optimistic) {
      // La comparaison locale a déjà dit "juste" et le serveur applique le
      // même calcul sur les mêmes données : afficher tout de suite évite
      // une latence réseau sur le chemin le plus fréquent.
      applyVerdict(true, revealed, userAnswer, null);
    } else {
      setVerifying(true);
    }

    try {
      const res = await fetch("/api/cases/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetCase: exercise.targetCase,
          nounId: exercise.noun.id,
          adjectiveId: exercise.adjective?.id,
          triggerId: exercise.trigger?.id,
          plural: exercise.plural,
          userAnswer,
          revealed,
          // En QCM, la réponse est une des formes proposées : inutile de
          // payer une vérification IA pour un choix qu'on sait faux.
          multipleChoice,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "échec");
      if (typeof data.caseAccuracy === "number") {
        setCaseAccuracy((prev) => ({
          ...prev,
          [`${exercise.targetCase}:${exercise.noun.gender}`]: data.caseAccuracy,
        }));
      }
      if (!optimistic) applyVerdict(data.correct === true, revealed, userAnswer, data.reason);
    } catch {
      // Serveur indisponible : on affiche quand même un retour à partir du
      // calcul local, l'exercice reste utilisable même si la progression de
      // cette tentative est perdue.
      if (!optimistic) applyVerdict(checkAnswer(exercise, userAnswer), revealed, userAnswer, null);
    } finally {
      setVerifying(false);
    }
  }

  function applyVerdict(
    isCorrect: boolean,
    revealed: boolean,
    picked: string,
    reason: string | null | undefined
  ) {
    if (!exercise) return;
    setFeedback({
      status: revealed ? "revealed" : isCorrect ? "correct" : "incorrect",
      exercise,
      picked,
      reason,
    });
    setStreak((s) => (isCorrect && !revealed ? s + 1 : 0));
    // Le déclencheur vient d'être pratiqué : on met à jour le poids local
    // pour que le tirage suivant en tienne compte sans attendre un
    // rechargement de la progression serveur.
    const triggerId = exercise.trigger?.id;
    if (triggerId) {
      setTriggerStats((prev) => {
        const cur = prev[triggerId] ?? { attempts: 0, correct: 0 };
        return {
          ...prev,
          [triggerId]: {
            attempts: cur.attempts + 1,
            correct: cur.correct + (isCorrect ? 1 : 0),
          },
        };
      });
    }
  }

  function submit() {
    if (!exercise || !input.trim() || verifying || feedback) return;
    // Réponse déjà reconnue juste localement : affichage immédiat, le
    // serveur confirmera (même moteur, mêmes données). Sinon on attend son
    // verdict — c'est là qu'intervient la vérification IA, qui rattrape une
    // variante correcte que la comparaison de chaînes refuserait.
    record(input, { optimistic: checkAnswer(exercise, input) });
  }

  function selectOption(opt: string) {
    if (!exercise || feedback || verifying) return;
    record(opt, { optimistic: opt === exercise.correctForm, multipleChoice: true });
  }

  // Pour quelqu'un qui ne sait vraiment pas — évite de taper n'importe quoi
  // juste pour débloquer "Vérifier" et voir la réponse (ou, en QCM, de
  // cliquer une option au hasard). Compte comme un échec côté progression
  // (même logique que "incorrect" : la maîtrise doit encore progresser sur
  // ce déclencheur), mais affiché sans le ton "faute" du rouge.
  function reveal() {
    if (!exercise || feedback || verifying) return;
    record("", { revealed: true });
  }

  const accuracy = exercise
    ? caseAccuracy[`${exercise.targetCase}:${exercise.noun.gender}`]
    : undefined;

  const isMcq = exercise?.kind === "trigger-mcq";
  const isSentenceLike =
    exercise?.kind === "sentence-fixed" ||
    exercise?.kind === "sentence-ai" ||
    isMcq ||
    exercise?.kind === "adjective-agreement";

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
            <ModeButton key={t} active={tab === t} onClick={() => selectTab(t)}>
              {TAB_LABEL[t]}
            </ModeButton>
          ))}
        </div>
        {exercise && accuracy !== undefined && (
          <span className="ml-auto font-display text-xs text-muted">
            Précision ({GENDER_LABEL[exercise.noun.gender]}) : {accuracy}%
          </span>
        )}
      </div>

      <div className="p-7">
        {!exercise ? (
          <ExerciseSkeleton aiSentence={tab === "sentence"} />
        ) : (
          <div key={`${tab}-${round}`} className="animate-fade-in">
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
                  {exercise.noun.forms.singular[0]}{" "}
                  <span className="font-display text-lg font-normal text-muted">({exercise.noun.translation})</span>
                </p>
              </div>
            )}

            {exercise.kind === "numeral" && exercise.numeral !== undefined && (
              <div className="mb-6">
                <p className="font-display text-sm text-muted">Accorde le nom avec le chiffre :</p>
                <p className="font-display text-3xl font-bold">
                  {exercise.numeral} + {exercise.noun.forms.singular[0]}{" "}
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
                      disabled={!!feedback || verifying}
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
                {/* Forme accentuée : l'accent tonique n'est jamais écrit en
                    russe courant, donc jamais exigé de l'apprenant (voir
                    normalizeAnswer), mais c'est l'information la plus utile
                    et la moins devinable pour un francophone — autant la
                    montrer chaque fois qu'on donne la réponse. */}
                <p className="mt-1 font-display text-xl font-bold">
                  {exercise.accentedForm ?? exercise.correctForm}
                </p>
                <p className="mt-1 font-display text-sm text-muted">{exercise.ruleApplied}</p>
                {feedback.reason && (
                  <p className="mt-2 font-display text-sm text-muted">{feedback.reason}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Pendant le tirage (et l'appel IA du mode "Phrase") : plutôt que de laisser
// l'ancien exercice affiché avec juste un libellé changé (source de
// confusion — contenu et onglet ne correspondaient plus), un squelette qui
// épouse la forme du contenu à venir.
function ExerciseSkeleton({ aiSentence }: { aiSentence: boolean }) {
  return (
    <div className="animate-fade-in">
      {aiSentence && (
        <p className="mb-4 inline-flex items-center gap-2 font-display text-xs font-semibold text-muted">
          <span className="flex gap-1">
            <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-accent [animation-delay:0ms]" />
            <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-accent [animation-delay:160ms]" />
            <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-accent [animation-delay:320ms]" />
          </span>
          Génération d&apos;une phrase…
        </p>
      )}
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
