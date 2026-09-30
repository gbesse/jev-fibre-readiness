// Objectif : implémenter la frontière de décision métier propre au dépôt.
import { readFile } from "node:fs/promises";

export const DECISIONS = Object.freeze({
  "ready": "prêt",
  "conditional": "prêt_sous_conditions",
  "blocked": "bloqué",
  "already_connected": "déjà_raccordé"
});
const CRITERIA = Object.freeze({
  "ready": "prêt",
  "conditional": "prêt sous conditions",
  "blocked": "bloqué",
  "already_connected": "déjà raccordé"
});

export function siteCase(input) {
  if (!input?.id || !input?.text || !input?.source?.url || !input?.source?.date) throw new TypeError("Le dossier exige id, text, source.url et source.date");
  const date = new Date(input.source.date);
  if (Number.isNaN(date.valueOf())) throw new TypeError("source.date doit être une date ISO valide");
  return { ...input, id: String(input.id), text: String(input.text).trim(), source: { url: String(input.source.url), date: date.toISOString() } };
}

export async function assessFibreReadiness(input, provider) {
  const record = siteCase(input);
  if (record.premisesStatus === "already_connected") return { decision: "already_connected", label: DECISIONS["already_connected"], probability: 1, review: false, deterministic: true };
  const response = await provider.decide({
    state: record,
    questions: { decision: { type: "choice", instructions: "Analysez ce dossier de raccordement à partir des seuls éléments sourcés. Choisissez la catégorie la plus prudente. N’inventez ni fait, ni éligibilité, ni garantie.", criteria: CRITERIA } },
  });
  const answer = response.answers.decision;
  return { decision: answer.choice, label: DECISIONS[answer.choice], probability: answer.probabilities[answer.choice], confidence: answer.confidence, review: answer.confidence < 0.8, deterministic: false, usage: response.usage };
}

export async function runCli(argv, io = console) {
  if (argv.length !== 1) throw new Error("Usage : jev-fibre-readiness <dossier.json>");
  const record = siteCase(JSON.parse(await readFile(argv[0], "utf8")));
  io.log(JSON.stringify({ dossier: record, prochaineÉtape: "Transmettez ce dossier à assessFibreReadiness avec un fournisseur Jev configuré." }, null, 2));
}
