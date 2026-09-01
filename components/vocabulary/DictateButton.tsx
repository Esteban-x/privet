"use client";

import { useEffect, useRef } from "react";
import { useSpeechRecognition } from "@/lib/vocabulary/speech";
import { MicIcon } from "@/components/ui/icons";

/**
 * Dicter au lieu de taper.
 *
 * POURQUOI ICI. Écrire du cyrillique sur un téléphone suppose d'avoir
 * installé un clavier russe et de savoir où sont les touches — deux
 * obstacles qui n'ont rien à voir avec l'apprentissage du mot, et qui
 * arrivent au pire moment : celui où l'on vient d'entendre un mot et où l'on
 * veut le noter avant de l'oublier. La reconnaissance vocale du navigateur
 * fait ce travail, et elle le fait mieux en russe qu'un francophone au
 * clavier ЙЦУКЕН.
 *
 * LE BOUTON DISPARAÎT S'IL NE PEUT PAS SERVIR. `webkitSpeechRecognition`
 * n'existe pas partout (Firefox notamment) : un micro qui n'enregistre rien
 * serait pire que pas de micro du tout, puisqu'on l'essaie plusieurs fois
 * avant de conclure qu'il est cassé.
 *
 * CE QU'IL DICTE N'EST PAS VALIDÉ. Le transcript remplit le champ, point —
 * l'apprenant le relit et le corrige comme n'importe quelle saisie. Même
 * principe que la suggestion de traduction : ça remplit, ça ne verrouille
 * pas.
 */
export default function DictateButton({
  lang,
  label,
  onResult,
}: {
  /** « ru-RU » ou « fr-FR ». */
  lang: string;
  label: string;
  onResult: (text: string) => void;
}) {
  const { supported, listening, transcript, start, stop } = useSpeechRecognition(lang);
  // Le transcript reste en état après la fin de l'écoute : sans ce garde-fou,
  // le moindre rendu du parent le réinjecterait dans le champ et écraserait
  // ce que l'apprenant vient d'y corriger.
  const delivered = useRef("");
  // `onResult` est une lambda recréée à chaque rendu du parent ; la garder en
  // ref évite de rejouer l'effet pour ça — seul le transcript compte.
  const sink = useRef(onResult);
  useEffect(() => {
    sink.current = onResult;
  });

  useEffect(() => {
    const text = transcript.trim();
    if (!text || text === delivered.current) return;
    delivered.current = text;
    sink.current(text);
  }, [transcript]);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={listening ? stop : start}
      aria-label={listening ? "Arrêter la dictée" : label}
      title={listening ? "Arrêter la dictée" : label}
      aria-pressed={listening}
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
        listening
          ? "bg-accent2/15 text-accent2"
          : "text-muted/70 hover:bg-bg3 hover:text-accent-ink"
      }`}
    >
      {/* Le pictogramme ne change pas pendant l'écoute : c'est un halo qui
          pulse autour, comme les ondes du haut-parleur. Remplacer le micro
          par un carré « stop » ferait clignoter la rangée à chaque dictée. */}
      <MicIcon className={`h-4 w-4 ${listening ? "wave-pulse" : ""}`} />
    </button>
  );
}
