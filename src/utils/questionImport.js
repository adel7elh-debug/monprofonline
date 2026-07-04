const requiredColumns = [
  'quiz_title',
  'subject',
  'question',
  'answer_a',
  'answer_b',
  'answer_c',
  'answer_d',
  'correct_answer',
  'explanation',
];

const answerKeys = ['A', 'B', 'C', 'D'];

const normalizeHeader = (value) => value?.trim().toLowerCase().replace(/\s+/g, '_');

const parseDelimited = (text, delimiter = ',') => {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
};

const getText = (node) => node?.textContent || '';

const columnIndex = (cellRef) => {
  const letters = cellRef.replace(/[0-9]/g, '');
  return [...letters].reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0) - 1;
};

const inflate = async (bytes) => {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
};

const readZipEntries = async (arrayBuffer) => {
  const view = new DataView(arrayBuffer);
  const bytes = new Uint8Array(arrayBuffer);
  let eocd = -1;

  for (let index = bytes.length - 22; index >= 0; index -= 1) {
    if (view.getUint32(index, true) === 0x06054b50) {
      eocd = index;
      break;
    }
  }
  if (eocd < 0) throw new Error('Fichier Excel invalide.');

  const entryCount = view.getUint16(eocd + 10, true);
  const centralOffset = view.getUint32(eocd + 16, true);
  const entries = {};
  let offset = centralOffset;

  for (let entry = 0; entry < entryCount; entry += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) throw new Error('Fichier Excel invalide.');
    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localOffset = view.getUint32(offset + 42, true);
    const name = new TextDecoder().decode(bytes.slice(offset + 46, offset + 46 + nameLength));

    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = bytes.slice(dataStart, dataStart + compressedSize);
    entries[name] = method === 0 ? compressed : await inflate(compressed);

    offset += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
};

const parseXlsx = async (file) => {
  if (!('DecompressionStream' in window)) {
    throw new Error('Import Excel non supporté par ce navigateur. Enregistrez le fichier en CSV puis réessayez.');
  }

  const entries = await readZipEntries(await file.arrayBuffer());
  const decoder = new TextDecoder();
  const xml = (path) => entries[path] ? new DOMParser().parseFromString(decoder.decode(entries[path]), 'text/xml') : null;
  const shared = [...(xml('xl/sharedStrings.xml')?.querySelectorAll('si') || [])].map((item) =>
    [...item.querySelectorAll('t')].map(getText).join(''),
  );
  const sheet = xml('xl/worksheets/sheet1.xml');
  if (!sheet) throw new Error('Aucune feuille Excel lisible.');

  return [...sheet.querySelectorAll('sheetData row')].map((row) => {
    const cells = [];
    row.querySelectorAll('c').forEach((cell) => {
      const ref = cell.getAttribute('r') || '';
      const value = getText(cell.querySelector('v'));
      const type = cell.getAttribute('t');
      const text = type === 's'
        ? shared[Number(value)] || ''
        : (type === 'inlineStr' ? getText(cell.querySelector('is t')) : value);
      cells[columnIndex(ref)] = text.trim();
    });
    return cells;
  }).filter((row) => row.some(Boolean));
};

const rowsToObjects = (rows) => {
  const headers = (rows[0] || []).map(normalizeHeader);
  return rows.slice(1).map((row, index) => ({
    line: index + 2,
    values: Object.fromEntries(headers.map((header, column) => [header, row[column]?.trim() || ''])),
  }));
};

export const parseQuestionImportFile = async (file) => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'xlsx') return rowsToObjects(await parseXlsx(file));
  const text = await file.text();
  const firstLine = text.split(/\r?\n/).find(Boolean) || '';
  const delimiter = extension === 'tsv' || firstLine.includes('\t')
    ? '\t'
    : (firstLine.split(';').length > firstLine.split(',').length ? ';' : ',');
  const rows = parseDelimited(text, delimiter);
  return rowsToObjects(rows);
};

export const validateQuestionImportRows = (items, subjects) => {
  const subjectNames = new Set(subjects.map((subject) => subject.name.trim().toLowerCase()));

  return items.map((item) => {
    const errors = [];
    const row = item.values;
    requiredColumns.forEach((column) => {
      if (column !== 'explanation' && !row[column]) errors.push(`${column} obligatoire`);
    });
    if (row.subject && !subjectNames.has(row.subject.trim().toLowerCase())) errors.push('Matière introuvable');
    if (row.correct_answer && !answerKeys.includes(row.correct_answer.trim().toUpperCase())) errors.push('correct_answer doit être A, B, C ou D');

    return {
      line: item.line,
      quiz_title: row.quiz_title,
      subject: row.subject,
      question: row.question,
      answer_a: row.answer_a,
      answer_b: row.answer_b,
      answer_c: row.answer_c,
      answer_d: row.answer_d,
      correct_answer: row.correct_answer?.trim().toUpperCase(),
      explanation: row.explanation,
      errors,
    };
  });
};
