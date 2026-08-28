import VocabularyWorkspace from "@/components/vocabulary/VocabularyWorkspace";
import { isUuid } from "@/lib/api/validate";

export const metadata = {
  title: "Vocabulaire",
};

// `?list=` ouvre directement une liste : c'est ce que /vocabulary/lists/[id]
// faisait avec une page entière, et ce qu'un lien partagé doit continuer de
// pouvoir viser.
export default async function VocabularyPage({
  searchParams,
}: {
  searchParams: Promise<{ list?: string }>;
}) {
  const { list } = await searchParams;
  return <VocabularyWorkspace initialListId={list && isUuid(list) ? list : undefined} />;
}
