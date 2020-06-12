var botConfig = require('../config/bot.json');

var exports = module.exports = {};
var fs = require('fs');
var _ = require('lodash');
var moment = require('moment');
var request = require('request');
var rp = require('request-promise');
const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");
const kvcredential = new DefaultAzureCredential();
const vaultName = "whatkeys";
const kvurl = `https://${vaultName}.vault.azure.net`;
const kvclient = new SecretClient(kvurl, kvcredential);
const secretName = "bettingkey";


exports.getBets = async function () {
    const imageApiKey = await kvclient.getSecret(secretName);
    console.log(imageApiKey);

    return new Promise(function (resolve, reject) {
        rp(options)
            .then(function (parsedBody) {
                var returnMsg = 'På billedet ses: ';
                if (parsedBody.description.captions.length > 0) {
                    returnMsg += parsedBody.description.captions.map(function (caption) {
                        return caption.text;
                    }).join(', ');
                }
                resolve(returnMsg);
                console.log("LOL2");
            })
            .catch(function (err) {
                console.log('FEJL', err);
                reject(err);
            });
    });
}
