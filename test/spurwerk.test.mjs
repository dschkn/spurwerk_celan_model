import assert from "node:assert/strict";
import test from "node:test";
import { authorModel, sourceNgrams, styleProfile } from "../src/data.mjs";
import { generatePoem, profileInput } from "../src/generator.mjs";

const config = (input, language = "auto", extra = {}) => ({
  input,
  language,
  authorModel,
  profile: styleProfile,
  sourceHashData: sourceNgrams,
  ...extra
});

test("Stein has a research-derived Celan profile and separate corpus evidence", () => {
  const profile = profileInput({ input: "Stein", authorModel, profile: styleProfile });
  assert.equal(profile.opaque, false);
  assert.equal(profile.directMatches[0].concept, "stone");
  assert.equal(profile.dimensions.gravity, 0.944);
  assert.equal(profile.corpus.available, true);
  assert.equal(profile.corpus.evidence[0].occurrences, 23);
  assert.ok(profile.corpus.occurrenceLineWords > styleProfile.statistics.wordsPerLine.mean);
});

test("Luftballon is decomposed and materially expanded without a fallback", () => {
  const profile = profileInput({ input: "Luftballon", authorModel, profile: styleProfile });
  const concepts = profile.matches.map((match) => match.concept);
  assert.equal(profile.opaque, false);
  assert.ok(concepts.includes("air"));
  assert.ok(concepts.includes("sphere"));
  assert.ok(concepts.includes("shell"));
});

test("Russian balloon retains both its own concepts", () => {
  const profile = profileInput({ input: "воздушный шарик", authorModel, profile: styleProfile });
  const concepts = profile.directMatches.map((match) => match.concept);
  assert.ok(concepts.includes("air"));
  assert.ok(concepts.includes("sphere"));
});

test("Antenne enters through technical reception and listening", () => {
  const profile = profileInput({ input: "Antenne", authorModel, profile: styleProfile });
  const concepts = profile.matches.map((match) => match.concept);
  assert.ok(concepts.includes("machine"));
  assert.ok(concepts.includes("hearing"));
});

test("the seven-poem research anchors resolve to explicit concepts", () => {
  const examples = {
    Macchia: "thicket",
    Tretminen: "mine",
    Stein: "stone",
    Abglanzbeladen: "light",
    Freigegeben: "flight",
    "Baken-Sammler": "beacon",
    "Aus Verlornem": "loss"
  };
  for (const [input, expected] of Object.entries(examples)) {
    const profile = profileInput({ input, authorModel, profile: styleProfile });
    assert.ok(profile.matches.some((match) => match.concept === expected), `${input} -> ${expected}`);
  }
});

test("Stein compresses the form more than Luftballon", () => {
  const stone = generatePoem(config("Stein"));
  const balloon = generatePoem(config("Luftballon"));
  assert.ok(stone.trace.form.targetVisibleLines < balloon.trace.form.targetVisibleLines);
  assert.ok(stone.trace.form.targetWordsPerLine <= balloon.trace.form.targetWordsPerLine);
});

test("Stein plan is backed by the user's research claims", () => {
  const result = generatePoem(config("Stein"));
  assert.ok(result.trace.researchClaims.some((claim) => claim.sources.includes("user-seven")));
  assert.ok(result.trace.plan.events.some((event) => event.from === "stone"));
  assert.ok(result.trace.plan.tension.includes("weight") || result.trace.plan.tension.includes("wasteland") || result.trace.plan.tension.includes("silence"));
});

test("opaque input is preserved and its unknown meaning is not fabricated", () => {
  const result = generatePoem(config("кварцебот_77", "ru"));
  assert.equal(result.trace.passport.opaque, true);
  assert.equal(result.trace.passport.confidence, 0.18);
  assert.match(result.poem, /КВАРЦЕБОТ_77/iu);
  assert.match(result.trace.thesis, /no lexical meaning is fabricated/i);
});

test("generation is deterministic for input and seed", () => {
  const first = generatePoem(config("Antenne", "de", { salt: "eins" }));
  const second = generatePoem(config("Antenne", "de", { salt: "eins" }));
  const other = generatePoem(config("Antenne", "de", { salt: "zwei" }));
  assert.equal(first.poem, second.poem);
  assert.notEqual(first.poem, other.poem);
});

test("winner covers attention, transformation, encounter and residue", () => {
  for (const input of ["Stein", "Luftballon", "Antenne", "рана", "серое"]) {
    const result = generatePoem(config(input));
    const stages = new Set(result.trace.plan.events.map((event) => event.stage));
    for (const stage of ["attention", "transformation", "encounter", "residue"]) assert.ok(stages.has(stage), `${input}: ${stage}`);
  }
});

test("generated poems avoid source four-gram collisions", () => {
  for (const input of ["Luftballon", "Stein", "Antenne", "след", "чашка кофе", "Wunde", "Grau"]) {
    const result = generatePoem(config(input));
    assert.deepEqual(result.trace.sourceFourGramCollisions, [], input);
  }
});

test("candidate scoring is active and bounded", () => {
  const result = generatePoem(config("Stein", "de", { candidateCount: 12 }));
  assert.equal(result.trace.candidateCount, 12);
  assert.ok(result.trace.selectedCandidate >= 0 && result.trace.selectedCandidate < 12);
  assert.ok(result.trace.evaluation.total > 0);
});

test("corpus profile and contextual layer are non-empty", () => {
  assert.ok(styleProfile.corpus.poemCount > 100);
  assert.ok(styleProfile.statistics.lateCorpus.wordsPerLine.median >= 2);
  assert.ok(Object.keys(styleProfile.contextProfiles).length >= 15);
});

test("every supplied analytical source influences claims or principles", () => {
  const used = new Set([
    ...authorModel.claims.flatMap((claim) => claim.sources),
    ...authorModel.principles.flatMap((principle) => principle.sources)
  ]);
  const analytical = authorModel.sources.filter((source) => source.kind !== "primary-corpus");
  for (const source of analytical) assert.ok(used.has(source.id), source.id);
});

test("stress sample accepts diverse inputs without crashing", () => {
  const inputs = [
    "Stein", "Luftballon", "Antenne", "Macchia", "Quantenrouter", "coffee cup", "чашка кофе",
    "рана", "глаз", "молчание", "свет", "#_77", "نقطة", "気球", "🙂"
  ];
  for (let index = 0; index < 80; index += 1) inputs.push(`fremdwort-${index}`);
  for (const input of inputs) {
    const result = generatePoem(config(input, "auto", { candidateCount: 3 }));
    assert.ok(result.lines.filter(Boolean).length >= 5, input);
  }
});
