const vscode = require('vscode');
const path = require('path');
const { execFile } = require('child_process');
const { Alerts, interval } = require('./alerts');
function activateBalance(context) {
  const bar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 91);
  bar.command = 'deepseekTokens.balance';
  const first = new Map(), alerts = new Alerts(context.globalState.get('balanceAlerts'));
  let values = [], updated = '', failure = '', busy = false, panel, disposed = false, child;
  let lastActivity = Date.now(), attempted = 0;
  const money = n => Number(n).toFixed(4);
  const unit = c => c === 'CNY' ? '¥' : c === 'USD' ? '$' : c + ' ';
  const touch = () => { lastActivity = Date.now(); };
  const delay = () => interval(vscode.window.state.focused, lastActivity, Date.now());
  function limits() {
    const c = vscode.workspace.getConfiguration('deepseekMonitor');
    return { CNY: { low: c.get('lowBalanceCNY', 10), drop: c.get('dropWarningCNY', 5) }, USD: { low: c.get('lowBalanceUSD', 2), drop: c.get('dropWarningUSD', 1) } };
  }
  function render() {
    bar.text = values.length ? `${failure ? '$(warning)' : '$(credit-card)'} 余额 ${values.map(i => unit(i.currency) + money(i.total)).join(' / ')}${failure ? ' 未更新' : ''}` : failure ? '$(warning) 余额查询失败' : '$(credit-card) 查询余额…';
    bar.tooltip = `DeepSeek 官方账户余额\n最近成功查询：${updated || '暂无'}\n活跃时30秒、闲置时5分钟刷新。点击查看详情。`;
    bar.show();
    if (!panel) return;
    const rows = values.map(i => `<tr><td>${i.currency}</td><td>${money(i.total)}</td><td>${money(i.topped)}</td><td>${money(i.granted)}</td><td>${money(i.total - first.get(i.currency))}</td></tr>`).join('');
    const l = limits();
    panel.webview.html = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><style>body{font-family:var(--vscode-font-family);padding:24px;line-height:1.8}td,th{padding:8px 16px;border-bottom:1px solid var(--vscode-panel-border)}p{max-width:800px}</style><h1>DeepSeek 账户余额</h1><p>最近成功查询：${updated || '暂无'}。当前刷新间隔：${delay() / 1000} 秒。点击状态栏可立即刷新，也可运行命令“DeepSeek：立即刷新余额”。</p>${failure ? '<p>查询失败：保留最近成功的数据，数值可能已过期。</p>' : ''}<table><tr><th>币种</th><th>总余额</th><th>充值余额</th><th>赠送余额</th><th>本次打开后的变化</th></tr>${rows}</table><p>低余额提醒：人民币 ${l.CNY.low} 元 / 美元 ${l.USD.low} 元；10 分钟下降提醒：人民币 ${l.CNY.drop} 元 / 美元 ${l.USD.drop} 元。在设置搜索 deepseekMonitor 可调整阈值，设为 0 关闭对应提醒。</p><p>余额为整个账户的官方余额，其他客户端消费、充值和赠送额度变动也会影响它。这里不是逐笔账单，余额变化不能单独归因于本项目。查询余额不调用模型；Token 统计读取本地记录。</p><p><a href="https://platform.deepseek.com/usage">查看官方完整用量与账单</a></p></html>`;
  }
  function refresh(force = false) {
    if (disposed || busy || (!force && Date.now() - attempted < delay())) return;
    busy = true; attempted = Date.now(); render();
    child = execFile('powershell.exe', ['-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', path.join(__dirname, 'Get-Balance.ps1'), '-KeyFile', path.resolve(__dirname, '..', '..', 'config', 'deepseek-key.clixml')], { windowsHide: true, timeout: 22000, maxBuffer: 65536 }, (error, stdout) => {
      busy = false; child = undefined; if (disposed) return;
      try {
        if (error) throw error;
        const response = JSON.parse(stdout.replace(/^\uFEFF/, '').trim());
        const parsed = response.balance_infos.map(i => ({ currency: i.currency, total: Number(i.total_balance), topped: Number(i.topped_up_balance), granted: Number(i.granted_balance) }));
        if (!parsed.length || parsed.some(i => !/^[A-Z]{3}$/.test(i.currency) || ![i.total, i.topped, i.granted].every(Number.isFinite))) throw Error('invalid');
        values = parsed; failure = '';
        for (const i of values) if (!first.has(i.currency)) first.set(i.currency, i.total);
        updated = new Date().toLocaleString('zh-CN', { hour12: false });
        for (const notice of alerts.check(values, limits(), Date.now())) {
          const amount = unit(notice.currency) + money(notice.value);
          const message = notice.kind === 'low' ? `DeepSeek 账户余额偏低：${amount}。` : `DeepSeek 账户余额在10分钟内下降 ${amount}，可能包含其他客户端消费或赠送额度变化。`;
          vscode.window.showWarningMessage(message, '查看官方账单').then(action => { if (action) vscode.env.openExternal(vscode.Uri.parse('https://platform.deepseek.com/usage')); });
        }
        context.globalState.update('balanceAlerts', alerts.saved());
      } catch { failure = 'unavailable'; }
      render();
    });
  }
  context.subscriptions.push(bar, vscode.commands.registerCommand('deepseekTokens.balance', () => {
    touch();
    if (!panel) { panel = vscode.window.createWebviewPanel('deepseekBalance', 'DeepSeek 余额', vscode.ViewColumn.Beside, { enableScripts: false }); panel.onDidDispose(() => { panel = undefined; }); } else panel.reveal();
    render(); refresh(true);
  }), vscode.commands.registerCommand('deepseekTokens.refreshBalance', () => { touch(); refresh(true); }), vscode.window.onDidChangeWindowState(s => { if (s.focused) touch(); refresh(); render(); }), vscode.window.onDidChangeActiveTextEditor(touch), vscode.workspace.onDidChangeTextDocument(touch), vscode.workspace.onDidChangeConfiguration(e => { if (e.affectsConfiguration('deepseekMonitor')) render(); }));
  const timer = setInterval(() => refresh(), 5000);
  context.subscriptions.push({ dispose: () => { disposed = true; clearInterval(timer); child?.kill(); panel?.dispose(); } });
  refresh(true);
  return { touch };
}
module.exports = { activateBalance };
