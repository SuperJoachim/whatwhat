var     exports         = module.exports = {};
var     fs              = require('fs');
var     _               = require('lodash');
var     moment          = require('moment');
var     request         = require('request');
var     rp              = require('request-promise');


//exports.analyzeImage =  function analyzeImage(args) {
exports.analyzeImage =  function(args) {
    var returnStuff = "Joachim tester";
    var options = {
        method: 'POST',
        uri: 'https://westeurope.api.cognitive.microsoft.com/vision/v1.0/describe',
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': '56595276d84149a895eafa7b64ff729a'
        },
        body: {
            'url': args
        },
        json: true // Automatically stringifies the body to JSON
    };
    
    rp(options)
        .then(function (parsedBody) {
            returnStuff = parsedBody['description']['captions'][0]['text'];
            console.log(returnStuff);
            //returnStuff = "Anal";
            return returnStuff;

        })
        .catch(function (err) {
            console.log(err);
            return "Noget gik galt, nigga";
        })
        .finally(function () {
            console.log("efter alt det lort");
            return "kage";
            
        });
}
