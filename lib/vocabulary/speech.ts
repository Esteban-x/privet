"use client";

import { useEffect, useRef, useState } from "react";

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

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export interface TextSegment {
  text: string;
  lang: "ru" | "fr";
}

const CYRILLIC_CHAR = new RegExp("[\\u0400-\\u04FF\\u0300-\\u036F]"); // lettre cyrillique OU diacritique combinant (accent tonique)
// Ponctuation/espaces/chiffres/marqueurs markdown : neutres, rattachés au
// segment en cours plutôt que de forcer une coupure de langue au milieu
// d'une phrase (ex. "хлеб (khleb, le pain)" ne doit pas couper sur l'espace
// ou la parenthèse juste avant "khleb").
const NEUTRAL_CHAR = /[\s\d.,!?;:()«»"'’\-–—*_#/]/;

// Découpe un texte mixte FR/RU (ex. une réponse du professeur IA) en
// segments contigus par langue, pour attribuer la bonne voix à chaque
// morceau au lieu de tout lire avec un seul accent (ce qui écorche l'une
// des deux langues). Heuristique simple par script d'écriture — cyrillique
// = russe, reste = français — suffisante ici car les deux langues
// n'apparaissent jamais mélangées lettre à lettre dans un même mot (voir la
// règle correspondante dans le system prompt).
export function segmentByLanguage(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let buffer = "";
  let bufferIsRu: boolean | null = null;

  for (const char of text) {
    if (NEUTRAL_CHAR.test(char)) {
      buffer += char;
      continue;
    }
    const isRu = CYRILLIC_CHAR.test(char);
    if (bufferIsRu === null || isRu === bufferIsRu) {
      buffer += char;
      bufferIsRu = isRu;
    } else {
      segments.push({ text: buffer, lang: bufferIsRu ? "ru" : "fr" });
      buffer = char;
      bufferIsRu = isRu;
    }
  }
  if (buffer.trim()) segments.push({ text: buffer, lang: bufferIsRu ? "ru" : "fr" });

  return segments.filter((s) => s.text.trim().length > 0);
}

/** Lit une suite de segments à la voix adaptée à chacun, dans l'ordre (mise en file par le navigateur). */
export function speakSegments(segments: TextSegment[]) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  for (const seg of segments) {
    const trimmed = seg.text.trim();
    if (!trimmed) continue;
    const utterance = new SpeechSynthesisUtterance(trimmed);
    utterance.lang = seg.lang === "ru" ? "ru-RU" : "fr-FR";
    window.speechSynthesis.speak(utterance);
  }
}

/**
 * Reconnaissance vocale, comme aide d'auto-vérification uniquement — le
 * transcript n'est jamais noté automatiquement (fiabilité trop variable
 * selon navigateur/accent), juste affiché pour que l'apprenant compare
 * lui-même à ce qu'il visait. Indisponible sur Safari/Firefox : le bouton
 * d'enregistrement se masque proprement dans ce cas (voir `supported`).
 */
export function useSpeechRecognition(lang: string) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(Boolean(Ctor));
  }, []);

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
