export function createRandom(seedText) {
  const seed = xmur3(seedText)();
  return mulberry32(seed);
}

export function pick(random, values) {
  if (!values?.length) throw new Error("Cannot pick from an empty collection");
  return values[Math.floor(random() * values.length)];
}

export function weightedPick(random, entries) {
  const usable = entries.filter(([, weight]) => Number.isFinite(weight) && weight > 0);
  const total = usable.reduce((sum, [, weight]) => sum + weight, 0);
  let cursor = random() * total;
  for (const [value, weight] of usable) {
    cursor -= weight;
    if (cursor <= 0) return value;
  }
  return usable.at(-1)?.[0];
}

function xmur3(text) {
  let hash = 1779033703 ^ text.length;
  for (let index = 0; index < text.length; index += 1) {
    hash = Math.imul(hash ^ text.charCodeAt(index), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  return function nextSeed() {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    return (hash ^= hash >>> 16) >>> 0;
  };
}

function mulberry32(seed) {
  return function random() {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
