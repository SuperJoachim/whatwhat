const Discord = require('discord.js');
const client = new Discord.Client();
var fs = require('fs');
var guid = require('guid');
var os = require("os");
var request = require('request');
const download = require('download');
var prac = require('./prac/prac.js');
var _ = require('lodash');

client.on('ready', () => {
  console.log('I am ready!');
  client.user.setGame("with little girls");
});
//What what
client.on('message', message => {
  if (message.content.toLowerCase() === 'what what?') {
    message.reply('in the butt!');
  }
});

//Will you sing?
client.on('message', message => {
  if(message.content.toLocaleLowerCase() === "will you sing?") {
  message.tts("What what in the butt");
}
});

//what?
client.on('message', message => {
  if (message.content.toLowerCase() === 'what?') {
    message.channel.send('https://www.youtube.com/watch?v=jC1s3c-sFF8');
  }
});

//Cawer
client.on('message', message => {
  if(message.content.toLowerCase().includes("cawer") && !message.author.bot) {
    message.channel.send("ALL HAIL THE KING CAWER");
  }
});

//Nuller
client.on('message', message => {
  if(message.content.toLowerCase().includes("nuller")) {
    message.channel.sendFile("bc4b8784-f172-44c3-9aef-edbb4b0b496e.jpg");
  }
});

//wow?
client.on('message', message => {
  if(message.content.toLowerCase() === "wow?") {

    var babe = fs.readFileSync("lastshown.txt");
    var textToAppend = babe + "\r\n";
    fs.appendFile("babes.txt", textToAppend);
    message.channel.send("Tilføjet!");
  }
});

//wuhu
client.on('message', message => {
  if(message.content.toLowerCase() === "wuhu") {
    var babes = fs.readFileSync('babes.txt').toString().split("\r\n");
    //console.log(array[1].toString());
    var babeRandom = Math.floor(Math.random() * (babes.length));
      var billede = babes[babeRandom];
      console.log(billede + ' sendt som wuhu');
      message.channel.sendFile(billede);
  }
});



//billede upload - ikke færdig
client.on('message', message => {
  if(message.content.toLowerCase().includes(".jpg") || message.content.toLowerCase().includes(".jpeg") || message.content.toLowerCase().includes(".gif") || message.content.toLowerCase().includes(".bmp") || message.content.toLowerCase().includes(".png")) {

    if(message.content.toLocaleLowerCase().includes(".jpg")) {
      console.log("JPG billede bliver tilføjet nu!")
      
      var billedenavn = guid.create().value + ".jpg";
      var localPath = 'C:\\BotBilleder\\' + billedenavn;
            var url = message.content;
            console.log(url);

              download(url).then(data => {
              fs.writeFileSync(localPath, data);
              });
    }

        if(message.content.toLocaleLowerCase().includes(".jpeg")) {
      console.log("JPEG billede bliver tilføjet nu!")
      
      var billedenavn = guid.create().value + ".jpeg";
      var localPath = 'C:\BotBilleder\\' + billedenavn;
            var url = message.content;
            console.log(url);

              download(url).then(data => {
              fs.writeFileSync(localPath, data);
              });
    }

        if(message.content.toLocaleLowerCase().includes(".gif")) {
      console.log("GIF billede bliver tilføjet nu!")
      
      var billedenavn = guid.create().value + ".gif";
      var localPath = 'C:\BotBilleder\\' + billedenavn;
            var url = message.content;
            console.log(url);

              download(url).then(data => {
              fs.writeFileSync(localPath, data);
              });
    }

        if(message.content.toLocaleLowerCase().includes(".bmp")) {
      console.log("BMP billede bliver tilføjet nu!")
      
      var billedenavn = guid.create().value + ".bmp";
      var localPath = 'C:\BotBilleder\\' + billedenavn;
            var url = message.content;
            console.log(url);

              download(url).then(data => {
              fs.writeFileSync(localPath, data);
              });
    }

        if(message.content.toLocaleLowerCase().includes(".png")) {
      console.log("PNG billede bliver tilføjet nu!")
      
      var billedenavn = guid.create().value + ".png";
      var localPath = 'C:\BotBilleder\\' + billedenavn;
            var url = message.content;
            console.log(url);

              download(url).then(data => {
              fs.writeFileSync(localPath, data);
              });
    }

    message.channel.send("Billede uploadet");
  }
    
});




//whaat?
client.on('message', message => {
  if(message.content.toLowerCase() === "whaat?") {
    var path ='c:\\BotBilleder';
 
  fs.readdir(path, function(err, items) {
        var billedeRandom = Math.floor(Math.random() * (items.length - 0 + 1));
        var billedeToSend = items[billedeRandom];
        console.log(billedeToSend + ' er sendt');
        message.channel.sendFile(path + '/' + billedeToSend);
        fs.writeFile("lastshown.txt", path + '/' + billedeToSend);
  });

  }

});


//New Prac
client.on('message', message => {
    // !prac
    if (message.content.trim().toLowerCase().indexOf('!prac') > -1) {
        // Return if self.
        
        if (message.author.bot) {
            return;
        }
        

        var action = message.content.replace('!prac', '').trim().toLowerCase();

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
});

function respondToMessage(message, response) {
    message.channel.sendMessage(response);
}

client.login('penisanal');

client.login('Kage er gud'); //Prod