const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { summarize } = require('./usage');
const count = n => Number(n || 0).toLocaleString('zh-CN');
const short = n => n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);
function activate(context) {
  const balance = require('./balance').activateBalance(context);
  const cache = new Map();
  let initialized = false;
  const bar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 90);
  bar.command = 'deepseekTokens.show';
  let data = { total: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, requests: 0 }, latest: null };
  let panel;
  let busy = false;
  let failure = '';
  function render() {
    if (!panel) return;
    const rows = item => `<tr><td>普通输入</td><td>${count(item.input)}</td></tr><tr><td>缓存读取</td><td>${count(item.cacheRead)}</td></tr><tr><td>缓存写入</td><td>${count(item.cacheWrite)}</td></tr><tr><td>输入合计</td><td>${count(item.input + item.cacheRead + item.cacheWrite)}</td></tr><tr><td>输出</td><td>${count(item.output)}</td></tr><tr><td>输入 + 输出合计</td><td>${count(item.input + item.cacheRead + item.cacheWrite + item.output)}</td></tr>`;
    panel.webview.html = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><style>body{font-family:var(--vscode-font-family);padding:24px;line-height:1.7}table{border-collapse:collapse;min-width:340px}td{padding:6px 20px 6px 0;border-bottom:1px solid var(--vscode-panel-border)}td:last-child{text-align:right}p{max-width:760px}</style><h1>Token 用量</h1><p>统计当前打开项目在本机 Claude Code 顶层会话记录中保存的模型请求。每 5 秒刷新，重复消息按请求 ID 去重；并非整个 DeepSeek 账户用量。</p><h2>本项目累计</h2><table>${rows(data.total)}<tr><td>已记录请求数</td><td>${count(data.total.requests)}</td></tr></table><h2>最近有记录的会话</h2>${data.sessions?.[0] ? '<table>' + rows(data.sessions[0].total) + '</table>' : '<p>暂无会话记录。</p>'}<h2>各会话累计</h2><table>${(data.sessions || []).map(s => '<tr><td>' + s.id.replace(/[^a-zA-Z0-9-]/g, '') + '</td><td>输入 ' + count(s.total.input + s.total.cacheRead + s.total.cacheWrite) + ' / 输出 ' + count(s.total.output) + '</td></tr>').join('')}</table><p>最近会话按记录时间排序，可能与界面当前选中的会话不同。分支历史按会话分别统计，本项目累计则跨会话去重。</p><h2>最近一次已记录请求</h2>${data.latest ? `<table>${rows(data.latest)}</table>` : '<p>暂无请求用量记录。</p>'}<p>缓存 Token 已计入输入合计。计数仅在请求记录写入后更新；不代表正在生成时的实时计数，也不等于当前上下文窗口占用。子代理及未写入本机记录的请求可能不在统计中。金额与完整账单请以 DeepSeek 官方平台为准。</p>${failure ? '<p>部分本机记录暂时无法读取，当前统计可能不完整。</p>' : ''}</html>`;
  }
  async function refresh() {
    if (busy) return;
    busy = true;
    try {
      const workspace = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!workspace) { bar.text = '$(graph) Token：未打开项目'; bar.show(); return; }
      const root = path.join(process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude'), 'projects');
      const expected = workspace.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const names = await fs.promises.readdir(root).catch(() => []);
      const folder = names.find(name => name.toLowerCase() === expected);
      const records = [];
      const seen = new Set();
      failure = '';
      if (folder) {
        const directory = path.join(root, folder);
        for (const file of await fs.promises.readdir(directory)) {
          if (!file.endsWith('.jsonl')) continue;
          try {
            const full = path.join(directory, file); seen.add(full);
            const stat = await fs.promises.stat(full), previous = cache.get(full);
            if (!previous || previous.mtime !== stat.mtimeMs || previous.size !== stat.size) {
              const content = await fs.promises.readFile(full, 'utf8'), rows = [];
              for (const line of content.split('\n')) { try { rows.push({ ...JSON.parse(line), _sessionId: file.slice(0, -6) }); } catch {} }
              cache.set(full, { mtime: stat.mtimeMs, size: stat.size, rows });
              if (initialized) balance.touch();
            }
            for (const row of cache.get(full).rows) records.push(row);
          } catch { failure = 'read'; }
        }
      }
      for (const key of cache.keys()) if (!seen.has(key)) cache.delete(key);
      initialized = true;
      data = summarize(records);
      const input = data.total.input + data.total.cacheRead + data.total.cacheWrite;
      bar.text = `$(graph) Token 本项目 ↑${short(input)} ↓${short(data.total.output)}`;
      bar.tooltip = `本项目累计输入：${count(input)}（含缓存）\n累计输出：${count(data.total.output)}\n点击查看明细；费用以 DeepSeek 账单为准。`;
      bar.show(); render();
    } catch { bar.text = '$(warning) Token：读取失败'; bar.show(); }
    finally { busy = false; }
  }
  context.subscriptions.push(bar, vscode.commands.registerCommand('deepseekTokens.show', () => {
    if (!panel) {
      panel = vscode.window.createWebviewPanel('deepseekTokens', 'Token 用量', vscode.ViewColumn.Beside, { enableScripts: false });
      panel.onDidDispose(() => { panel = undefined; });
    } else panel.reveal();
    render(); refresh();
  }), vscode.workspace.onDidChangeWorkspaceFolders(refresh));
  const timer = setInterval(refresh, 5000);
  context.subscriptions.push({ dispose: () => { clearInterval(timer); panel?.dispose(); } });
  refresh();
}
module.exports = { activate };
