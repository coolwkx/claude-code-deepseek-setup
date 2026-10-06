function interval(focused, lastActivity, now) { return focused && now - lastActivity < 120000 ? 30000 : 300000; }
class Alerts {
  constructor(saved = {}) { this.low = saved.low || {}; this.lastDrop = saved.lastDrop || 0; this.history = {}; }
  check(values, limits, now) {
    const notices = [];
    for (const item of values) {
      const low = limits[item.currency]?.low || 0, drop = limits[item.currency]?.drop || 0;
      if (low > 0 && item.total < low && !this.low[item.currency]) { this.low[item.currency] = true; notices.push({ kind: 'low', currency: item.currency, value: item.total }); }
      if (!low || item.total >= low * 1.1) this.low[item.currency] = false;
      let history = (this.history[item.currency] || []).filter(p => now - p.time <= 600000);
      if (history.length && item.total > history[history.length - 1].value) history = [];
      const decrease = history.length ? Math.max(...history.map(p => p.value)) - item.total : 0;
      if (drop > 0 && decrease >= drop && (!this.lastDrop || now - this.lastDrop >= 600000)) { this.lastDrop = now; notices.push({ kind: 'drop', currency: item.currency, value: decrease }); history = []; }
      history.push({ time: now, value: item.total }); this.history[item.currency] = history;
    }
    return notices;
  }
  saved() { return { low: this.low, lastDrop: this.lastDrop }; }
}
module.exports = { Alerts, interval };
