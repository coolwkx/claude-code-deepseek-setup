Set shell = CreateObject("WScript.Shell")
Set fs = CreateObject("Scripting.FileSystemObject")
launcher = fs.BuildPath(fs.GetParentFolderName(WScript.ScriptFullName), "Start-Client.ps1")
shell.Run "powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File """ & launcher & """", 0, False
