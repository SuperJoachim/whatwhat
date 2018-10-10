/**
 * Configs
 */
var     botConfig       = require('./config/bot.json');

/**
 * Requires
 */
var     fs              = require('fs');
var     path            = require('path');
var     uuid            = require('uuid/v1');
var     request         = require('request');
var     prac            = require('./prac/prac.js');
var     match           = require('./match/match.js');
var     rime            = require('./rime/rime.js');
var     _               = require('lodash');
var     fileExtension   = require('file-extension');
var     cmd             = require('node-cmd');
var     ytdl            = require('ytdl-core');
var     pracJsonPath    = './prac/prac.json';
var     matchJsonPath   = './match/match.json';
var     logJson         = './log/log.json';
var     log             = require('./log/log.js');
var     tacs            = require('./tacs/tacs.js');
var     call            = require('./call/call.js');
var     analimages      = require('./analytics/images.js');
var     rp              = require('request-promise');


/**
 * Constants
 */
const   Discord         = require('discord.js');
const   client          = new Discord.Client();
const   download        = require('download');
const   imagePath       = path.join(botConfig.imageUploadPath + '\\');
const   babesfile       = botConfig.babePath;
const   lastshownfile   = botConfig.lastShownImage;

if (!fs.existsSync(imagePath)){
    fs.mkdirSync(imagePath)
}

if (!fs.existsSync(pracJsonPath)){
    l('prac file created');
    fs.writeFileSync(pracJsonPath, JSON.stringify({}));
}

if (!fs.existsSync(matchJsonPath)){
    l('match file created');
    fs.writeFileSync(matchJsonPath, JSON.stringify({}));
}

if (!fs.existsSync(logJson)){
    l('log file created');
    fs.writeFileSync(logJson, JSON.stringify({}));
}

_.mixin({
    isBlank: function(string) {
        return (_.isUndefined(string) || _.isNull(string) || string.trim().length === 0)
    }
});

/**
 * Bot connect
 */
client.on('ready', () => {
    console.log('I am ready!');
    //ClientUser.setStatus("online", "Din mor");
});

/**
 * On message
 */
client.on('message', message => {
    // Return if self.
    if (message.author.id == botConfig.id) {
        return;
    }

    var messageContent = message.content.trim().toLowerCase();

    log.log(message);

    // !call
    if (messageContent.indexOf('!call') > -1) {
        var customDiversions = messageContent.replace('!call', '').trim().toLowerCase();

        if (customDiversions) {
            if (!isNumeric(customDiversions) || customDiversions > 5) {
                respondToMessage(message, 'Use: !call <1-5>');
                return;
            }
        }

        respondToMessageTTS(message, call.getCall(customDiversions));
        return;
    }

    // !tacs
    if (messageContent.indexOf('!tacs') > -1) {
        var map = tacs.getTacs(message);

        if (fs.existsSync(map)) {
            respondToMessageWithFile(message, map);
        }
        else {
            respondToMessage(message, tacs.getTacList());
        }

        return;
    }

    // !waste
    if (messageContent.indexOf('!waste') > -1) {
        respondToMessage(message, log.getWaste(message));
        return;
    }

    // !say
    if (messageContent.indexOf('!say') > -1) {
        var count = messageContent.replace( /^\D+/g, '');

        if (count > 100) {
            count = 100;
        }

        if (!count) {
            count = 1;
        }

        var sayTxt = messageContent.replace('!say', '').replace(count, '');

        var response = '';

        for (var i = 0; i < count; i++) {
            response = response + ' ' + sayTxt.trim();
        }

        respondToMessageTTS(message, response.trim());

        return;
    }

    // !rime
    if (messageContent === '!rime') {
        var randomRime = rime.getRandomRime();

        respondToMessage(message, randomRime.author + ':');
        respondToMessageTTS(message, randomRime.rime);
        return;
    }

    // !addrime
    if (messageContent.indexOf('!addrime') > -1) {
        var newRime = messageContent.replace('!addrime', '').trim();

        if (!newRime) {
            respondToMessage(message, 'Daym - no rime, no dime..');
            return;
        }

        respondToMessage(message, rime.addRime(message.author, newRime));

        return;
    }

    // !anal
    if (messageContent.indexOf('!anal') > -1) {
        var imageToProcess = messageContent.replace('!anal ', '')

        analimages.analyzeImage(imageToProcess)
            .then(function(description) {
                respondToMessage(message, description);
            })
            .catch(function(error) {});

        return;
    }

    // !prac
    if (messageContent.indexOf('!prac') > -1) {
        var pracTxt = messageContent.replace('!prac', '').trim().toLowerCase();
        var matches = pracTxt.match(/([\w+]+)/g);
        var game = botConfig.defaultPracGame;
        var action = null;

        if (matches != undefined && matches[0] != undefined) {
            action = matches[0];
        }

        if (matches != undefined && matches[1] != undefined) {
            if (matches[1] && botConfig.pracGames.indexOf(matches[1]) > -1) {
                game = matches[1];
            }
            else {
                respondToMessage(message, 'Game is not valid. Available games are **' + botConfig.pracGames.join(', ') + '**. Default game is **' + botConfig.defaultPracGame + '**.');
                return;
            }
        }

        if (!action) {
            respondToMessage(message, prac.getPracSummary());
            return;
        }

        if (action == 'stats') {
            respondToMessage(message, prac.getPracStats());
            return;
        }

        if (action == 'server') {
            respondToMessage(message, prac.getServer());
            return;
        }

        if (action == 'help') {
            respondToMessage(message, prac.getPracHelp());
            return;
        }

        if (action == 'yes' || action == 'no' || action == 'remove' || action == 'maybe') {
            respondToMessage(message, prac.updatePrac(message.author, action, game));
            respondToMessage(message, prac.getPracSummary());
        }
        else {
            respondToMessage(message, '**' + action + '** is not a valid command. See !prac help');
        }

        return;
    }

    // !match
    if (messageContent.indexOf('!match') > -1) {
        var matchTxt = messageContent.replace('!match', '').trim().toLowerCase();
        var matches = matchTxt.match(/([\w+]+)/g);
        var args = matchTxt.split(' ');
        var action = null;

        if (matches != undefined && matches[0] != undefined) {
            action = matches[0];
        }

        if (!action) {
            respondToMessage(message, match.getMatchSummary());
            return;
        }

        if (action == 'archive') {
            respondToMessage(message, match.getMatchSummary(true));
            return;
        }

        if (action == 'help') {
            respondToMessage(message, match.getMatchHelp());
            return;
        }

        if (['add', 'remove', 'move', 'result', 'map'].indexOf(action) >= 0) {
            if (!authorHasRole(message, 'Members')) {
                respondToMessage(message, 'Sorry, members only.');
                return;
            }

            respondToMessage(message, match.updateMatches(action, args));
            return;
        }

        if (action == 'yes' || action == 'no') {
            if (!authorHasRole(message, 'Members')) {
                respondToMessage(message, 'Sorry, members only.');
                return;
            }

            matchHash = args[1];
            respondToMessage(message, match.updateMatch(message.author, action, matchHash));
            respondToMessage(message, match.getMatchSummary());
        }
        else {
            respondToMessage(message, '**' + action + '** is not a valid command. See !prac help');
        }

        return;
    }
    
    // !winrate
    if (messageContent.indexOf('!winrate') > -1) {
        var mapTxt = messageContent.replace('!winrate', '').trim().toLowerCase();
        respondToMessage(message, match.winRate(mapTxt));
        return;
    }

    // what what?
    if (messageContent === 'what what?') {
        respondToMessage(message, 'in the butt!');

        return;
    }

    // rcon cmd
    if (messageContent.indexOf('!rcon') > -1) {

        var rconCommand = messageContent.replace('!rcon ', '')

        let rcon = require('srcds-rcon')({
            address: botConfig.csgoserver,
            password: botConfig.rcon
        });

        rcon.connect().then(() => {
            return rcon.command(rconCommand).then(status =>  {
                respondToMessage(message, status)
            });
        }).then(
            () => rcon.disconnect()
        ).catch(err => {
            respondToMessage(message, err);
            respondToMessage(message, err.stack);
        });

        return;
    }

    // randomize teams
    if (messageContent.indexOf('!teams') > -1) {
        var members = messageContent.replace('!teams ', '').split(' ');
        var teams = _.chunk(_.shuffle(members, members.length), Math.ceil(members.length / 2));
        var response = '';

        _.forEach(teams, function(players, i) {
            response = response + '```diff\n';
            response = response + 'Team ' + (i+1) + '\n';
            response = response + '+ ' + players.join(', ') + '\n';
            response = response + '```';
        });

        respondToMessage(message, response);

        return;
    }

    // will you sing?
    if (messageContent === 'will you sing?') {
        respondToMessageTTS(message, 'What what in the butt');

        return;
    }

    // Truth
    if (messageContent === '!truth') {
        respondToMessage(message, 'https://strudseinfo.dk - sandheden omkring strudse. Det er sandt når det står på nettet.');

        return;
    }

    // what?
    if (messageContent === 'what?') {
        respondToMessage(message, 'https://www.youtube.com/watch?v=jC1s3c-sFF8');

        return;
    }

    // cawer
    if (messageContent.includes('cawer')) {
        respondToMessage(message, 'ALL HAIL THE KING CAWER');

        return;
    }

    // agge
    if (messageContent === 'agge?!') {
        respondToMessageTTS(message, _.fill(Array(50), 'agge').join(' '));
    }

    // Verden
    if (messageContent.includes('wonderful')) {
        const voiceChannel = message.member.voiceChannel;
        const streamOptinos = { seek: 0, volume: 1 };
        if (!voiceChannel) return message.reply(`Skal ind i en kanal først, nigga!`);
            voiceChannel.join()
            .then(connnection => {
        const stream = ytdl("https://www.youtube.com/watch?v=IiHPo3_MwPQ", { filter: 'audioonly' }).on('error', (err) => respondToMessage(message, err.toString()));
        const dispatcher = connnection.playStream(stream, streamOptinos);
        dispatcher.on('end', () => voiceChannel.leave());
      });
        return;
    }


    // nuller
    if (messageContent.includes('nuller')) {
        message.channel.sendFile("bc4b8784-f172-44c3-9aef-edbb4b0b496e.jpg");

        return;
    }

    // wow?
    if (messageContent === 'wow?') {
        var babe = fs.readFileSync(lastshownfile);
        var textToAppend = babe + "\r\n";
        fs.appendFile(babesfile, textToAppend);
        respondToMessage(message, 'Tilføjet!');

        return;
    }

    // wuhu
    if (messageContent === 'wuhu') {
        var babes = fs.readFileSync(babesfile).toString().split("\r\n");
        var babeRandom = Math.floor(Math.random() * (babes.length));
        var billede = babes[babeRandom];
        message.channel.sendFile(billede);

        return;
    }


    // weryimpressive
    if (messageContent === 'weryimpressive') {
        message.channel.sendMessage("Opdaterer botten!");
        cmd.run("powershell -file Deploy.ps1 ")

        return;
    }

     // wing
    if (messageContent === 'wing') {
        message.channel.sendMessage("wong");

        return;
    }

    // whaat?
    if (messageContent === 'whaat?') {
        var path = imagePath;

        fs.readdir(path, function(err, items) {
            var billedeRandom = Math.floor(Math.random() * (items.length - 0 + 1));
            var billedeToSend = items[billedeRandom];
            message.channel.sendFile(path + '/' + billedeToSend);
            fs.writeFile(lastshownfile, path + billedeToSend);
        });

        return;
    }

    // image upload
    var imageExtension = fileExtension(messageContent);

    if (imageExtension && botConfig.imageMimetypes.indexOf(imageExtension) > -1) {
        var billedenavn = uuid() + '.' + imageExtension;
        var localPath = imagePath + billedenavn;

        analimages.analyzeImage(messageContent)
            .then(function(description) {
                respondToMessage(message, description);
            })
            .catch(function(error) {});

        download(messageContent).then(data => {
            fs.writeFileSync(localPath, data);
        });

        respondToMessage(message, 'Billede uploadet');
    }
});

// Log our bot in
client.login(botConfig.token);

/**
 * Respond to a message with a file
 *
 * @param  Message  message
 * @param  string   response
 *
 * @return void
 */
function respondToMessageWithFile(message, response) {
    message.channel.sendFile(response);
}

/**
 * Respond to a message
 *
 * @param  Message  message
 * @param  string   response
 *
 * @return void
 */
function respondToMessage(message, response) {
    message.channel.sendMessage(response);
}

/**
 * Respond to a message with TTS
 *
 * @param  Message  message
 * @param  string   response
 *
 * @return void
 */
function respondToMessageTTS(message, response) {
    message.channel.sendMessage(response, { tts: true });
}

/**
 * Check if the message author has a specific role.
 *
 * @param  Message  message
 * @param  string   roleName
 *
 * @return boolean
 */
function authorHasRole(message, roleName = '') {
    let role = message.guild.roles.find('name', roleName);

    if (message.member.roles.has(role.id)) {
        return true;
    }

    return false;
}

/**
 * Check if value is numeric
 *
  * @return boolean
 */
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Log to console
 *
 * @param  data
 *
 * @return void
 */
function l(data) {
    console.log(data);
}
