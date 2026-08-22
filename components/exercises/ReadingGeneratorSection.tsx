"use client";

import { useEffect, useState } from "react";
import AiReadingGenerator from "./AiReadingGenerator";
import MyReadingTexts from "./MyReadingTexts";
import SectionLabel from "@/components/ui/SectionLabel";
import { ListCardsSkeleton } from "@/components/ui/Skeleton";
import { fetchMyReadingTexts, type SavedReadingTextSummary } from "@/lib/reading/client";

export default function ReadingGeneratorSection() {
  const [texts, setTexts] = useState<SavedReadingTextSummary[] | null>(null);

  useEffect(() => {
    fetchMyReadingTexts()
      .then((d) => setTexts(d.texts))
      .catch(() => setTexts([]));
  }, []);

  // Un nouveau texte vient d'être généré (et sauvegardé côté serveur) :
  // recharge la liste plutôt que de reconstruire l'entrée à la main ici
  // (le serveur est la seule source des champs affichés, ex. le nombre de
  // phrases réellement enregistrées).
  function handleGenerated() {
    fetchMyReadingTexts()
      .then((d) => setTexts(d.texts))
      .catch(() => {});
  }

  function handleDeleted(id: string) {
    setTexts((prev) => (prev ? prev.filter((t) => t.id !== id) : prev));
  }

  return (
    <>
      <div className="mb-12">
        <AiReadingGenerator onGenerated={handleGenerated} />
      </div>

      {texts === null ? (
        <div className="mb-12">
          <SectionLabel color="accent2">Mes textes</SectionLabel>
          <ListCardsSkeleton />
        </div>
      ) : texts.length > 0 ? (
        <div className="mb-12">
          <SectionLabel color="accent2">Mes textes</SectionLabel>
          <MyReadingTexts texts={texts} onDeleted={handleDeleted} />
        </div>
      ) : null}
    </>
  );
}
