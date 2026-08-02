import { readFileSync } from "node:fs";

const dataUrl = new URL("../data/", import.meta.url);

export const styleProfile = readJson("style-profile.json");
export const sourceNgrams = readJson("source-ngrams.json");
export const authorModel = readJson("author-model.json");

function readJson(filename) {
  return JSON.parse(readFileSync(new URL(filename, dataUrl), "utf8"));
}
