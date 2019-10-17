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
var     rime            = require('./rime/rime.js');
var     _               = require('lodash');
var     fileExtension   = require('file-extension');
var     cmd             = require('node-cmd');
var     ytdl            = require('ytdl-core');

var     logJson         = './log/log.json';
var     log             = require('./log/log.js');
var     tacs            = require('./tacs/tacs.js');
var     call            = require('./call/call.js');
var     analimages      = require('./analytics/images.js');
var     rp              = require('request-promise');
var     KeyVault        = require('azure-keyvault');


/**
 * Constants
 */
const   Discord         = require('discord.js');
const   client          = new Discord.Client();
const   download        = require('download');
const   imagePath       = botConfig.imageUploadPath;
const   babesfile       = botConfig.babePath;
const   lastshownfile   = botConfig.lastShownImage;

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
        message.channel.sendFile("/aci/billeder/bc4b8784-f172-44c3-9aef-edbb4b0b496e.jpg");

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

    if(messageContent == 'er det fredag?'){
        var today = new Date();
        if(today.getDay() == 5) {
            message.channel.sendMessage("YAS!! https://www.youtube.com/watch?v=6UzP4QPA5Kg");
        } else {
            message.channel.sendMessage("Nej :(");
        }
        
    }

    if(messageContent == 'er det lan?'){
        var today = new Date();
        if(today.getDay() === 17 || today.getDay() === 19 ) {
            message.channel.sendMessage("YEEES");
            message.channel.sendFile("lanbitch.jpg")
        } else {
            message.channel.sendMessage("Nej :( - snart bitches");
        }
        
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
var options = {
    uri: 'http://169.254.169.254/metadata/identity/oauth2/token',
    qs: {
        'api-version': '2018-02-01',
        'resource': 'https://vault.azure.net',
    },
    headers: {
        'Metadata': 'true'
    },
    json: true // Automatically parses the JSON string in the response
};

rp(options).then(function (tokenResponse) {
    var authenticator = function (challenge, callback) {
        var authorizationValue = tokenResponse.token_type + ' ' + tokenResponse.access_token;
        return callback(null, authorizationValue);
    };

    var credentials = new KeyVault.KeyVaultCredentials(authenticator);
    var kvclient = new KeyVault.KeyVaultClient(credentials);

    kvclient.getSecret(`https://whatkeys.vault.azure.net`, 'bottoken', '').then((secretBundle) => {
        client.login(secretBundle.value);
    }).catch((err) => {
        console.log(err)
    });
}).catch(function (err) {
    console.log(err)
});
//client.login(botConfig.token);

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
