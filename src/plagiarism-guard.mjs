import { createHash } from "node:crypto";

export function sourceCollisions(lines, sourceHashData) {
  const sourceHashes = new Set(sourceHashData.hashes);
  const tokens = lines.flatMap(tokenize).map((token) => token.toLocaleLowerCase("de-DE"));
  const collisions = [];
  for (let index = 0; index <= tokens.length - sourceHashData.n; index += 1) {
    const gram = tokens.slice(index, index + sourceHashData.n);
    const hash = createHash("sha256").update(gram.join(" ")).digest("hex").slice(0, 16);
    if (sourceHashes.has(hash)) collisions.push(gram.join(" "));
  }
  return [...new Set(collisions)];
}

function tokenize(line) {
  return line.match(/\p{L}+(?:[-’']\p{L}+)*/gu) ?? [];
}
