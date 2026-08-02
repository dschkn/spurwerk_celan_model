#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";

const inputPdf = process.argv[2];
if (!inputPdf) {
  console.error("Usage: node scripts/build-profile.mjs /path/to/celan-bilingual-corpus.pdf");
  process.exit(1);
}

const pdfPath = resolve(inputPdf);
if (!existsSync(pdfPath)) {
  console.error(`Corpus PDF not found: ${pdfPath}`);
  process.exit(1);
}

const projectRoot = resolve(import.meta.dirname, "..");
const dataDirectory = resolve(projectRoot, "data");
mkdirSync(dataDirectory, { recursive: true });

const sourcePages = [];
for (let page = 11; page <= 283; page += 2) sourcePages.push(page);

const mergeGroups = [
  [25, 27],
  [75, 77],
  [89, 91, 93, 95, 97],
  [131, 133],
  [167, 169],
  [173, 175],
  [177, 179],
  [181, 183],
  [185, 187, 189, 191, 193],
];

const stopwords = new Set([
  "aber", "alle", "allem", "allen", "aller", "alles", "als", "also", "am", "an", "auch", "auf",
  "aus", "bei", "beim", "bin", "bis", "da", "das", "dass", "dein", "deine", "deinem", "deinen",
  "deiner", "deines", "dem", "den", "denn", "der", "des", "dich", "die", "dies", "diese", "diesem",
  "diesen", "dir", "doch", "dort", "du", "durch", "ein", "eine", "einem", "einen", "einer", "eines",
  "er", "es", "etwas", "für", "gegen", "geht", "hat", "hier", "hin", "hinter", "ich", "ihm", "ihn",
  "ihr", "im", "in", "ins", "ist", "ja", "kein", "keine", "man", "mein", "meine", "meinem", "meinen",
  "meiner", "mit", "muss", "nach", "nicht", "nichts", "noch", "nun", "nur", "ob", "oder", "ohne", "schon",
  "sie", "sich", "sind", "so", "über", "um", "und", "uns", "unser", "unter", "vom", "von", "vor", "war",
  "was", "wenn", "wer", "wie", "wieder", "wir", "wo", "zu", "zum", "zur", "zwischen",
]);

const pageTexts = new Map();
for (const page of sourcePages) {
  const raw = execFileSync("pdftotext", ["-f", String(page), "-l", String(page), "-layout", pdfPath, "-"], {
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024,
  });
  pageTexts.set(page, cleanPage(raw));
}

const groupsByFirstPage = new Map(mergeGroups.map((group) => [group[0], group]));
const mergedPages = new Set(mergeGroups.flatMap((group) => group.slice(1)));
const poems = [];

for (const page of sourcePages) {
  if (mergedPages.has(page)) continue;
  const group = groupsByFirstPage.get(page) ?? [page];
  const lines = group.flatMap((groupPage) => pageTexts.get(groupPage) ?? []).filter(Boolean);
  if (lines.length === 0) continue;

  poems.push({
    id: `p-${String(page).padStart(3, "0")}`,
    pages: group,
    cycle: cycleForPage(page),
    chronology: chronologyForPage(page),
    lines,
  });
}

const documentFrequency = new Map();
const tokenFrequency = new Map();
const tokenCycles = new Map();

for (const poem of poems) {
  const tokens = poem.lines.flatMap(tokenize);
  const unique = new Set(tokens.map(normalizeToken));
  for (const token of tokens.map(normalizeToken)) {
    tokenFrequency.set(token, (tokenFrequency.get(token) ?? 0) + 1);
    if (!tokenCycles.has(token)) tokenCycles.set(token, new Set());
    tokenCycles.get(token).add(poem.cycle);
  }
  for (const token of unique) documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1);
}

const maxRarity = Math.log2((poems.length + 1) / 2) || 1;
const tokenWeight = (token) => {
  const normalized = normalizeToken(token);
  const chars = [...normalized.replaceAll("-", "")].length;
  const rarity = Math.log2((poems.length + 1) / ((documentFrequency.get(normalized) ?? 0) + 1)) / maxRarity;
  const length = clamp((chars - 3) / 12, 0, 1);
  const compound = clamp((normalized.split("-").length - 1) * 0.3 + (normalized.includes("-") ? 0.3 : 0) + (chars >= 13 ? 0.3 : 0), 0, 1);
  return clamp(0.45 * rarity + 0.35 * length + 0.20 * compound, 0, 1);
};

for (const poem of poems) {
  poem.lineMetrics = poem.lines.map((line) => {
    const tokens = tokenize(line);
    return {
      words: tokens.length,
      heaviness: upperMean(tokens.map(tokenWeight), 0.4),
    };
  }).filter((metric) => metric.words > 0);
  const weights = poem.lines.flatMap(tokenize).map(tokenWeight);
  poem.heaviness = upperMean(weights, 0.4);
  poem.styleWeight = 0.45 + 0.75 * poem.heaviness + 0.55 * poem.chronology;
}

const allLineMetrics = poems.flatMap((poem) => poem.lineMetrics);
const poemLineCounts = poems.map((poem) => poem.lineMetrics.length);
const wordsPerLine = allLineMetrics.map((metric) => metric.words);
const tokenCount = wordsPerLine.reduce((sum, value) => sum + value, 0);
const lateCycles = new Set(["Atemwende", "Fadensonnen", "Lichtzwang", "Schneepart", "Zeitgehöft"]);
const latePoems = poems.filter((poem) => lateCycles.has(poem.cycle));
const lateLineMetrics = latePoems.flatMap((poem) => poem.lineMetrics);

const weightedWordsPerLine = weightedMean(
  poems.flatMap((poem) => poem.lineMetrics.map((metric) => metric.words)),
  poems.flatMap((poem) => poem.lineMetrics.map((metric) => poem.styleWeight * (0.7 + metric.heaviness))),
);
const weightedLinesPerPoem = weightedMean(
  poems.map((poem) => poem.lineMetrics.length),
  poems.map((poem) => poem.styleWeight),
);

const lexicalProfile = [...tokenFrequency.entries()]
  .filter(([token, count]) => count >= 2 && token.length >= 4 && !stopwords.has(token) && !looksLikeOcrNoise(token))
  .map(([token, frequency]) => ({
    token,
    frequency,
    documentFrequency: documentFrequency.get(token) ?? 0,
    heaviness: round(tokenWeight(token), 4),
    cycles: [...(tokenCycles.get(token) ?? [])].sort(),
  }))
  .sort((a, b) => (b.heaviness * Math.log2(b.frequency + 1)) - (a.heaviness * Math.log2(a.frequency + 1)))
  .slice(0, 500);

const sourceNgramHashes = new Set();
for (const poem of poems) {
  const normalizedTokens = poem.lines.flatMap(tokenize).map(normalizeToken);
  for (let index = 0; index <= normalizedTokens.length - 4; index += 1) {
    sourceNgramHashes.add(hashNgram(normalizedTokens.slice(index, index + 4)));
  }
}

const contextualTerms = {
  stone: ["stein"],
  air: ["luft"],
  word: ["wort"],
  silence: ["schweig", "stumm", "stille"],
  light: ["licht", "schein", "glanz"],
  darkness: ["dunkel", "nacht", "schatten"],
  wound: ["wund", "vene", "riss"],
  memory: ["gedächtn", "erinner", "eingedenk"],
  trace: ["spur", "rest"],
  gray: ["grau"],
  eye: ["auge", "augen", "lid"],
  hearing: ["ohr", "hör"],
  breath: ["atem"],
  flight: ["flug", "flieg", "höhe", "steig"],
  death: ["tod", "sterb"],
  birth: ["geburt", "gebor"],
  fragment: ["scherb", "splitter", "bruch"],
  water: ["wasser", "flut"],
  hand: ["hand", "hände"],
};

const styleProfileBase = {
  wordsPerLine: summarize(wordsPerLine),
  linesPerPoem: summarize(poemLineCounts),
};

const contextProfiles = Object.fromEntries(Object.entries(contextualTerms).map(([concept, stems]) => {
  const occurrences = [];
  const containingPoems = new Set();
  for (const poem of poems) {
    for (let lineIndex = 0; lineIndex < poem.lines.length; lineIndex += 1) {
      const tokens = tokenize(poem.lines[lineIndex]).map(normalizeToken);
      const matchingIndexes = tokens
        .map((token, index) => stems.some((stem) => token.includes(stem)) ? index : -1)
        .filter((index) => index >= 0);
      for (const tokenIndex of matchingIndexes) {
        containingPoems.add(poem.id);
        occurrences.push({
          words: tokens.length,
          atStart: tokenIndex === 0,
          atEnd: tokenIndex === tokens.length - 1,
          isolated: tokens.length === 1,
          poemLines: poem.lines.length,
          late: lateCycles.has(poem.cycle),
        });
      }
    }
  }
  const occurrenceWords = occurrences.map((item) => item.words);
  const meanOccurrenceLine = occurrenceWords.length ? mean(occurrenceWords) : null;
  const lineCompression = meanOccurrenceLine == null ? 0 : clamp(1 - meanOccurrenceLine / styleProfileBase.wordsPerLine.mean, -1, 1);
  const boundaryShare = occurrences.length
    ? occurrences.filter((item) => item.atStart || item.atEnd).length / occurrences.length
    : 0;
  const isolatedShare = occurrences.length
    ? occurrences.filter((item) => item.isolated).length / occurrences.length
    : 0;
  const syntacticWeight = clamp(0.45 + 0.3 * lineCompression + 0.18 * boundaryShare + 0.35 * isolatedShare, 0, 1);
  return [concept, {
    stems,
    occurrences: occurrences.length,
    poems: containingPoems.size,
    occurrenceLineWords: occurrenceWords.length ? summarize(occurrenceWords) : null,
    lineStartShare: round(share(occurrences, (item) => item.atStart), 3),
    lineEndShare: round(share(occurrences, (item) => item.atEnd), 3),
    isolatedLineShare: round(isolatedShare, 3),
    lateOccurrenceShare: round(share(occurrences, (item) => item.late), 3),
    containingPoemLinesMean: occurrences.length ? round(mean(occurrences.map((item) => item.poemLines)), 3) : null,
    syntacticWeight: round(syntacticWeight, 3),
    interpretation: "Association in the sampled corpus, not evidence that the word causes the observed form."
  }];
}));

const styleProfile = {
  schemaVersion: 1,
  source: {
    title: "Paul Celan. Gedichte. Prosa. Briefe (bilingual selected-poem section)",
    localFilename: basename(pdfPath),
    pdfPages: { first: 11, last: 283, germanPages: "odd" },
    segmentation: "113 poem units; nine manually verified multi-page poems merged; blank separator pages excluded",
  },
  corpus: {
    poemCount: poems.length,
    sourcePageCount: sourcePages.length,
    nonBlankGermanPageCount: [...pageTexts.values()].filter((lines) => lines.length > 0).length,
    lineCount: allLineMetrics.length,
    tokenCount,
    uniqueTokenCount: tokenFrequency.size,
    cycles: Object.fromEntries([...new Set(poems.map((poem) => poem.cycle))].map((cycle) => [cycle, poems.filter((poem) => poem.cycle === cycle).length])),
  },
  statistics: {
    wordsPerLine: styleProfileBase.wordsPerLine,
    linesPerPoem: styleProfileBase.linesPerPoem,
    heavinessWeightedWordsPerLine: round(weightedWordsPerLine, 3),
    heavinessAndChronologyWeightedLinesPerPoem: round(weightedLinesPerPoem, 3),
    lateCorpus: {
      poemCount: latePoems.length,
      wordsPerLine: summarize(lateLineMetrics.map((metric) => metric.words)),
      linesPerPoem: summarize(latePoems.map((poem) => poem.lineMetrics.length)),
    },
  },
  contextProfiles,
  heavinessModel: {
    formula: "0.45 × within-corpus rarity + 0.35 × token length + 0.20 × compound/hyphen complexity",
    aggregation: "mean of the heaviest 40% of tokens; shape weighting also increases with chronology",
    purpose: "Prefer compact, lexically dense late-Celan shapes without treating every long word as equally meaningful.",
  },
  sampling: {
    wordsPerLine: weightedSamplePool(
      poems.flatMap((poem) => poem.lineMetrics.map((metric) => metric.words)),
      poems.flatMap((poem) => poem.lineMetrics.map((metric) => poem.styleWeight * (0.7 + metric.heaviness))),
    ),
    linesPerPoem: weightedSamplePool(
      poems.map((poem) => poem.lineMetrics.length),
      poems.map((poem) => poem.styleWeight),
    ),
  },
  lexicalProfile,
};

writeFileSync(resolve(dataDirectory, "style-profile.json"), `${JSON.stringify(styleProfile, null, 2)}\n`);
writeFileSync(resolve(dataDirectory, "source-ngrams.json"), `${JSON.stringify({ schemaVersion: 1, n: 4, algorithm: "sha256-64", hashes: [...sourceNgramHashes].sort() }, null, 2)}\n`);

console.log(JSON.stringify({
  corpus: styleProfile.corpus,
  wordsPerLine: styleProfile.statistics.wordsPerLine,
  linesPerPoem: styleProfile.statistics.linesPerPoem,
  heavinessWeightedWordsPerLine: styleProfile.statistics.heavinessWeightedWordsPerLine,
  heavinessAndChronologyWeightedLinesPerPoem: styleProfile.statistics.heavinessAndChronologyWeightedLinesPerPoem,
  lateCorpus: styleProfile.statistics.lateCorpus,
}, null, 2));

function cleanPage(raw) {
  const replacements = [
    [/\bM it\b/g, "Mit"], [/\bm it\b/g, "mit"], [/\bA u f\b/g, "Auf"], [/\ba u f\b/g, "auf"],
    [/\bFü r\b/g, "Für"], [/\bfü r\b/g, "für"], [/\bA ug\b/g, "Aug"], [/\ba ug\b/g, "aug"],
    [/\bM und\b/g, "Mund"], [/\bM ann\b/g, "Mann"], [/\bM utter\b/g, "Mutter"], [/\bA rm\b/g, "Arm"],
    [/\bN acht\b/g, "Nacht"], [/\bZ eit\b/g, "Zeit"], [/\bZ ukunft\b/g, "Zukunft"], [/\bD unkel\b/g, "Dunkel"],
    [/\bkom m([a-zäöüß]*)\b/gi, (_, suffix) => `komm${suffix}`], [/\bzusam m([a-zäöüß]*)\b/gi, (_, suffix) => `zusamm${suffix}`],
  ];

  const lines = raw.replaceAll("\f", "").split(/\r?\n/);
  const output = [];
  for (let line of lines) {
    line = line.trim();
    for (const [pattern, replacement] of replacements) line = line.replace(pattern, replacement);
    line = line.replace(/[  ]+/g, " ");
    if (!line) continue;
    if (/^Aus dem Gedichtband\b/.test(line)) continue;
    if (/^[„“\"]?.+[”\"]$/.test(line) && /(Urnen|Gedächtnis|Schwelle|Sprachgitter|Niemandsrose|Atemwende|Fadensonnen|Lichtzwang|Schneepart|Zeitgehöft)/.test(line)) continue;
    if (/^\[[0-9]{4}\]$/.test(line)) continue;
    if (/^(Пауль|Пayль|Paul)\s+Целан$/u.test(line)) continue;
    if (/^[0-9]+$/.test(line)) continue;
    if (/^[яаl_!'»«]+$/iu.test(line)) continue;
    if (looksLikeTitle(line)) continue;
    if (line === "*") continue;
    output.push(line);
  }
  return output;
}

function looksLikeTitle(line) {
  if (line.length > 72 || /[.,:;!?—–-]/.test(line)) return false;
  const letters = [...line].filter((char) => /\p{L}/u.test(char));
  if (letters.length < 3) return false;
  const uppercaseShare = letters.filter((char) => char === char.toUpperCase()).length / letters.length;
  const spacedTitle = /(?:\p{Lu}\s+){2,}\p{Lu}/u.test(line);
  return uppercaseShare > 0.94 && spacedTitle;
}

function cycleForPage(page) {
  if (page <= 11) return "Der Sand aus den Urnen";
  if (page <= 47) return "Mohn und Gedächtnis";
  if (page <= 71) return "Von Schwelle zu Schwelle";
  if (page <= 97) return "Sprachgitter";
  if (page <= 193) return "Die Niemandsrose";
  if (page <= 227) return "Atemwende";
  if (page <= 235) return "Fadensonnen";
  if (page <= 249) return "Lichtzwang";
  if (page <= 259) return "Schneepart";
  return "Zeitgehöft";
}

function chronologyForPage(page) {
  const min = 11;
  const max = 283;
  return clamp((page - min) / (max - min), 0, 1);
}

function tokenize(line) {
  return line.match(/\p{L}+(?:[-’']\p{L}+)*/gu) ?? [];
}

function normalizeToken(token) {
  return token.toLocaleLowerCase("de-DE").replace(/[’']/g, "'");
}

function looksLikeOcrNoise(token) {
  if (/[^\p{Script=Latin}äöüßéèêàáâçñøåæœ'-]/iu.test(token)) return true;
  if (/(.)\1\1\1/i.test(token)) return true;
  return false;
}

function summarize(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return {
    mean: round(sorted.reduce((sum, value) => sum + value, 0) / sorted.length, 3),
    median: round(quantile(sorted, 0.5), 3),
    q25: round(quantile(sorted, 0.25), 3),
    q75: round(quantile(sorted, 0.75), 3),
    min: sorted[0],
    max: sorted.at(-1),
  };
}

function quantile(sorted, q) {
  if (sorted.length === 1) return sorted[0];
  const index = (sorted.length - 1) * q;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const share = index - lower;
  return sorted[lower] * (1 - share) + sorted[upper] * share;
}

function weightedMean(values, weights) {
  const denominator = weights.reduce((sum, value) => sum + value, 0);
  return values.reduce((sum, value, index) => sum + value * weights[index], 0) / denominator;
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function share(values, predicate) {
  return values.length ? values.filter(predicate).length / values.length : 0;
}

function weightedSamplePool(values, weights) {
  const pool = [];
  const maxWeight = Math.max(...weights);
  for (let index = 0; index < values.length; index += 1) {
    const repeats = Math.max(1, Math.round((weights[index] / maxWeight) * 8));
    for (let repeat = 0; repeat < repeats; repeat += 1) pool.push(values[index]);
  }
  return pool;
}

function upperMean(values, share) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => b - a);
  const count = Math.max(1, Math.ceil(sorted.length * share));
  return sorted.slice(0, count).reduce((sum, value) => sum + value, 0) / count;
}

function hashNgram(tokens) {
  return createHash("sha256").update(tokens.join(" ")).digest("hex").slice(0, 16);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
