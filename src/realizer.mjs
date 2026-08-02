const VIRTUAL = {
  du: { de: "du", ru: "ты" },
  height: { de: "Höhe", ru: "высота" },
  movement: { de: "Bewegung", ru: "движение" },
  erasure: { de: "Auslöschung", ru: "стирание" },
  catastrophe: { de: "Katastrophe", ru: "катастрофа" },
  future: { de: "Zukunft", ru: "будущее" },
  survivor: { de: "Überlebender", ru: "выживший" },
  truth: { de: "Wahrheit", ru: "истина" },
  redemption: { de: "Erlösung", ru: "искупление" },
  fruitful_process: { de: "Fruchtbares", ru: "плодотворное" },
  past: { de: "Vergangenes", ru: "прошлое" },
  home: { de: "Heimkehr", ru: "возвращение домой" },
  listening: { de: "Hören", ru: "слушание" },
  future_speech: { de: "künftige Rede", ru: "будущая речь" },
  premature_answer: { de: "voreilige Antwort", ru: "преждевременный ответ" },
  distance: { de: "Ferne", ru: "даль" },
  forced_speech: { de: "Zwangsrede", ru: "принуждённая речь" },
  voice: { de: "Stimme", ru: "голос" },
  reality: { de: "Wirklichkeit", ru: "реальность" },
  attention: { de: "Aufmerksamkeit", ru: "внимание" },
  object: { de: "Gegenstand", ru: "предмет" },
  history: { de: "Geschichte", ru: "история" },
  typography: { de: "Schriftbild", ru: "рисунок письма" },
  scratch: { de: "Ritz", ru: "царапина" },
  image: { de: "Bild", ru: "изображение" },
  signal: { de: "Signal", ru: "сигнал" },
  persistence: { de: "Beharren", ru: "стойкость" },
  scientific_name: { de: "Sachname", ru: "точное имя" },
  compound: { de: "Wortfügung", ru: "словосложение" },
  relation: { de: "Beziehung", ru: "отношение" },
  line_break: { de: "Zeilenbruch", ru: "разрыв строки" },
  meaning: { de: "Sinn", ru: "смысл" },
  blank_space: { de: "Leerraum", ru: "пустое место" },
  encounter: { de: "Begegnung", ru: "встреча" },
  poem: { de: "Gedicht", ru: "стихотворение" },
  self: { de: "Selbst", ru: "я" },
  question: { de: "Frage", ru: "вопрос" },
  gap: { de: "Lücke", ru: "просвет" },
  compression: { de: "Verdichtung", ru: "сгущение" },
  explanation: { de: "Erklärung", ru: "объяснение" },
  technical_lexicon: { de: "Fachwort", ru: "техническое слово" },
  transition: { de: "Übergang", ru: "переход" },
  mask: { de: "Maske", ru: "маска" },
  residue: { de: "Rest", ru: "остаток" },
  address: { de: "Anrede", ru: "обращение" },
  rupture: { de: "Riß", ru: "разрыв" },
  inside: { de: "Innen", ru: "внутреннее" },
  outside: { de: "Außen", ru: "внешнее" },
  wholeness: { de: "Ganzes", ru: "целое" },
  ascent: { de: "Aufstieg", ru: "подъём" },
  interruption: { de: "Abbruch", ru: "прерывание" },
  song: { de: "Gesang", ru: "пение" },
  wasteland: { de: "Ödland", ru: "пустошь" },
  solidarity: { de: "Beistand", ru: "солидарность" },
  pressure: { de: "Druck", ru: "давление" },
  protection: { de: "Schutz", ru: "защита" },
  speech: { de: "Rede", ru: "речь" },
  arrival: { de: "Ankunft", ru: "прибытие" },
  failure_to_reach: { de: "Nichtankunft", ru: "не-достижение" },
  orientation: { de: "Richtung", ru: "направление" },
  coercion: { de: "Zwang", ru: "принуждение" },
  clarity: { de: "Klarheit", ru: "ясность" },
  contact: { de: "Berührung", ru: "касание" },
  damage: { de: "Verletzung", ru: "повреждение" },
  recognition: { de: "Erkennen", ru: "узнавание" },
  identity: { de: "Eigenes", ru: "своё" },
  absence: { de: "Abwesenheit", ru: "отсутствие" },
  presence: { de: "Gegenwart", ru: "присутствие" },
  erosion: { de: "Abtrag", ru: "выветривание" },
  preservation: { de: "Bewahren", ru: "сохранение" },
  seeing: { de: "Sehen", ru: "зрение" },
  blindness: { de: "Blindheit", ru: "слепота" },
  proximity: { de: "Nähe", ru: "близость" },
  fold: { de: "Falte", ru: "складка" },
  noise: { de: "Lärm", ru: "шум" },
  reception: { de: "Empfang", ru: "приём" },
  control: { de: "Kontrolle", ru: "контроль" },
  retention: { de: "Halten", ru: "удержание" },
  connection: { de: "Bindung", ru: "связь" },
  cut: { de: "Schnitt", ru: "разрез" },
  structure: { de: "Gefüge", ru: "структура" },
  destruction: { de: "Zerstörung", ru: "разрушение" },
  hope: { de: "Hoffnung", ru: "надежда" },
  guarantee: { de: "Gewähr", ru: "гарантия" },
  debt: { de: "Schuld", ru: "долг" },
  guidance: { de: "Leitstrahl", ru: "наведение" },
  danger: { de: "Gefahr", ru: "опасность" },
  latency: { de: "Latenz", ru: "отсрочка" },
  explosion: { de: "Sprengung", ru: "взрыв" },
  form: { de: "Form", ru: "форма" },
  foreignness: { de: "Fremdheit", ru: "чуждость" },
  opacity: { de: "Undurchsichtiges", ru: "непроницаемое" },
  materiality: { de: "Stoff", ru: "вещество" },
  night: { de: "Nacht", ru: "ночь" }
};

const PROPERTY_TERMS = {
  "weight": { de: "Gewicht", ru: "вес" },
  "hardness": { de: "Härte", ru: "твёрдость" },
  "mute surface": { de: "stumme Fläche", ru: "немая поверхность" },
  "mineral duration": { de: "Mineralzeit", ru: "минеральное время" },
  "ability to be carried": { de: "Tragbarkeit", ru: "возможность нести" },
  "breathable space": { de: "Atemraum", ru: "пространство дыхания" },
  "pressure": { de: "Druck", ru: "давление" },
  "invisibility": { de: "Unsichtbares", ru: "невидимое" },
  "medium of voice": { de: "Stimmraum", ru: "среда голоса" },
  "enclosed volume": { de: "eingeschlossener Raum", ru: "замкнутый объём" },
  "curved skin": { de: "gekrümmte Haut", ru: "изогнутая кожа" },
  "inner pressure": { de: "Innendruck", ru: "внутреннее давление" },
  "fragile wholeness": { de: "brüchiges Ganzes", ru: "хрупкое целое" },
  "hard leaves": { de: "hartes Laub", ru: "жёсткая листва" },
  "thorns": { de: "Dornen", ru: "колючки" },
  "concealment": { de: "Verbergung", ru: "укрытие" },
  "upright persistence": { de: "aufrechtes Beharren", ru: "стойкость в полный рост" },
  "exposure": { de: "Freilegung", ru: "обнажение" },
  "orientation": { de: "Richtung", ru: "направление" },
  "coercive visibility": { de: "erzwungenes Sichtbarsein", ru: "принудительная видимость" },
  "collection of signs": { de: "gesammelte Zeichen", ru: "собранные знаки" },
  "measurement": { de: "Meßpunkt", ru: "точка измерения" },
  "standardized language": { de: "Normrede", ru: "стандартизированная речь" },
  "absence": { de: "Abwesenheit", ru: "отсутствие" },
  "uninterpreted material": { de: "ungedeuteter Stoff", ru: "неистолкованное вещество" },
  "uninterpreted foreignness": { de: "ungedeutete Fremdheit", ru: "неистолкованная чуждость" }
};

export function realizePlan(passport, plan, form, authorModel, language, random) {
  const selectedEvents = selectEvents(plan.events, form.targetVisibleLines);
  const realized = selectedEvents.map((event) => ({
    event,
    line: realizeEvent(event, passport, authorModel, language, random)
  }));
  const fractured = fractureTowardTarget(realized, form, random);
  const withIntervals = insertIntervals(fractured, form.blankIntervals);
  const lines = withIntervals.map((item) => typeof item === "string" ? item : item.line);
  return {
    lines,
    visibleLines: lines.filter(Boolean),
    stageCoverage: [...new Set(fractured.flatMap((item) => item.stages))],
    eventCoverage: [...new Set(fractured.flatMap((item) => item.eventIds))]
  };
}

function selectEvents(events, target) {
  if (events.length <= target) return events;
  const keep = new Set(["attention", "transformation", "counterforce", "encounter", "residue"]);
  const essential = events.filter((event) => keep.has(event.stage));
  if (essential.length >= target) return essential.slice(0, target - 1).concat(essential.at(-1));
  return [...essential, ...events.filter((event) => !keep.has(event.stage))].slice(0, target);
}

function realizeEvent(event, passport, authorModel, language, random) {
  const input = safeDisplay(passport.display);
  const a = event.from === "input" ? input : term(event.from, language, authorModel);
  const b = term(event.to, language, authorModel);
  const property = propertyTerm(
    event.property ?? event.to,
    language,
    event.relation === "attends_to" ? event.to : event.from,
    authorModel
  );
  const seedUpper = language === "ru" ? input.toLocaleUpperCase("ru-RU") : input.toLocaleUpperCase("de-DE");

  if (event.relation === "attends_to") {
    return passport.dimensions.gravity > 0.72 || passport.opaque
      ? `${seedUpper},`
      : choose(random, language === "ru" ? [`${input}: ${property}.`, `${seedUpper},`] : [`${input}: ${property}.`, `${seedUpper},`]);
  }
  if (event.relation === "contains") return language === "ru" ? `${input}, внутри: ${b}.` : `${input}, innen: ${b}.`;
  if (event.relation === "shows_property") return language === "ru" ? `${a}: ${property}.` : `${a}: ${property}.`;
  if (event.relation === "sides_with") return language === "ru" ? `${a} — на твоей стороне.` : `${a}, auf deiner Seite.`;
  if (event.relation === "holds_tension") return language === "ru" ? `${a} — и всё же: ${b}.` : `${a} — und dennoch: ${b}.`;
  if (event.relation === "carries") return language === "ru" ? `${a} несёт: ${b}.` : `${a} trägt: ${b}.`;
  if (event.relation === "destabilizes") return language === "ru" ? `${a} кружит: ${b}.` : `${a} macht schwindlig: ${b}.`;
  if (event.relation === "approaches_through") return language === "ru" ? `через ${a} / к тебе.` : `durch ${a} / zu dir.`;
  if (event.relation === "coerces") return language === "ru" ? `${a} принуждает: ${b}.` : `${a} zwingt: ${b}.`;
  if (event.relation === "leaves") return language === "ru" ? `остаётся: ${b}.` : `übrig: ${b}.`;
  if (event.relation === "casts") return language === "ru" ? `из ${a} отлито: ${b}.` : `aus ${a} gegossen: ${b}.`;
  if (event.relation === "fades_into") return language === "ru" ? `${a}, к серому: ${b}.` : `${a}, ins Graue: ${b}.`;
  if (event.relation === "seals") return language === "ru" ? `${a} запечатывает: ${b}.` : `${a} versiegelt: ${b}.`;
  if (event.relation === "delays") return language === "ru" ? `${a} отсрочивает: ${b}.` : `${a} hält zurück: ${b}.`;
  if (event.relation === "opens_without_guarantee") return language === "ru" ? `${a} открывает ${b}, без гарантии.` : `${a} öffnet ${b}, ohne Gewähr.`;
  if (event.relation === "burdens") return language === "ru" ? `${a} тяготеет над: ${b}.` : `${a} lastet auf: ${b}.`;
  if (event.relation === "opens") return language === "ru" ? `${a} открывает: ${b}.` : `${a} öffnet: ${b}.`;
  if (event.relation === "exposes") return language === "ru" ? `${a} обнажает: ${b}.` : `${a} legt frei: ${b}.`;
  if (event.relation === "resists") return language === "ru" ? `${a} — против: ${b}.` : `${a} — wider: ${b}.`;
  if (event.relation === "coexists_with") return language === "ru" ? `${a}, одновременно: ${b}.` : `${a}, zugleich: ${b}.`;
  if (event.relation === "keeps_unfinished") return language === "ru" ? `${a} не завершает: ${b}.` : `${a} schließt nicht ab: ${b}.`;
  if (event.relation === "returns_without_restoring") return language === "ru" ? `${a} возвращает, не восстанавливая: ${b}.` : `${a} kehrt wieder, stellt nicht her: ${b}.`;
  if (event.relation === "makes_room_for") return language === "ru" ? `${a} освобождает место: ${b}.` : `${a} räumt ein: ${b}.`;
  if (event.relation === "refuses") return language === "ru" ? `${a} отказывает: ${b}.` : `${a} verweigert: ${b}.`;
  if (event.relation === "alternates_with") return language === "ru" ? `${a}, в чередовании: ${b}.` : `${a}, wechselnd mit: ${b}.`;
  if (event.relation === "receives") return language === "ru" ? `${a} принимает: ${b}.` : `${a} empfängt: ${b}.`;
  if (event.relation === "guides") return language === "ru" ? `${a} наводит: ${b}.` : `${a} weist ein: ${b}.`;
  if (event.relation === "arrives_toward") return language === "ru" ? `${a} идёт / к тебе.` : `${a} kommt / auf dich zu.`;
  if (event.relation === "passes_through") return language === "ru" ? `${a} проходит через: ${b}.` : `${a} geht durch: ${b}.`;
  if (event.relation === "is_wounded_by") return language === "ru" ? `${a}, ранено: ${b}.` : `${a}, verwundet von: ${b}.`;
  if (event.relation === "orients") return language === "ru" ? `${a} намечает: ${b}.` : `${a} zeichnet: ${b}.`;
  if (event.relation === "names_as") return language === "ru" ? `${a} называет: ты.` : `${a} nennt: du.`;
  if (event.relation === "can_witness") return language === "ru" ? `${a} свидетельствует: ${b}.` : `${a} bezeugt: ${b}.`;
  if (event.relation === "murmurs") return language === "ru" ? `${a} бормочет: ${b}.` : `${a} murmelt: ${b}.`;
  if (event.relation === "breaks") return language === "ru" ? `${a} разрывает: ${b}.` : `${a} bricht: ${b}.`;
  if (event.relation === "inscribes") return language === "ru" ? `${a} вписывает: ${b}.` : `${a} ritzt ein: ${b}.`;
  if (event.relation === "resonates_with") return language === "ru" ? `${a} отзывается: ${b}.` : `${a} antwortet: ${b}.`;
  if (event.relation === "folds") return language === "ru" ? `${a} складывает: ${b}.` : `${a} faltet: ${b}.`;
  if (event.relation === "increases") return language === "ru" ? `${a} увеличивает: ${b}.` : `${a} vergrößert: ${b}.`;
  if (event.relation === "holds") return language === "ru" ? `${a} удерживает: ${b}.` : `${a} hält: ${b}.`;
  if (event.relation === "ruptures_into") return language === "ru" ? `${a} рвётся — в ${b}.` : `${a} reißt — in ${b}.`;
  if (event.relation === "shelters") return language === "ru" ? `${a} укрывает: ${b}.` : `${a} birgt: ${b}.`;
  if (event.relation === "compresses") return language === "ru" ? `${a} сгущает: ${b}.` : `${a} verdichtet: ${b}.`;
  if (event.relation === "structures") return language === "ru" ? `${a} строит: ${b}.` : `${a} gliedert: ${b}.`;
  if (event.relation === "moves_toward") return language === "ru" ? `${a} — в пути / к тебе.` : `${a}, unterwegs / zu dir.`;
  if (event.relation === "returns_through") return language === "ru" ? `${a} возвращается через: ${b}.` : `${a} kehrt durch ${b} zurück.`;
  if (event.relation === "removes") return language === "ru" ? `${a} снимает: ${b}.` : `${a} nimmt fort: ${b}.`;
  if (event.relation === "maps") return language === "ru" ? `${a} размечает: ${b}.` : `${a} vermisst: ${b}.`;
  if (event.relation === "records") return language === "ru" ? `${a} хранит слепок: ${b}.` : `${a} nimmt den Abdruck: ${b}.`;
  if (event.relation === "keeps_open") return language === "ru" ? `${a} оставляет открытым: ${b}.` : `${a} hält offen: ${b}.`;
  if (event.relation === "addresses") return language === "ru" ? `${a}: ты.` : `${a}: du.`;
  if (event.relation === "enters") return language === "ru" ? `${a} входит: ${b}.` : `${a} tritt ein: ${b}.`;
  return language === "ru" ? `${a} — ${event.relation.replaceAll("_", " ")}: ${b}.` : `${a} — ${event.relation.replaceAll("_", " ")}: ${b}.`;
}

function fractureTowardTarget(realized, form, random) {
  const items = realized.map(({ event, line }) => ({ line, stages: [event.stage], eventIds: [event.id] }));
  while (items.length > form.targetVisibleLines) {
    const removableIndex = items.findIndex((item) => item.stages.includes("material"));
    if (removableIndex < 0) break;
    items.splice(removableIndex, 1);
  }
  let guard = 0;
  while (items.length < form.targetVisibleLines && guard < 20) {
    guard += 1;
    const candidates = items
      .map((item, index) => ({ item, index, split: splitLine(item.line) }))
      .filter((candidate) => candidate.split && random() < form.fractureRate + 0.25);
    if (!candidates.length) break;
    const chosen = candidates[Math.floor(random() * candidates.length)];
    const [first, second] = chosen.split;
    items.splice(chosen.index, 1,
      { ...chosen.item, line: first },
      { ...chosen.item, line: second }
    );
  }
  return items.slice(0, form.targetVisibleLines);
}

function splitLine(line) {
  for (const marker of [" / ", ": ", " — ", ", "]) {
    const index = line.indexOf(marker);
    if (index < 2 || index > line.length - marker.length - 2) continue;
    const left = line.slice(0, index + (marker === ", " ? 1 : marker === " — " ? 2 : marker === " / " ? 0 : 1)).trim();
    const right = line.slice(index + marker.length).trim();
    if (countWords(left) < 1 || countWords(right) < 1) continue;
    return [left, right];
  }
  return null;
}

function insertIntervals(items, count) {
  if (count <= 0 || items.length < 5) return items;
  const encounter = items.findIndex((item) => item.stages.includes("encounter"));
  const residue = items.findIndex((item) => item.stages.includes("residue"));
  const breaks = [...new Set([encounter, count > 1 ? residue : -1].filter((index) => index > 0))].sort((a, b) => a - b);
  return items.flatMap((item, index) => breaks.includes(index) ? ["", item] : [item]);
}

function term(id, language, authorModel) {
  const concept = authorModel.concepts[id];
  if (concept?.lex?.[language]?.noun) return concept.lex[language].noun;
  return VIRTUAL[id]?.[language] ?? String(id).replaceAll("_", language === "ru" ? " " : "-");
}

function propertyTerm(value, language, conceptId, authorModel) {
  const characterCount = String(value ?? "").match(/^(\d+) visible characters$/);
  if (characterCount) return language === "ru" ? `${characterCount[1]} видимых знаков` : `${characterCount[1]} sichtbare Zeichen`;
  const formal = {
    "segmented spelling": { de: "gegliederte Schrift", ru: "сегментированное написание" },
    "continuous spelling": { de: "ungeteilte Schrift", ru: "слитное написание" },
    "contains digits": { de: "Ziffern im Wortkörper", ru: "цифры внутри слова" },
    "alphabetic body": { de: "Buchstabenkörper", ru: "буквенное тело" }
  };
  if (formal[value]) return formal[value][language];
  return PROPERTY_TERMS[value]?.[language]
    ?? VIRTUAL[value]?.[language]
    ?? authorModel.concepts[conceptId]?.lex?.[language]?.surface
    ?? String(value ?? "materiality").replaceAll("_", " ");
}

function safeDisplay(value) {
  return value.replace(/[<>]/g, "");
}

function choose(random, values) {
  return values[Math.floor(random() * values.length)];
}

function countWords(value) {
  return value.match(/\p{L}+(?:[-’']\p{L}+)*/gu)?.length ?? 0;
}
