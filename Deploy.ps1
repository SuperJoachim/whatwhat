$PathToBot = "C:\whatbot\whatwhat"
$PathToStaticStuff = "C:\whatbot"

"Sluk for los bottos"
Get-Service -Name "whatbot" | stop-Service -Force -Verbose
Get-Process -Name "node" | Stop-Process -Force
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
$botID = Get-Content "$PathToStaticStuff\botid.txt"
(Get-Content "$PathToBot\config\bot.json").Replace("<your bot id>", $botID) | Set-Content "$PathToBot\config\bot.json" -Verbose
$csgoIP = Get-Content "$PathToStaticStuff\csgoip.txt"
(Get-Content "$PathToBot\config\bot.json").Replace("<your csgo server ip>", $csgoIP) | Set-Content "$PathToBot\config\bot.json" -Verbose
$rconpassword = Get-Content "$PathToStaticStuff\rconpassword.txt"
(Get-Content "$PathToBot\config\bot.json").Replace("<your rcon password>", $rconpassword) | Set-Content "$PathToBot\config\bot.json" -Verbose
$imageAPI = Get-Content "$PathToStaticStuff\imageAPI.txt"
(Get-Content "$PathToBot\config\bot.json").Replace("<your image api>", $imageAPI) | Set-Content "$PathToBot\config\bot.json" -Verbose

"Start bot"
Start-Service -Name "whatbot"

"Profit"
