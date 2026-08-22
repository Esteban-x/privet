import { redirect } from "next/navigation";

// Les listes vivent désormais directement sur /vocabulary — gardé comme
// redirection au cas où un lien ou un favori pointe encore ici.
export default function VocabListsRedirect() {
  redirect("/vocabulary");
}
