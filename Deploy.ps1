$PathToBot = "C:\whatbot\whatwhat"
$PathToStaticStuff = "C:\whatbot"

"Sluk for los bottos"
Get-Process -Name "cmd" | Stop-Process -Force -Verbose
"Begynder deployement"
"Henter nyt shit fra GIT"
"Reset"
Invoke-Expression -Command "git reset --hard"
"pull"
Invoke-Expression -Command "git pull"
"Hent lort"
Invoke-Expression -Command "npm install"

"Ændre config"
$Token = Get-Content "$PathToStaticStuff\token.txt"
(Get-Content "$PathToBot\config\bot.json").Replace("<your token>", $Token) | Set-Content "$PathToBot\config\bot.json" -Verbose

"Start bot"
Invoke-Expression -Command "node bot.js"

"Profit"
