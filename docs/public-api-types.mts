// Objectif : vérifier que les types publics sont importables.
import { siteCase, assessFibreReadiness } from "../src/index.mjs";
const dossier = siteCase({
  "id": "exemple-1",
  "text": "Adresse éligible ; point de branchement identifié, mais autorisation de passage en façade encore manquante.",
  "source": {
    "url": "https://example.test/donnee-source",
    "date": "2026-09-15"
  },
  "details": {
    "territoire": "Commune Exemple",
    "origine": "donnée synthétique"
  }
});
void assessFibreReadiness(dossier, { decide: async () => ({}) });
