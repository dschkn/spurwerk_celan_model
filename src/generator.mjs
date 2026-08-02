import { sourceCollisions } from "./plagiarism-guard.mjs";
import { deriveForm } from "./form-model.mjs";
import { buildSemanticPlan } from "./planner.mjs";
import { createRandom } from "./random.mjs";
import { realizePlan } from "./realizer.mjs";
import { resolveInput } from "./resolver.mjs";

export function generatePoem({
  input,
  language = "auto",
  authorModel,
  profile,
  sourceHashData,
  salt = "",
  candidateCount = 36
}) {
  const passport = resolveInput(input, authorModel, profile);
  const outputLanguage = language === "auto" ? passport.language : language;
  const candidates = [];

  for (let index = 0; index < candidateCount; index += 1) {
    const random = createRandom(`${passport.normalized}:${outputLanguage}:${salt}:v2:${index}`);
    const plan = buildSemanticPlan(passport, authorModel, random);
    const form = deriveForm(passport, plan, profile, random);
    const realization = realizePlan(passport, plan, form, authorModel, outputLanguage, random);
    const collisions = sourceCollisions(realization.visibleLines, sourceHashData);
    const evaluation = scoreCandidate({ passport, plan, form, realization, collisions, language: outputLanguage });
    candidates.push({ index, plan, form, realization, collisions, evaluation });
  }

  candidates.sort((left, right) => right.evaluation.total - left.evaluation.total || left.index - right.index);
  const winner = candidates[0];
  const claimsById = new Map(authorModel.claims.map((claim) => [claim.id, claim]));
  const claimTrace = winner.plan.events
    .map((event) => event.claimId ? claimsById.get(event.claimId) : null)
    .filter(Boolean);

  return {
    poem: winner.realization.lines.join("\n"),
    lines: winner.realization.lines,
    trace: {
      version: "0.2.0",
      input: passport.display,
      language: outputLanguage,
      passport,
      thesis: winner.plan.thesis,
      plan: {
        primary: winner.plan.primary,
        secondary: winner.plan.secondary,
        tension: winner.plan.tension,
        operation: winner.plan.operation,
        principles: winner.plan.principles,
        events: winner.plan.events
      },
      researchClaims: claimTrace.map((claim) => ({ ...claim, epistemicStatus: classifyClaim(claim, authorModel) })),
      form: winner.form,
      evaluation: winner.evaluation,
      candidateCount,
      selectedCandidate: winner.index,
      sourceFourGramCollisions: winner.collisions
    }
  };
}

function classifyClaim(claim, authorModel) {
  const kinds = new Set(claim.sources.map((id) => authorModel.sources.find((source) => source.id === id)?.kind).filter(Boolean));
  if (kinds.size > 1) return "triangulated-interpretation";
  if (kinds.has("user-research")) return "user-interpretation";
  if (kinds.has("author-poetics")) return "author-poetics";
  if (kinds.has("primary-corpus")) return "textual-observation";
  return "scholarly-interpretation";
}

export function profileInput({ input, authorModel, profile }) {
  return resolveInput(input, authorModel, profile);
}

function scoreCandidate({ passport, plan, form, realization, collisions, language }) {
  const visible = realization.visibleLines;
  const poem = visible.join(" ").toLocaleLowerCase();
  const inputPresent = poem.includes(passport.display.toLocaleLowerCase());
  const requiredStages = ["attention", "transformation", "encounter", "residue"];
  const stageCoverage = requiredStages.filter((stage) => realization.stageCoverage.includes(stage)).length / requiredStages.length;
  const formFit = clamp(1 - Math.abs(visible.length - form.targetVisibleLines) / Math.max(1, form.targetVisibleLines), 0, 1);
  const words = visible.map(countWords).filter((count) => count > 0);
  const meanWords = words.reduce((sum, count) => sum + count, 0) / Math.max(1, words.length);
  const widthFit = clamp(1 - Math.abs(meanWords - form.targetWordsPerLine) / 4, 0, 1);
  const addressPresent = language === "ru" ? /\bты\b/iu.test(poem) : /\bdu\b/iu.test(poem);
  const sourcedEvents = plan.events.filter((event) => event.claimId).length;
  const provenance = clamp(sourcedEvents / 3, 0, 1);
  const transitionDiversity = new Set(plan.events.map((event) => event.relation)).size / Math.max(1, plan.events.length);
  const repeatedPenalty = repetitionPenalty(poem);
  const duplicateLinePenalty = duplicateLineShare(visible);
  const falseClosurePenalty = /\b(erlösung|heilung|sieg|искупление|исцеление|победа)\b/iu.test(poem) ? 1 : 0;
  const collisionPenalty = collisions.length ? 4 : 0;
  const opacityHonesty = passport.opaque
    ? (plan.thesis.includes("no lexical meaning is fabricated") ? 1 : 0)
    : 1;

  const breakdown = {
    inputRetention: inputPresent ? 1 : 0,
    stageCoverage: round(stageCoverage),
    formFit: round(formFit),
    lineWidthFit: round(widthFit),
    address: addressPresent ? 1 : 0,
    provenance: round(provenance),
    transitionDiversity: round(transitionDiversity),
    opacityHonesty,
    repetitionPenalty: round(repeatedPenalty),
    duplicateLinePenalty: round(duplicateLinePenalty),
    falseClosurePenalty,
    collisionPenalty
  };
  const total =
    breakdown.inputRetention * 2.2 +
    breakdown.stageCoverage * 2.2 +
    breakdown.formFit * 1.1 +
    breakdown.lineWidthFit * 0.9 +
    breakdown.address * 1.25 +
    breakdown.provenance * 1.1 +
    breakdown.transitionDiversity * 0.75 +
    breakdown.opacityHonesty * 0.7 -
    breakdown.repetitionPenalty * 0.8 -
    breakdown.duplicateLinePenalty * 2 -
    breakdown.falseClosurePenalty * 2 -
    breakdown.collisionPenalty;
  return { total: round(total), ...breakdown, observedMeanWordsPerLine: round(meanWords) };
}

function duplicateLineShare(lines) {
  const normalized = lines.map((line) => line.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim()).filter(Boolean);
  return normalized.length ? (normalized.length - new Set(normalized).size) / normalized.length : 0;
}

function repetitionPenalty(text) {
  const tokens = text.match(/\p{L}+(?:[-’']\p{L}+)*/gu) ?? [];
  const counts = new Map();
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);
  const excess = [...counts.values()].reduce((sum, count) => sum + Math.max(0, count - 2), 0);
  return clamp(excess / Math.max(1, tokens.length * 0.2), 0, 1);
}

function countWords(line) {
  return line.match(/\p{L}+(?:[-’']\p{L}+)*/gu)?.length ?? 0;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}
