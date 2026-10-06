# Claude Code + DeepSeek 图形客户端配置总结

记录日期：2026 年 10 月 6 日。

## 目标与结果

目标是在 Windows 上使用带聊天框、项目文件列表和代码编辑区域的编程客户端，连接 DeepSeek，在 D 盘保存专用配置，并提供桌面启动入口。

最终采用 **VS Code + 官方 Claude Code 扩展 + DeepSeek API**。终端连接测试成功返回 `CONNECTION_OK`，图形聊天界面也已实际收到回复。桌面快捷方式名为 **Claude Code + DeepSeek**。

这是通过独立的 DeepSeek API 凭据使用 Claude Code，并没有解除原 Claude 桌面账号的身份验证限制，也没有开通 Claude 会员。

## 本次解决的问题

1. **Claude 账号无法回复**：原桌面应用明确要求身份验证。流程推进到了 Persona 相机验证，证件及自拍只能由账号本人完成。
2. **改用其他厂商模型**：接入 DeepSeek 提供的 Anthropic 兼容接口，使用专用 API 密钥，按 DeepSeek API 用量计费。
3. **Claude Code 安装失败**：安装程序直接访问下载服务时报连接拒绝。让安装进程使用电脑现有的本地代理后，安装成功。
4. **需要图形客户端**：复用已安装的 VS Code，安装官方 Claude Code 扩展，启用图形聊天面板。
5. **启动入口及配置迁到 D 盘**：建立独立配置目录，更新桌面快捷方式，并确认新工作目录。
6. **中文语言包不兼容**：自动更新后的语言包要求更高的编辑器版本。安装与现有编辑器匹配的版本后，编辑器中文菜单生效。
7. **Claude Code 面板仍为英文**：编辑器语言包不会翻译扩展内部的全部文字。对本地扩展界面的常用按钮和提示做了可恢复的汉化，保留原文件备份。

## 已配置的组件

| 组件 | 本次配置 |
| --- | --- |
| 编辑器 | VS Code 1.104.3，复用原安装 |
| Claude Code CLI | 2.1.291 |
| 官方图形扩展 | Anthropic Claude Code 2.1.291 |
| 中文语言包 | 与 VS Code 1.104 匹配的简体中文版本 |
| 模型 | `deepseek-flash[1m]`，按本次配置时的 DeepSeek 官方指南设置 |
| API 地址 | `https://api.deepseek.com/anthropic` |
| 认证 | DeepSeek 专用 API 密钥，通过启动进程的环境变量传入 |

模型名称、接口支持及价格可能变化，后续以服务商官方文档为准。

## 本机目录与启动方式

专用根目录：`D:\ClaudeCode-DeepSeek`。

| 路径 | 用途 |
| --- | --- |
| `Start-Client.vbs` | 桌面快捷方式调用的图形启动入口 |
| `Start-Client.ps1` | 读取加密密钥、设置接口环境并打开客户端 |
| `Start-DeepSeek.cmd` / `Start-DeepSeek.ps1` | 保留的终端启动方式 |
| `workspace` | 默认项目工作目录 |
| `client-data` | 这个专用客户端的编辑器设置、状态和日志 |
| `extensions` | 专用扩展及本地汉化文件 |
| `config` | Windows 加密保存的 API 凭据及原界面文件备份 |

VS Code 主程序复用原 D 盘安装。Claude Code 独立可执行文件仍在 Windows 用户目录的标准安装位置；本次迁移的是启动入口、专用客户端配置和默认工作目录。

日常使用：

1. 双击桌面 **Claude Code + DeepSeek**。
2. 在 Claude Code 聊天框输入任务。
3. 需要操作已有项目时，用编辑器的“文件 → 打开文件夹”选择项目目录。
4. 首次访问一个新项目时，核对目录后确认是否信任它；不要直接在 PowerShell 提示符下输入聊天内容。
5. 模型请求消耗 DeepSeek API 余额，充值与账单由 DeepSeek 官方平台管理。

## 凭据与上传范围

密钥采用 Windows SecureString / DPAPI 加密保存，不写入启动脚本文本，不需要在聊天里提供。该加密文件绑定当前 Windows 用户和本机，不能作为可移植配置直接复制到另一台电脑。

本仓库只保存总结说明，不包含密钥、加密凭据文件、账户余额、个人身份资料、聊天记录或扩展原始代码。它是一次配置过程的记录，不是可以直接部署的完整客户端安装包。

## 汉化与维护边界

- 编辑器的简体中文来自语言包；Claude Code 面板的常用文字来自本地汉化，两者是不同层面的修改。
- 已检查汉化后的 JavaScript 语法，并观察到输入提示、会话标题和操作模式显示中文。少量动态提示、模型介绍或尚未覆盖的界面仍可能是英文；不宣称完整官方中文支持。
- 原始界面文件有备份。恢复时应关闭这个客户端，将对应版本的备份还原，再重新打开。
- 为避免汉化被覆盖，已关闭这个专用客户端的扩展自动更新。需要定期检查更新，手动升级后重新验证语言包兼容性、模型连接及汉化。
- 若关闭代理软件后无法连接，应检查启动脚本使用的本地代理是否仍在运行，不应通过反复充值处理网络问题。
- Claude 账号身份验证、Claude 会员与 DeepSeek API 计费彼此独立。未来要使用原 Claude 桌面账号或订阅权益，仍需本人完成官方验证并另行付款。

## 官方参考

- [Claude 账号身份验证](https://support.claude.com/en/articles/14328960-identity-verification-on-claude)
- [Claude Code 安装](https://code.claude.com/docs/en/quickstart)
- [Claude Code 的 VS Code 图形扩展](https://code.claude.com/docs/en/vs-code)
- [DeepSeek 接入 Claude Code](https://api-docs.deepseek.com/quick_start/agent_integrations/claude_code/)
- [DeepSeek 官方平台](https://platform.deepseek.com/)
