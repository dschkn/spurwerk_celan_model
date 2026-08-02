const BRIDGES = {
  air: [{ concept: "breath", score: 0.66, reason: "physical-semantic-bridge" }, { concept: "flight", score: 0.58, reason: "physical-semantic-bridge" }],
  sphere: [{ concept: "shell", score: 0.72, reason: "material-property-bridge" }],
  machine: [{ concept: "hearing", score: 0.62, reason: "reception-bridge" }],
  hearing: [{ concept: "silence", score: 0.48, reason: "listening-bridge" }],
  light: [{ concept: "trace", score: 0.52, reason: "afterglow-bridge" }],
  loss: [{ concept: "trace", score: 0.7, reason: "cast-and-residue-bridge" }],
  wound: [{ concept: "trace", score: 0.54, reason: "mark-bridge" }],
  flight: [{ concept: "thread", score: 0.42, reason: "retention-bridge" }]
};

export function resolveInput(input, authorModel, styleProfile) {
  const display = sanitizeInput(input);
  if (!display) throw new Error("Spurwerk needs at least one visible word.");
  const normalized = normalize(display);
  const tokens = normalized.split(/[^\p{L}\p{N}-]+/u).filter(Boolean);
  const direct = [];

  for (const [conceptId, concept] of Object.entries(authorModel.concepts)) {
    if (conceptId === "unknown") continue;
    const match = bestConceptMatch(normalized, tokens, concept.aliases ?? []);
    if (match && match.score >= 0.55) direct.push({ concept: conceptId, ...match });
  }

  direct.sort((left, right) => right.score - left.score);
  const distinctDirect = dedupeConcepts(direct).slice(0, 4);
  const bridges = [];
  for (const match of distinctDirect) {
    for (const bridge of BRIDGES[match.concept] ?? []) {
      if (distinctDirect.some((item) => item.concept === bridge.concept)) continue;
      bridges.push({
        ...bridge,
        score: round(bridge.score * match.score),
        via: match.concept,
        alias: null,
        evidence: `derived from ${match.concept}`
      });
    }
  }

  const matches = dedupeConcepts([...distinctDirect, ...bridges])
    .sort((left, right) => right.score - left.score)
    .slice(0, 6);
  const opaque = distinctDirect.length === 0;
  if (opaque) matches.push({
    concept: "unknown",
    score: 1,
    reason: "opaque-foreign-body",
    alias: null,
    evidence: "No semantic identity was invented; only visible properties of the input are retained."
  });

  const formal = formalFeatures(normalized);
  const dimensions = aggregateDimensions(matches, authorModel.concepts, formal);
  const corpus = contextualEvidence(matches, styleProfile.contextProfiles ?? {});
  const confidence = opaque
    ? 0.18
    : clamp(weightedMean(distinctDirect.map((match) => [match.score, match.score])), 0, 1);

  return {
    display,
    normalized,
    tokens,
    language: detectLanguage(display),
    matches,
    directMatches: distinctDirect,
    opaque,
    confidence: round(confidence),
    formal,
    dimensions,
    corpus,
    ownProperties: collectOwnProperties(distinctDirect, authorModel.concepts, formal, opaque)
  };
}

function bestConceptMatch(normalized, tokens, aliases) {
  let best = null;
  for (const aliasRaw of aliases) {
    const alias = normalize(aliasRaw);
    if (!alias) continue;
    let score = 0;
    let reason = "";
    if (normalized === alias) {
      score = 1;
      reason = "exact";
    } else if (tokens.includes(alias)) {
      score = 0.96;
      reason = "word";
    } else if (alias.length >= 4 && normalized.replaceAll(" ", "").includes(alias.replaceAll(" ", ""))) {
      const coverage = alias.length / Math.max(alias.length, normalized.replaceAll(" ", "").length);
      score = 0.76 + 0.18 * coverage;
      reason = "compound-fragment";
    } else if (alias.length >= 5) {
      const similarity = jaccard(trigrams(normalized), trigrams(alias));
      if (similarity >= 0.58) {
        score = 0.45 + 0.28 * similarity;
        reason = "orthographic-neighbour";
      }
    }
    if (!best || score > best.score) {
      best = { score: round(score), reason, alias: aliasRaw, evidence: reason ? `${aliasRaw} via ${reason}` : "" };
    }
  }
  return best?.score > 0 ? best : null;
}

function aggregateDimensions(matches, concepts, formal) {
  const keys = ["gravity", "compression", "fragmentation", "pause", "motion", "address"];
  const result = {};
  for (const key of keys) {
    const entries = matches.map((match) => [concepts[match.concept]?.form?.[key] ?? 0.5, match.score]);
    result[key] = round(weightedMean(entries));
  }
  result.gravity = round(clamp(result.gravity + formal.denseConsonants * 0.08, 0, 1));
  result.fragmentation = round(clamp(result.fragmentation + (formal.hyphenated ? 0.08 : 0), 0, 1));
  return result;
}

function contextualEvidence(matches, contextProfiles) {
  const evidence = matches
    .map((match) => ({ concept: match.concept, matchWeight: match.score, ...(contextProfiles[match.concept] ?? {}) }))
    .filter((item) => Number.isFinite(item.occurrences) && item.occurrences > 0);
  if (evidence.length === 0) return { available: false, syntacticWeight: null, occurrenceLineWords: null, evidence: [] };
  const entries = evidence.map((item) => [item.syntacticWeight, item.matchWeight * Math.log2(item.occurrences + 1)]);
  const lineEntries = evidence
    .filter((item) => item.occurrenceLineWords)
    .map((item) => [item.occurrenceLineWords.mean, item.matchWeight * Math.log2(item.occurrences + 1)]);
  return {
    available: true,
    syntacticWeight: round(weightedMean(entries)),
    occurrenceLineWords: lineEntries.length ? round(weightedMean(lineEntries)) : null,
    evidence
  };
}

function collectOwnProperties(directMatches, concepts, formal, opaque) {
  if (opaque) {
    return [
      `${formal.characters} visible characters`,
      formal.hyphenated ? "segmented spelling" : "continuous spelling",
      formal.hasDigits ? "contains digits" : "alphabetic body",
      "uninterpreted foreignness"
    ];
  }
  return [...new Set(directMatches.flatMap((match) => concepts[match.concept]?.features ?? []))].slice(0, 8);
}

function formalFeatures(value) {
  const characters = [...value.replaceAll(" ", "")].length;
  const letters = [...value].filter((character) => /\p{L}/u.test(character));
  const vowels = letters.filter((character) => /[aeiouyäöüаеёиоуыэюя]/iu.test(character)).length;
  const vowelShare = vowels / Math.max(1, letters.length);
  return {
    characters,
    tokenCount: value.split(/\s+/).filter(Boolean).length,
    hyphenated: /[-–—]/u.test(value),
    hasDigits: /\d/u.test(value),
    vowelShare: round(vowelShare),
    denseConsonants: round(clamp((0.42 - vowelShare) / 0.42, 0, 1))
  };
}

function dedupeConcepts(matches) {
  const best = new Map();
  for (const match of matches) {
    const previous = best.get(match.concept);
    if (!previous || previous.score < match.score) best.set(match.concept, match);
  }
  return [...best.values()];
}

function sanitizeInput(value) {
  return String(value).replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 100);
}

function detectLanguage(value) {
  return /[А-Яа-яЁё]/u.test(value) ? "ru" : "de";
}

function normalize(value) {
  return value
    .normalize("NFKD")
    .toLocaleLowerCase()
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}-]+/gu, " ")
    .trim();
}

function trigrams(value) {
  const padded = `^${value}$`;
  const values = new Set();
  for (let index = 0; index <= padded.length - 3; index += 1) values.add(padded.slice(index, index + 3));
  return values;
}

function jaccard(left, right) {
  let intersection = 0;
  for (const value of left) if (right.has(value)) intersection += 1;
  const union = new Set([...left, ...right]).size;
  return union ? intersection / union : 0;
}

function weightedMean(entries) {
  const usable = entries.filter(([value, weight]) => Number.isFinite(value) && Number.isFinite(weight) && weight > 0);
  if (usable.length === 0) return 0.5;
  const denominator = usable.reduce((sum, [, weight]) => sum + weight, 0);
  return usable.reduce((sum, [value, weight]) => sum + value * weight, 0) / denominator;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}
