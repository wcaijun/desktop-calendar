' 双击此文件即可无黑框启动桌面校历（开发模式）
Set fso = CreateObject("Scripting.FileSystemObject")
Set sh = CreateObject("WScript.Shell")
dir = fso.GetParentFolderName(WScript.ScriptFullName)
exe = dir & "\node_modules\electron\dist\electron.exe"
If fso.FileExists(exe) Then
  sh.CurrentDirectory = dir
  sh.Run """" & exe & """ """ & dir & """", 0, False
Else
  MsgBox "未找到 electron.exe，请先在项目目录执行 npm install", 48, "桌面校历"
End If