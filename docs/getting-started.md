# 从零安装与配置

## 1. 准备软件和账户

准备 Windows 电脑、可联网的环境、VS Code、Claude Code 独立程序，以及自己的 DeepSeek 平台账户和 API 密钥。Git 用于下载与更新仓库；不用 Git 也可以下载 ZIP。Node.js 仅用于运行仓库测试，不是使用监控的必需条件。

从 [VS Code 官网](https://code.visualstudio.com/) 安装编辑器。安装时启用加入 PATH，之后重新打开 PowerShell，检查：

```powershell
Get-Command code.cmd
```

按 [Claude Code 官方安装说明](https://code.claude.com/docs/en/setup) 在 PowerShell 安装。官方提供的原生安装命令为：

```powershell
irm https://claude.ai/install.ps1 | iex
```

这条命令下载并执行官方安装脚本，应先确认来源。安装后打开新终端，检查本仓库启动器需要的位置：

```powershell
Test-Path "$env:USERPROFILE\.local\bin\claude.exe"
& "$env:USERPROFILE\.local\bin\claude.exe" --version
```

若程序在其他位置，需要调整两个启动脚本中的 `$claudePath`。Git for Windows 提供 Git 与 Git Bash，可按 Claude Code 官方说明安装；本仓库旧版本组合未验证没有 Git Bash 的情况。

登录 [DeepSeek 官方平台](https://platform.deepseek.com/)，在 API 密钥管理页面创建一枚专用密钥，并检查 API 余额是否可用。网页聊天账号能聊天不等于 API 账户已有可用额度。充值由你在官方平台完成，不需要向仓库作者提供账户或密钥。

## 2. 把仓库放到 D 盘

已安装 Git 的读者运行：

```powershell
 git clone https://github.com/coolwkx/claude-code-deepseek-setup.git D:\ClaudeCode-DeepSeek
 Set-Location D:\ClaudeCode-DeepSeek
```

仓库若仍为私有，只有获得授权的 GitHub 用户能下载。也可在 GitHub 页面选择 Code → Download ZIP，解压并将含 `Prepare-Client.ps1` 的目录命名为 `D:\ClaudeCode-DeepSeek`。不要额外套一层目录后在外层执行脚本。

## 3. 确认版本与模型

当前脚本固定 Claude Code 扩展 2.1.291，并安装 `MS-CEINTL.vscode-language-pack-zh-hans@1.104.2025091009`，对应本次测试的 VS Code 1.104.3。

如果使用其他 VS Code 版本，编辑 `Prepare-Client.ps1`，将语言包项改为与编辑器兼容的版本。对新版编辑器通常可使用不带版本后缀的 `MS-CEINTL.vscode-language-pack-zh-hans`；安装后仍须检查兼容提示。不要因为本教程记录旧版就盲目降级所有软件。

启动脚本当前主模型为 `deepseek-flash[1m]`。按 [DeepSeek 官方接入指南](https://api-docs.deepseek.com/zh-cn/quick_start/agent_integrations/claude_code/) 确认账户可用的模型名称；如已变化，调整 `Start-Client.ps1` 和 `Start-DeepSeek.ps1` 中的模型环境变量。方括号后缀是客户端上下文配置的一部分，不能随意照搬给不支持的模型。

## 4. 初始化专用客户端

在仓库目录运行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\Prepare-Client.ps1
```

它会建立专用目录、复制初始设置、安装指定扩展与自编监控，并创建桌面快捷方式。已有编辑器设置不会被覆盖。`ExecutionPolicy Bypass` 仅用于本次进程，不修改电脑全局执行策略；组织管理策略可能仍限制执行。

## 5. 保存自己的 API 密钥

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\Save-ApiKey.ps1
```

粘贴密钥并按 Enter。输入不显示字符是正常现象。密钥保存在 `config/deepseek-key.clixml`，绑定当前 Windows 用户和本机。更换电脑或用户后重新执行这一步，不要分享这个文件。

## 6. 可选：汉化常用聊天界面

VS Code 语言包负责编辑器菜单，不能保证翻译 Claude Code 内部聊天面板。关闭专用客户端后运行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\Apply-Chinese.ps1
```

补丁只支持扩展 2.1.291，保留原文件备份；不承诺所有文字中文化。不做这一步也可以中文提问和要求中文回答。

## 7. 启动与验收

双击桌面 **Claude Code + DeepSeek**，也可双击仓库的 `Start-Client.vbs`。使用这个入口才能加载专用配置和 DeepSeek 环境；直接打开普通 VS Code 不等价。

1. 项目打开后，核对路径是自己的 `workspace`，再确认信任。这个授权允许编程助手读写和执行项目文件。
2. 在 Claude Code 聊天面板输入“请用中文回复：连接成功”。不要输入到 PowerShell 命令行。
3. 收到模型回答后，点击底部 Token 查看本地用量；等待首次余额查询，点击余额看成功时间。
4. 若底部显示“未更新”，先按排查文档检查接口连接，不要以为旧余额是实时数据。

只有实际收到回复才能确认模型连接成功；只打开窗口或显示模型名称并不足以证明接口可用。

## 8. 已有项目怎么打开

在专用客户端使用“文件 → 打开文件夹”选择自己的项目。仅信任已核对的目录，首次让助手解释结构或提出计划，再审阅修改。默认 `workspace` 是空的工作区，不包含别人可直接运行的示例项目。
