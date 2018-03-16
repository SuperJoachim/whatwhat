var     exports         = module.exports = {};
var     fs              = require('fs');
var     _               = require('lodash');
var     moment          = require('moment');
var     request         = require('request');

exports.analyzeImage = async function josTest() {
    var sd = await analyzeImage2(args);
    return lolifissen;
}

function analyzeImage2(args2) {
    var tilDiscord = '..';
    var options = {
        url: 'https://westeurope.api.cognitive.microsoft.com/vision/v1.0/describe',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': '56595276d84149a895eafa7b64ff729a'
          },
        json: {
          "url": args2
        }
    };
    request.post(options, function (error, response, body) {
        if(error)
        {
            console.log("Noget gik galt");
            tilDiscord = tilDiscord + "LOL I FISSEN!! FEJL FEJL !";
        }

        //var temp = body['description']['captions']
        console.log(body['description']['captions'][0]['text']);
        tilDiscord = tilDiscord + body['description']['captions'][0]['text'];
        return "ASDASF";

      });
}