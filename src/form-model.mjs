export function deriveForm(passport, plan, styleProfile, random) {
  const late = styleProfile.statistics.lateCorpus;
  const baseLines = late.linesPerPoem.median;
  const baseWords = late.wordsPerLine.median;
  const d = passport.dimensions;

  const compressionFactor = 1 - 0.65 * (d.compression - 0.5);
  const gravityFactor = 1 - 0.25 * (d.gravity - 0.5);
  const motionFactor = 1 + 0.18 * (d.motion - 0.5);
  const variation = (random() - 0.5) * 1.2;
  const targetVisibleLines = clamp(Math.round(baseLines * compressionFactor * gravityFactor * motionFactor + variation), 5, 12);

  const contextualWords = passport.corpus.occurrenceLineWords == null
    ? baseWords
    : clamp(passport.corpus.occurrenceLineWords, 2, 5.5);
  const blendedWords = baseWords * 0.72 + contextualWords * 0.28;
  const semanticReduction = 0.72 * (d.compression - 0.5) + 0.42 * (d.gravity - 0.5);
  const motionExpansion = 0.3 * Math.max(0, d.motion - 0.5);
  const targetWordsPerLine = clamp(round(blendedWords - semanticReduction + motionExpansion), 1.8, 4.8);

  const fractureRate = clamp(0.12 + d.fragmentation * 0.55 + d.compression * 0.15, 0.1, 0.85);
  const blankIntervals = d.pause > 0.82 ? 2 : d.pause > 0.58 ? 1 : 0;
  const isolateInput = d.gravity > 0.72 || passport.opaque;
  const delayedMeaning = d.fragmentation > 0.67;

  return {
    base: {
      lateMedianLines: baseLines,
      lateMedianWordsPerLine: baseWords
    },
    targetVisibleLines,
    targetWordsPerLine,
    fractureRate: round(fractureRate),
    blankIntervals,
    isolateInput,
    delayedMeaning,
    dimensions: d,
    corpusAssociation: passport.corpus.available ? {
      occurrenceLineWords: passport.corpus.occurrenceLineWords,
      syntacticWeight: passport.corpus.syntacticWeight,
      note: "Observed association is reported separately from the research-derived semantic pressure; it is not treated as causal."
    } : null,
    explanation: explainForm(passport, targetVisibleLines, targetWordsPerLine, plan)
  };
}

function explainForm(passport, lines, words, plan) {
  const pieces = [];
  if (passport.dimensions.compression > 0.75) pieces.push("high semantic compression shortens the trajectory");
  if (passport.dimensions.gravity > 0.8) pieces.push("material gravity narrows the line");
  if (passport.dimensions.motion > 0.75) pieces.push("movement adds temporal extension");
  if (passport.dimensions.pause > 0.8) pieces.push("silence inserts an active interval");
  if (passport.corpus.available) pieces.push("corpus context adjusts line width, not meaning");
  return `${lines} visible lines at about ${words} words each; ${pieces.join("; ") || `the ${plan.operation} route stays near the late-corpus baseline`}.`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value) {
  return Math.round(value * 10) / 10;
}
