function summarize(records, includeSessions = true) {
  const unique = new Map();
  for (const record of records) {
    const usage = record.message?.usage;
    const id = record.message?.id;
    if (record.type !== 'assistant' || !usage || !id) continue;
    const item = unique.get(id) || { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, timestamp: '' };
    for (const [field, key] of Object.entries({ input: 'input_tokens', output: 'output_tokens', cacheRead: 'cache_read_input_tokens', cacheWrite: 'cache_creation_input_tokens' })) {
      const value = Number(usage[key]);
      if (Number.isFinite(value) && value >= 0) item[field] = Math.max(item[field], value);
    }
    if (record.timestamp > item.timestamp) item.timestamp = record.timestamp;
    unique.set(id, item);
  }
  const total = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, requests: unique.size };
  let latest = null;
  for (const item of unique.values()) {
    for (const key of ['input', 'output', 'cacheRead', 'cacheWrite']) total[key] += item[key];
    if (!latest || item.timestamp > latest.timestamp) latest = item;
  }
  const sessions = [];
  if (includeSessions) {
    const groups = new Map();
    for (const r of records) {
      if (r.type !== 'assistant' || !r.message?.usage) continue;
      const id = r.sessionId || r._sessionId || '未知会话';
      if (!groups.has(id)) groups.set(id, []);
      groups.get(id).push(r);
    }
    for (const [id, rows] of groups) sessions.push({ id, ...summarize(rows, false) });
    sessions.sort((a,b) => (b.latest?.timestamp || '').localeCompare(a.latest?.timestamp || ''));
  }
  return { total, latest, sessions };
}
module.exports = { summarize };
