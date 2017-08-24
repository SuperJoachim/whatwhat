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
var     _               = require('lodash');
var     fileExtension   = require('file-extension');

/**
 * Constants
 */
const   Discord         = require('discord.js');
const   client          = new Discord.Client();
const   download        = require('download');
const   imagePath       = path.join(__dirname, botConfig.imageUploadPath + '/');
const   babesfile       = path.join(__dirname, 'babes.txt');
const   lastshownfile   = path.join(__dirname, 'lastshown.txt');

if (!fs.existsSync(imagePath)){
    fs.mkdirSync(imagePath)
}

/**
 * Bot connect
 */
client.on('ready', () => {
    console.log('I am ready!');
    client.user.setStatus('with little girls');
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

    // !prac
    if (messageContent.indexOf('!prac') > -1) {
        var action = messageContent.replace('!prac', '').trim().toLowerCase();

        if (!action) {
            respondToMessage(message, prac.getPracSummary());
            return;
        }

        if (action == 'help') {
            respondToMessage(message, prac.getPracHelp());
            return;
        }

        if (action == 'yes' || action == 'no' || action == 'remove') {
            respondToMessage(message, prac.updatePrac(message.author, action));
        }
        else {
            respondToMessage(message, action + ' is not a valid command.');
        }

        return;
    }

    // what what?
    if (messageContent === 'what what?') {
        respondToMessage(message, 'in the butt!');

        return;
    }

    // will you sing?
    if (messageContent === 'will you sing?') {
        respondToMessageTTS(message, 'What what in the butt');

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

    // whaat?
    if (messageContent === 'whaat?') {
        var path = imagePath;

        fs.readdir(path, function(err, items) {
            var billedeRandom = Math.floor(Math.random() * (items.length - 0 + 1));
            var billedeToSend = items[billedeRandom];
            message.channel.sendFile(path + '/' + billedeToSend);
            fs.writeFile(lastshownfile, path + '/' + billedeToSend);
        });

        return;
    }

    // image upload
    var imageExtension = fileExtension(messageContent);

    if (imageExtension && botConfig.imageMimetypes.indexOf(imageExtension) > -1) {
        var billedenavn = uuid() + '.' + imageExtension;
        var localPath = imagePath + billedenavn;

        download(messageContent).then(data => {
            fs.writeFileSync(localPath, data);
        });

        respondToMessage(message, 'Billede uploadet');
    }
});

// Log our bot in
client.login(botConfig.token);

/**
 * Respond to a message
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
 * @param  Message  message
 * @param  string   response
 *
 * @return void
 */
function respondToMessageTTS(message, response) {
    message.channel.sendMessage(response, { tts: true });
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
