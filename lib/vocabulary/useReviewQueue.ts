"use client";

import { useEffect, useMemo, useState } from "react";
import { isDue, masteryScore, type Quality } from "@/lib/srs/sm2";
import type { VocabItem } from "./data";
import {
  fetchDueWords,
  fetchListDetail,
  reviewCustomCard,
  toVocabItem,
  type CustomVocabWord,
} from "./custom";

// File de révision : soit d'UNE liste (perso ou amorcée depuis un thème) si
// `listId` est fourni, soit la file GLOBALE (mots dus toutes listes
// confondues, façon Anki/Duolingo "réviser maintenant") si `listId` est
// `null`. Mots + état SRS via l'API vocab, triés du moins bien su au mieux
// su, une carte consommée à la fois puis retirée de la file de cette
// session.
export function useReviewQueue(listId: string | null) {
  const [words, setWords] = useState<CustomVocabWord[] | null>(null);
  const [allWords, setAllWords] = useState<CustomVocabWord[]>([]); // pool stable, ne rétrécit pas (distracteurs QCM)
  const [listName, setListName] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sessionDone, setSessionDone] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [reloadTick, setReloadTick] = useState(0);

  // Nouvelle liste (ou bascule liste <-> globale) : réinitialise avant de
  // refetch. Ajusté pendant le rendu (comparaison au dernier listId vu)
  // plutôt que dans l'effet de fetch.
  const [seenListId, setSeenListId] = useState(listId);
  if (listId !== seenListId) {
    setSeenListId(listId);
    setWords(null);
    setAllWords([]);
    setLoadError(null);
    setSessionDone(0);
    setSessionCorrect(0);
  }

  useEffect(() => {
    const req = listId
      ? fetchListDetail(listId).then((d) => ({ words: d.words, name: d.list.name }))
      : fetchDueWords().then((d) => ({ words: d.words, name: "Révision du jour" }));

    req
      .then(({ words: fetched, name }) => {
        setListName(name);
        setWords(fetched);
        setAllWords(fetched);
      })
      .catch((err) =>
        setLoadError(
          err instanceof Error
            ? err.message
            : listId
              ? "Liste introuvable."
              : "Impossible de charger tes mots."
        )
      );
  }, [listId, reloadTick]);

  const queue = useMemo(() => {
    if (!words) return [];
    const due = words.filter((w) => !w.srs || isDue({ ...w.srs, id: w.id }));
    const pool = due.length > 0 ? due : words;
    return [...pool]
      .sort((a, b) => masteryScore(a.srs) - masteryScore(b.srs))
      .map((w) => toVocabItem(w, listName));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionDone, words, listName]);

  const pool: VocabItem[] = useMemo(
    () => allWords.map((w) => toVocabItem(w, listName)),
    [allWords, listName]
  );

  const current: VocabItem | undefined = queue[0];
  const loading = words === null && !loadError;
  const noWordsAtAll = words !== null && allWords.length === 0;

  async function review(quality: Quality) {
    if (!current) return;

    setWords((prev) => (prev ? prev.filter((w) => w.id !== current.id) : prev));
    try {
      await reviewCustomCard(current.id, current.ru, current.fr, quality);
    } catch {
      // La révision reste retirée de la file localement ; elle réapparaîtra
      // simplement au prochain chargement si l'enregistrement a échoué.
    }

    setSessionCorrect((n) => n + (quality >= 3 ? 1 : 0));
    setSessionDone((n) => n + 1);
  }

  function reload() {
    setWords(null);
    setAllWords([]);
    setSessionDone(0);
    setSessionCorrect(0);
    setReloadTick((t) => t + 1);
  }

  return {
    current,
    review,
    reload,
    pool,
    loading,
    loadError,
    listName,
    sessionIndex: sessionDone,
    sessionCorrect,
    noWordsAtAll,
  };
}
