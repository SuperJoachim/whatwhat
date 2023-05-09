/**
 * Configs
 */
var     botConfig       = require('./config/bot.json');

/**
 * Requires
 */
var     fs              = require('fs');
var     uuid            = require('uuid/v1');
var     rime            = require('./rime/rime.js');
var     _               = require('lodash');
var     fileExtension   = require('file-extension');
var     ytdl            = require('ytdl-core');
var     moment          = require('moment');

var     logJson         = './log/log.json';
var     log             = require('./log/log.js');
var     tacs            = require('./tacs/tacs.js');
var     call            = require('./call/call.js');
var     rp              = require('request-promise');


/**
 * Constants
 */
const   Discord         = require('discord.js');
const   client          = new Discord.Client();
const   download        = require('download');
const   imagePath       = botConfig.imageUploadPath;
const   babesfile       = botConfig.babePath;
const   lastshownfile   = botConfig.lastShownImage;
const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");
const { url } = require('inspector');
const ComputerVisionClient = require('@azure/cognitiveservices-computervision').ComputerVisionClient;
const ApiKeyCredentials = require('@azure/ms-rest-js').ApiKeyCredentials;
const kvcredential = new DefaultAzureCredential();
const vaultName = "whatkeys";
const kvurl = `https://${vaultName}.vault.azure.net`;
const kvclient = new SecretClient(kvurl, kvcredential);
const secretName = "bottoken";

//Login - brug secret fra KV
async function logindiscord() {
    const discordToken = await kvclient.getSecret(secretName);
    client.login(discordToken.value);
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

    
//Serverstats
async function datServerinfo() {
    const dathostpw = await kvclient.getSecret("dathostpw");
    const dathostemail = await kvclient.getSecret("dathostemail");
    const dathostserverid = await kvclient.getSecret("dathostserverid");
    var options = {
        method: 'GET',
        uri: 'https://dathost.net/api/0.1/game-servers/' + dathostserverid.value,
        headers: {
            'Content-Type': 'application/json'
        },
        auth: {
            username: dathostemail.value,
            password: dathostpw.value
        },
        body: {
            'server_id': dathostserverid.value
        },
        json: true
    };
    
    return new Promise(function(resolve, reject) {
        rp(options)
            .then(function (parsedBody) {
                var returnMsg = '**Server IP:** ';
                
                console.log(parsedBody);
                resolve(returnMsg);
                returnMsg += parsedBody.custom_domain + ":" + parsedBody.ports.game + "\n**Antal spillere:** " + parsedBody.players_online + "\n**Rcon:** " + parsedBody.csgo_settings.rcon + "\n**Serverpassword:** " + parsedBody.csgo_settings.password + "\n**Server tændt:** " + parsedBody.on.toString()
                message.channel.sendMessage(returnMsg)
            })
            .catch(function (err) {
                console.log('FEJL', err);
                reject(err);
                message.channel.sendMessage("Fejl ved serverinfo :(")
            });
    });
    
}


//Analyze face
if (messageContent.indexOf('!faceit') > -1) {
    var imageToProcess = messageContent.replace('!faceit ', '')
    guessAge(imageToProcess)
}


async function guessAge(urlToAnalyze) {
    
    const ApiKeyCredentialz = await kvclient.getSecret("facekey");
    const ApiKeyEndpoint = await kvclient.getSecret("faceendpoint");
    const computerVisionClient = new ComputerVisionClient(
        new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': ApiKeyCredentialz.value } }), ApiKeyEndpoint.value);
    const caption = (await computerVisionClient.describeImage(urlToAnalyze)).captions[0];
    const faces = (await computerVisionClient.analyzeImage(urlToAnalyze, { visualFeatures: ['Faces'] })).faces;
    //console.log(`This may be ${caption.text} (${caption.confidence.toFixed(2)} confidence)`);
    message.channel.sendMessage(caption.text);
    if (faces.length) {
        Kon = "udefinerbar størrelse";
        Kon1 = "hen";
        
        for (const face of faces) {
            console.log(face.gender.toString())
            const Gend = face.gender.toString();
            console.log(Gend);
            if(Gend === "Male")
            {
                console.log("DET VAR EN MAND");
                Kon = "mand";
                Kon1 = "han";
            } 
            else
            {
                console.log("DET VAR IKKE EN MAND");
                Kon = "kvinde";
                Kon1 = "hun";
            }
            message.channel.sendMessage(`Det ligner ${Kon1} er ${face.age} år gammel og er helt klart en ${Kon}!`)
        }
      } else { console.log('No faces found.'); }
}

    // !serverinfo
    if (messageContent === '!serverinfo') {

        datServerinfo();
}



//Serverstart
async function datStartserver() {
    const dathostpw = await kvclient.getSecret("dathostpw");
    const dathostemail = await kvclient.getSecret("dathostemail");
    const dathostserverid = await kvclient.getSecret("dathostserverid");
    var options = {
        method: 'POST',
        uri: 'https://dathost.net/api/0.1/game-servers/' + dathostserverid.value + '/start',
        headers: {
            'Content-Type': 'application/json'
        },
        auth: {
            username: dathostemail.value,
            password: dathostpw.value
        },
        body: {
            'server_id': dathostserverid.value
        },
        json: true
    };
    
    return new Promise(function(resolve, reject) {
        rp(options)
            .then(function (parsedBody) {
                  
                console.log(parsedBody);
                message.channel.sendMessage("Serveren booter - kan gå 3-4 min.")
            })
            .catch(function (err) {
                console.log('FEJL', err);
                reject(err);
                message.channel.sendMessage("Fejl ved start af serer :(")
            });
    });
    
}

    // !startserver
    if (messageContent === '!startserver') {

        datStartserver();
}



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

    // what what?
    if (messageContent === 'what what?') {
        respondToMessage(message, 'in the butt!');

        return;
    }

    // Kan martin drikke?
    if (messageContent.includes('10')) {
        respondToMessage(message, '10 - sjov historie! Det er mindre end Martin kan drikke!');

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
        respondToMessage(message, 'https://www.youtube.com/watch?v=isujdfWGqss');

        return;
    }

    // cawer
    if (messageContent.includes('cawer')) {
        respondToMessage(message, 'ALL HAIL THE KING CAWER');

        return;
    }


        // undying
        if (messageContent.includes('undying')) {
            respondToMessage(message, 'https://cdn.discordapp.com/attachments/215050766174388224/788391628401803314/7a9.jpg');
    
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

    // Pedesyge
    if (messageContent.includes('pede syge') || messageContent.includes('pedesyge')) {
        message.channel.sendFile("/aci/billeder/34594fc0-d38c-11e7-99f3-b3f9496a671a.jpg");

        return;
    }

    // Joachimsyge
    if (messageContent.includes('joachim syge') || messageContent.includes('joachimsyge') ) {

        respondToMessage(message, "Joachim syge? Mon ikke du mente Pede syge?");

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
        if(today.getDate() == 1003 || today.getDate() == 1994 || today.getDate() == 1995  ) { //Fjernes før næste lan
            message.channel.sendMessage("YEEES");
            message.channel.sendFile("lanbitch.jpg")
        } else {
            var now = moment();
            var b = moment([2020, 11, 13]);
            var toLan = now.diff(b, 'days');
            var toLanOut = toLan * -1;
            message.channel.sendMessage("Nej.. Hold kæft");
            //message.channel.sendMessage("Nej :( - der er " + toLanOut + " dage til! WOUUUU");
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

    if (imageExtension && botConfig.imageMimetypes.indexOf(imageExtension) > -1 && !messageContent.includes("faceit")) {
        var billedenavn = uuid() + '.' + imageExtension;
        var localPath = imagePath + "/" + billedenavn;

        download(messageContent).then(data => {
            fs.writeFileSync(localPath, data);
            console.log("Billede uploadet til " + localPath)
        }).catch(function (err) {
            console.log('FEJL', err);
            reject(err);
            message.channel.sendMessage("Fejl ved upload af billede :(")
        });

        respondToMessage(message, 'Billede uploadet');
    }});

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

logindiscord();
