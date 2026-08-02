import { pick, weightedPick } from "./random.mjs";

const COUNTER_RELATIONS = new Set([
  "holds_tension", "coerces", "destabilizes", "resists", "ruptures_into",
  "delays", "breaks", "refuses", "returns_without_restoring", "is_wounded_by"
]);
const RESIDUE_TARGETS = new Set(["trace", "gray", "silence", "residue", "gap", "address"]);

export function buildSemanticPlan(passport, authorModel, random) {
  const directConcepts = passport.directMatches.map((match) => match.concept);
  const relevantConcepts = passport.matches.map((match) => match.concept);
  const primary = directConcepts[0] ?? "unknown";
  const secondary = directConcepts[1] ?? null;
  const claims = authorModel.claims;
  const relevantClaims = claims.filter((claim) => relevantConcepts.includes(claim.from));
  const primaryClaims = relevantClaims.filter((claim) => claim.from === primary);
  let tension = chooseTension(passport, authorModel, primary, random);

  const events = [{
    id: "e1",
    stage: "attention",
    from: "input",
    relation: "attends_to",
    to: primary,
    property: chooseProperty(passport, random),
    claimId: null,
    sources: ["celan-meridian", "user-seven"]
  }];

  if (secondary) {
    events.push({
      id: "e2",
      stage: "material",
      from: "input",
      relation: "contains",
      to: secondary,
      property: authorModel.concepts[secondary]?.features?.[0] ?? null,
      claimId: null,
      sources: ["celan-meridian", "user-seven"]
    });
  } else {
    events.push({
      id: "e2",
      stage: "material",
      from: primary,
      relation: "shows_property",
      to: tension?.[0] ?? passport.ownProperties[0] ?? "materiality",
      property: passport.ownProperties[0] ?? null,
      claimId: null,
      sources: ["celan-meridian"]
    });
  }

  const transformationClaim = chooseClaim(
    primaryClaims.length ? primaryClaims : relevantClaims,
    random,
    (claim) => 1 + (claim.operation === "witness" ? passport.dimensions.address * 0.5 : 0)
  );
  if (transformationClaim) events.push(eventFromClaim("e3", "transformation", transformationClaim));
  else events.push(syntheticEvent("e3", "transformation", primary, "enters", "silence", ["celan-bremen", "eliezer-silence"]));

  const usedClaims = new Set(events.map((event) => event.claimId).filter(Boolean));
  const counterClaim = chooseClaim(
    relevantClaims.filter((claim) => !usedClaims.has(claim.id)),
    random,
    (claim) => COUNTER_RELATIONS.has(claim.relation) ? 2.4 : claim.operation === "inversion" ? 1.8 : 0.55
  );
  if (counterClaim?.relation === "holds_tension") {
    const claimTension = (authorModel.concepts[counterClaim.from]?.tensions ?? [])
      .find((pair) => pair.includes(counterClaim.to));
    if (claimTension) tension = claimTension;
  }
  if (counterClaim) events.push(eventFromClaim("e4", "counterforce", counterClaim));
  else if (tension) events.push(syntheticEvent("e4", "counterforce", tension[0], "holds_tension", tension[1], ["user-seven"]));

  const encounterClaim = chooseClaim(
    relevantClaims.filter((claim) => !usedClaims.has(claim.id) && (claim.to === "du" || claim.operation === "dialogue" || claim.operation === "encounter" || claim.operation === "witness")),
    random,
    () => 1
  );
  if (encounterClaim && !events.some((event) => event.claimId === encounterClaim.id)) {
    events.push(eventFromClaim("e5", "encounter", encounterClaim));
  } else {
    const approachMedium = events.at(-1)?.to ?? primary;
    events.push(syntheticEvent("e5", "encounter", approachMedium, "addresses", "du", ["celan-bremen", "celan-meridian"]));
  }

  const residueClaim = chooseResidueClaim(relevantClaims, claims, usedClaims, random);
  if (residueClaim && !events.some((event) => event.claimId === residueClaim.id)) {
    events.push(eventFromClaim("e6", "residue", residueClaim));
  } else {
    const residue = chooseResidue(primary, authorModel, random);
    events.push(syntheticEvent("e6", "residue", primary, "leaves", residue, ["user-seven", "celan-meridian"]));
  }

  const compactEvents = removeRedundantEvents(events);
  const sources = [...new Set(compactEvents.flatMap((event) => event.sources))];
  const principleIds = choosePrinciples(authorModel.principles, compactEvents, passport);
  return {
    primary,
    secondary,
    tension,
    thesis: makeThesis(passport, primary, tension, compactEvents),
    operation: transformationClaim?.operation ?? counterClaim?.operation ?? "encounter",
    events: compactEvents,
    sources,
    principles: principleIds
  };
}

function chooseClaim(claims, random, boost) {
  if (!claims.length) return null;
  return weightedPick(random, claims.map((claim) => [claim, claim.weight * Math.max(0.1, boost(claim))]));
}

function chooseResidueClaim(relevantClaims, allClaims, usedClaims, random) {
  const local = relevantClaims.filter((claim) => !usedClaims.has(claim.id) && (RESIDUE_TARGETS.has(claim.to) || claim.operation === "residue" || claim.operation === "ending"));
  if (local.length) return chooseClaim(local, random, () => 1);
  const general = allClaims.filter((claim) => claim.id === "c058" || claim.id === "c054" || claim.id === "c024");
  return random() < 0.42 ? chooseClaim(general, random, () => 1) : null;
}

function chooseTension(passport, authorModel, primary, random) {
  const candidates = [];
  for (const match of passport.matches) {
    const tensions = authorModel.concepts[match.concept]?.tensions ?? [];
    for (const tension of tensions) candidates.push([tension, match.score * (match.concept === primary ? 1.25 : 1)]);
  }
  return weightedPick(random, candidates) ?? ["foreignness", "address"];
}

function chooseProperty(passport, random) {
  return passport.ownProperties.length ? pick(random, passport.ownProperties) : "materiality";
}

function chooseResidue(primary, authorModel, random) {
  const conceptResidue = authorModel.concepts[primary]?.lex?.de?.residue;
  const conceptual = primary === "stone" ? ["silence", "trace"]
    : primary === "light" ? ["trace", "gray"]
      : primary === "wound" ? ["trace", "gap"]
        : primary === "air" || primary === "sphere" ? ["thread", "trace"]
          : ["trace", "silence", "gap"];
  return random() < 0.86 ? pick(random, conceptual) : (conceptResidue ? "trace" : "gap");
}

function eventFromClaim(id, stage, claim) {
  return {
    id,
    stage,
    from: claim.from,
    relation: claim.relation,
    to: claim.to,
    property: null,
    claimId: claim.id,
    sources: claim.sources,
    note: claim.note,
    operation: claim.operation
  };
}

function syntheticEvent(id, stage, from, relation, to, sources) {
  return { id, stage, from, relation, to, property: null, claimId: null, sources, operation: relation };
}

function removeRedundantEvents(events) {
  const seen = new Set();
  return events.filter((event) => {
    const key = `${event.from}:${event.relation}:${event.to}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map((event, index) => ({ ...event, id: `e${index + 1}` }));
}

function choosePrinciples(principles, events, passport) {
  const desired = new Set(["attention", "object-autonomy", "internal-composition", "openness"]);
  if (events.some((event) => event.stage === "encounter")) desired.add("encounter");
  if (events.some((event) => ["silence", "listening"].includes(event.from) || ["silence", "listening"].includes(event.to))) desired.add("productive-silence");
  if (events.some((event) => event.from === "wound" || event.to === "wound")) desired.add("wound-without-redemption");
  if (passport.dimensions.fragmentation > 0.7) desired.add("damaged-language");
  return principles.filter((principle) => desired.has(principle.id)).map((principle) => principle.id);
}

function makeThesis(passport, primary, tension, events) {
  const last = events.at(-1);
  const destination = last?.relation === "refuses" ? `the refusal of ${last.to}` : (last?.to ?? "trace");
  const readableDestination = destination.replaceAll("_", " ");
  if (passport.opaque) return `The uninterpreted word is attended to as a foreign body, addressed, and left as ${readableDestination}; no lexical meaning is fabricated.`;
  return `${passport.display} enters through ${primary}; ${tension[0].replaceAll("_", " ")} is held against ${tension[1].replaceAll("_", " ")}, and the route remains open in ${readableDestination}.`;
}
