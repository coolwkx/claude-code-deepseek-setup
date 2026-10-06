# 文件与配置原理

## 文件地图

| 文件/目录 | 作用 | 是否可提交 |
| --- | --- | --- |
| `Prepare-Client.ps1` | 初始化目录、指定扩展、监控和桌面快捷方式 | 是 |
| `Save-ApiKey.ps1` | 本机隐藏输入并加密保存密钥 | 是；不包含实际密钥 |
| `Start-Client.ps1` / `.vbs` | 设置接口环境并打开专用图形客户端 | 是 |
| `Start-DeepSeek.ps1` / `.cmd` | 终端启动方式 | 是 |
| `Apply-Chinese.ps1` / `templates/` | 编辑器初始设置和本地汉化资源 | 是 |
| `Install-Monitor.ps1` / `token-monitor/` | 自编监控的安装入口与源文件 | 是 |
| `Test-Monitor.cjs` | 不调用模型的纯逻辑测试 | 是 |
| `config/` | 加密密钥与原界面备份 | 否 |
| `client-data/` | 专用 VS Code 状态、设置、日志 | 否 |
| `extensions/` | 实际安装的第三方扩展与监控副本 | 否 |
| `workspace/` | 默认项目目录 | 否 |

根目录下脚本按自身位置解析路径。因此把整套仓库放在 D 盘，就会在同一目录建立专用运行文件夹，不需要在脚本中写某个作者的用户名。VS Code 和 Claude Code 程序本体仍使用各自安装位置。

## 核心环境变量

`Start-Client.ps1` 与 `Start-DeepSeek.ps1` 设置以下变量，变更模型时应同时维护两个文件：

| 变量 | 含义 |
| --- | --- |
| `ANTHROPIC_BASE_URL` | 指向 DeepSeek 的 Anthropic 兼容地址 |
| `ANTHROPIC_AUTH_TOKEN` | 从本机加密文件解密后传给启动进程的密钥 |
| `ANTHROPIC_MODEL` | 主模型及客户端上下文标记 |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` / `SONNET` / `HAIKU` | 客户端模型别名对应的实际 DeepSeek 模型 |
| `CLAUDE_CODE_SUBAGENT_MODEL` | 子代理默认模型 |
| `CLAUDE_CODE_EFFORT_LEVEL` | 记录配置的推理强度 |
| `CLAUDE_CODE_AUTO_COMPACT_WINDOW` | 记录配置的压缩窗口参数 |

这里的别名不意味着请求发送到 Claude 模型。仓库中的模型、推理与窗口设置来自已测试实例，服务商或客户端变更后需要重新验证，不保证可以照搬到其他模型。

启动器移除当前进程继承的部分其他认证变量，避免混用凭据。密钥会进入客户端进程环境，以便请求服务，Windows 加密保存并不意味着运行时永远不解密。不要发布进程环境转储。

## 监控实现

`extension.js` 查找当前项目对应的 Claude Code 本机顶层 JSONL 会话文件，按修改时间和大小缓存解析结果；`usage.js` 汇总与去重。会话记录仍位于 Claude Code 配置目录下，不随仓库提交。

`balance.js` 调用 `Get-Balance.ps1`，后者在本机解密密钥并请求 DeepSeek 官方余额接口，失败时仅返回通用错误；`alerts.js` 处理低余额、滚动下降窗口和冷却。提醒状态保存在本机 VS Code 扩展状态中。

检查无需调用模型：

```powershell
node Test-Monitor.cjs
node --check token-monitor/extension.js
node --check token-monitor/balance.js
```

## 版本维护

汉化补丁从原文件备份生成修改，不反复叠加；只匹配扩展 2.1.291。升级后应重新评估界面结构。没有授权分发第三方扩展代码，仓库不存第三方扩展二进制或原文件备份。

教程和脚本可供阅读与复现；本仓库尚未声明开源许可证。如希望再分发或用于其他项目，应先确认许可范围。软件与模型服务各自遵循官方条款。
