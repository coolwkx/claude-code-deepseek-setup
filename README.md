# Windows 上用 Claude Code + DeepSeek：中文图形编程入门

把 VS Code 变成带聊天框、项目文件和代码编辑器的 AI 编程客户端，使用自己的 DeepSeek API，并在底部查看 Token 与余额。

本仓库提供配置脚本和中文教程，适合希望在 Windows 上一步步搭建的读者。已验证环境为 **Windows、VS Code 1.104.3、Claude Code 扩展 2.1.291**；不是适配所有版本的一键安装器。更新日期：2026-10-06。

## 先看懂三个东西

| 名称 | 在这套方案中负责什么 |
| --- | --- |
| VS Code | 显示文件、编辑代码和承载聊天面板 |
| Claude Code | 理解项目、提出修改、调用工具的编程助手 |
| DeepSeek API | 提供模型推理，按 API 用量计费 |

连接关系：**你 → VS Code 中的 Claude Code → DeepSeek 官方接口**。编辑器与编程工具的名称不代表背后一定使用 Claude 模型。

DeepSeek 提供 [Anthropic 兼容接口](https://api-docs.deepseek.com/guides/anthropic_api/)；本仓库使用这一接口。Claude 会员、Claude 账号验证和 DeepSeek API 余额分别管理。本方案不会解除 Claude 账号限制，也不会把 DeepSeek 充值变成 Claude 会员权益。

## 你将得到什么

- 桌面启动入口，默认项目和专用配置放在 D 盘。
- VS Code 简体中文菜单；可选的 Claude Code 常用界面汉化。
- 在聊天框中解释代码、修改项目并审阅结果。
- 中文 Token 用量和官方余额监控，低余额与余额下降提醒。
- 密钥在本机用 Windows 加密保存，不写入仓库。

## 从这里开始

1. **第一次配置：**阅读 [从零安装与配置](docs/getting-started.md)，按步骤做到首次回复。
2. **已经能打开：**阅读 [日常使用、费用与维护](docs/usage.md)。
3. **碰到问题：**查看 [常见问题排查](docs/troubleshooting.md)。
4. **想了解实现：**查看 [文件与配置原理](docs/configuration.md)。
5. **参考本次实际搭建：**查看 [配置记录与监控说明](docs/setup-record.md)。该记录中的版本和日期描述已验证实例。

## 快速配置（已安装 VS Code 和 Claude Code）

先把仓库放到 `D:\ClaudeCode-DeepSeek`，在该目录打开 **Windows PowerShell**。以下是实际命令；不要把命令前面的提示符一起复制。

```powershell
Set-Location D:\ClaudeCode-DeepSeek
Get-Command code.cmd
Test-Path "$env:USERPROFILE\.local\bin\claude.exe"
powershell -NoProfile -ExecutionPolicy Bypass -File .\Prepare-Client.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\Save-ApiKey.ps1
```

`Get-Command` 应找到 VS Code，`Test-Path` 应返回 `True`。如果不满足，先按安装教程解决。保存密钥时输入不可见是正常现象。可选汉化：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\Apply-Chinese.ps1
```

随后双击桌面 **Claude Code + DeepSeek**。在聊天框输入“请用中文回复：连接成功”，收到回答表示一次模型请求成功，也会产生少量 API 用量。更完整的验收方法见安装教程。

脚本固定扩展 2.1.291 和适用于 VS Code 1.104 的语言包版本。使用较新的 VS Code 时，先按教程调整语言包；汉化补丁仍只针对固定扩展版本。

## 关于费用和数据

- 模型请求由 DeepSeek API 计费；具体价格和余额以 [官方平台](https://platform.deepseek.com/) 为准，本仓库不承诺固定单价。
- 本地 Token 统计与余额查询不调用模型，不额外消耗模型 Token。余额接口有网络请求，刷新并非逐笔账单推送。
- Token 显示本项目本机顶层会话记录中的请求，可能漏掉子代理或尚未写入记录的请求。余额是账户级数据，不能当成项目精确费用。
- 使用编程助手时，被读取并用于请求的代码与文本会发往模型服务商。只在你有权访问和处理的项目中使用。
- `config/`、`client-data/`、`extensions/`、`workspace/` 和会话日志均被忽略。不要手动上传密钥、加密凭据或个人日志。

## 维护和反馈

教程覆盖原生 Windows；未验证 WSL、macOS、Linux 或任意扩展版本。汉化是本地常用文字补丁，部分英文仍会保留。专用配置关闭扩展自动更新以保持补丁，但应定期手动检查版本与安全更新。

反馈问题时说明 Windows、VS Code、Claude Code 的版本、执行到哪一步，以及脱敏后的错误文字。不要附 API 密钥、完整会话日志或个人账户信息。

### 官方资料

- [Claude Code 安装与 Windows 配置](https://code.claude.com/docs/en/setup)
- [Claude Code 的 VS Code 扩展](https://code.claude.com/docs/en/vs-code)
- [DeepSeek 接入 Claude Code](https://api-docs.deepseek.com/zh-cn/quick_start/agent_integrations/claude_code/)
- [DeepSeek 余额接口](https://api-docs.deepseek.com/zh-cn/api/get-user-balance/)
