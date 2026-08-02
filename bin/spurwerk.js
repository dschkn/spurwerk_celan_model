#!/usr/bin/env node

import { createInterface } from "node:readline/promises";
import { stdin as inputStream, stdout as outputStream } from "node:process";
import { authorModel, sourceNgrams, styleProfile } from "../src/data.mjs";
import { generatePoem, profileInput } from "../src/generator.mjs";

const options = parseArguments(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}
if (options.stats) {
  printStats(styleProfile);
  process.exit(0);
}
if (options.sources) {
  printSources(authorModel);
  process.exit(0);
}
if (options.words.length > 0) {
  render(options.words.join(" "));
} else if (!inputStream.isTTY) {
  await pipedSession();
} else {
  await interactiveSession();
}

function render(word) {
  if (options.profile) {
    renderProfile(word);
    return;
  }
  const result = generatePoem({
    input: word,
    language: options.language,
    authorModel,
    profile: styleProfile,
    sourceHashData: sourceNgrams,
    salt: options.seed,
    candidateCount: options.candidates
  });

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  console.log();
  console.log(result.poem);
  console.log();
  if (options.trace) printTrace(result.trace);
}

function renderProfile(word) {
  const passport = profileInput({ input: word, authorModel, profile: styleProfile });
  if (options.json) {
    console.log(JSON.stringify(passport, null, 2));
    return;
  }
  console.log(`\nSPURWERK // word profile: ${passport.display}\n`);
  console.log(`семантическая уверенность: ${passport.confidence}`);
  console.log(`разбор: ${passport.matches.map((match) => `${match.concept} ${match.score} [${match.reason}]`).join(" → ")}`);
  console.log(`собственные свойства: ${passport.ownProperties.join("; ")}`);
  console.log(`вес: ${formatDimensions(passport.dimensions)}`);
  if (passport.corpus.available) {
    console.log(`корпус: синтаксический вес ${passport.corpus.syntacticWeight}; средняя строка контекста ${passport.corpus.occurrenceLineWords} слов`);
    for (const item of passport.corpus.evidence) {
      console.log(`  ${item.concept}: ${item.occurrences} вхождений / ${item.poems} стихотворений; медиана строки ${item.occurrenceLineWords?.median ?? "—"}`);
    }
    console.log("  Важно: это корреляция в выбранном корпусе, а не доказанная причинность.");
  } else {
    console.log("корпус: прямых контекстных данных нет; форма опирается на общий поздний профиль и исследовательскую модель");
  }
  if (passport.opaque) console.log("примечание: значение не выдумано; ввод сохранён как инородный материальный объект");
  console.log();
}

async function interactiveSession() {
  const readline = createInterface({ input: inputStream, output: outputStream });
  console.log("SPURWERK 0.2 // Paul Celan author-world model");
  console.log("Ein Wort / одно слово. Пустая строка — выход.\n");
  while (true) {
    const word = (await readline.question("spur> ")).trim();
    if (!word || /^(exit|quit|выход)$/iu.test(word)) break;
    render(word);
  }
  readline.close();
}

async function pipedSession() {
  let content = "";
  for await (const chunk of inputStream) content += chunk;
  const words = content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (const word of words) render(word);
}

function printTrace(trace) {
  console.log("— Spur / объяснимый след —");
  console.log(`язык: ${trace.language}`);
  console.log(`семантическая уверенность: ${trace.passport.confidence}${trace.passport.opaque ? " (неизвестное слово)" : ""}`);
  console.log(`паспорт: ${trace.passport.matches.map((match) => `${match.concept} ${match.score} [${match.reason}]`).join(" → ")}`);
  console.log(`параметры: ${formatDimensions(trace.passport.dimensions)}`);
  console.log(`тезис: ${trace.thesis}`);
  console.log(`напряжение: ${trace.plan.tension.join(" ↔ ")}`);
  console.log("план:");
  const claimStatuses = new Map(trace.researchClaims.map((claim) => [claim.id, claim.epistemicStatus]));
  for (const event of trace.plan.events) {
    const evidence = event.claimId
      ? ` [${event.claimId}; ${claimStatuses.get(event.claimId)}; ${event.sources.join(", ")}]`
      : ` [planner; ${event.sources.join(", ")}]`;
    console.log(`  ${event.stage}: ${event.from} —${event.relation}→ ${event.to}${evidence}`);
  }
  console.log(`принципы личности: ${trace.plan.principles.join(", ")}`);
  console.log(`форма: ${trace.form.explanation}`);
  if (trace.form.corpusAssociation) {
    console.log(`корпусная ассоциация: ${trace.form.corpusAssociation.occurrenceLineWords} слов в строке контекста; синтаксический вес ${trace.form.corpusAssociation.syntacticWeight}`);
    console.log("  Это наблюдаемая корреляция, не утверждение, что слово причинно задаёт форму.");
  }
  console.log(`выбор: кандидат ${trace.selectedCandidate + 1} из ${trace.candidateCount}; оценка ${trace.evaluation.total}`);
  console.log(`4-граммы корпуса: ${trace.sourceFourGramCollisions.length} совпадений`);
}

function printStats(profile) {
  const { corpus, statistics } = profile;
  console.log("SPURWERK 0.2 // corpus profile\n");
  console.log(`poem units: ${corpus.poemCount}`);
  console.log(`verse lines: ${corpus.lineCount}`);
  console.log(`tokens: ${corpus.tokenCount} (${corpus.uniqueTokenCount} unique)`);
  console.log(`all corpus words/line: mean ${statistics.wordsPerLine.mean}, median ${statistics.wordsPerLine.median}, IQR ${statistics.wordsPerLine.q25}–${statistics.wordsPerLine.q75}`);
  console.log(`late corpus words/line: mean ${statistics.lateCorpus.wordsPerLine.mean}, median ${statistics.lateCorpus.wordsPerLine.median}`);
  console.log(`late corpus lines/poem: mean ${statistics.lateCorpus.linesPerPoem.mean}, median ${statistics.lateCorpus.linesPerPoem.median}`);
  console.log(`contextual word profiles: ${Object.keys(profile.contextProfiles ?? {}).length}`);
}

function printSources(model) {
  console.log("SPURWERK 0.2 // research ledger\n");
  for (const source of model.sources) console.log(`${source.id}: ${source.author ? `${source.author}, ` : ""}${source.title} — ${source.read}`);
  console.log(`\nTyped claims: ${model.claims.length}; author principles: ${model.principles.length}; concept profiles: ${Object.keys(model.concepts).length}`);
}

function formatDimensions(dimensions) {
  return Object.entries(dimensions).map(([key, value]) => `${key}=${value}`).join("; ");
}

function parseArguments(args) {
  const result = {
    words: [], language: "auto", trace: false, profile: false, stats: false,
    sources: false, json: false, help: false, seed: "", candidates: 36
  };
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (value === "--trace" || value === "-t") result.trace = true;
    else if (value === "--profile" || value === "-p") result.profile = true;
    else if (value === "--stats") result.stats = true;
    else if (value === "--sources") result.sources = true;
    else if (value === "--json") result.json = true;
    else if (value === "--help" || value === "-h") result.help = true;
    else if (value === "--lang") result.language = args[++index] ?? "auto";
    else if (value.startsWith("--lang=")) result.language = value.split("=")[1];
    else if (value === "--seed") result.seed = args[++index] ?? "";
    else if (value.startsWith("--seed=")) result.seed = value.split("=")[1];
    else if (value === "--candidates") result.candidates = Number(args[++index] ?? 36);
    else if (value.startsWith("--candidates=")) result.candidates = Number(value.split("=")[1]);
    else result.words.push(value);
  }
  if (!["auto", "de", "ru"].includes(result.language)) throw new Error("--lang must be auto, de, or ru");
  if (!Number.isInteger(result.candidates) || result.candidates < 1 || result.candidates > 200) throw new Error("--candidates must be an integer from 1 to 200");
  return result;
}

function printHelp() {
  console.log(`SPURWERK 0.2 — explainable Paul Celan author-world model

Usage:
  spurwerk "Luftballon"
  spurwerk Stein --trace
  spurwerk Stein --profile
  spurwerk "воздушный шарик" --lang ru
  spurwerk --stats
  spurwerk --sources

Options:
  --lang auto|de|ru   Output language (default: auto)
  --trace, -t         Show passport, plan, claims, form and candidate score
  --profile, -p       Inspect the input word without generating a poem
  --seed TEXT         Produce another deterministic variant
  --candidates N      Generate and score N plans (default: 36, max: 200)
  --json              Return machine-readable output
  --stats             Show corpus statistics
  --sources           Show the research ledger
  --help, -h          Show this help`);
}
