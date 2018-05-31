var     exports         = module.exports = {};
var     fs              = require('fs');
var     logJson         = './log/log.json';
var     _               = require('lodash');
var     moment          = require('moment');


exports.log = function(message) {
    var logJson     = getLogJson();
    var userId      = message.author.id;
    var guildId     = message.guild.id;
    var username    = message.author.username;
    var time        = new Date();
    var today       = time.getFullYear() + '-'
                      + ('0' + (time.getMonth()+1)).slice(-2) + '-'
                      + ('0' + time.getDate()).slice(-2);

    if (logJson[guildId] == undefined) {
        logJson[guildId] = {};
    }

    if (logJson[guildId][today] == undefined) {
        logJson[guildId][today] = {};
    }

    if (logJson[guildId][today][userId] == undefined) {
        logJson[guildId][today][userId] = {
            'username': username,
            'wordcount': 0,
            'secs_wasted': 0,
        };
    }

    // See http://smallbusiness.chron.com/good-typing-speed-per-minute-71789.html
    var averageWPM = 15;
    var averageSPW = 60/averageWPM;
    var wordCount = message.content.trim().toLowerCase().split(' ').length;
    var secs_wasted = wordCount * averageSPW;

    logJson[guildId][today][userId].wordcount += wordCount;
    logJson[guildId][today][userId].secs_wasted += secs_wasted;

    update(logJson);
}

exports.getWaste = function(message) {
    var logJson     = getLogJson();
    var guildId     = message.guild.id;
    var response    = 'Time wasted on Discord today:\n';
    var time        = new Date();
    var today       = time.getFullYear() + '-'
                      + ('0' + (time.getMonth()+1)).slice(-2) + '-'
                      + ('0' + time.getDate()).slice(-2);

    if (logJson && _.size(logJson[guildId][today]) > 0) {
        _.forEach(logJson[guildId][today], function(logData) {
            var wasted = '';

            d = Number(logData.secs_wasted);
            var h = Math.floor(d / 3600);
            var m = Math.floor(d % 3600 / 60);
            var s = Math.floor(d % 3600 % 60);

            var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
            var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
            var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";

            wasted = hDisplay + mDisplay + sDisplay;

            response = response + '```diff\n';
            response = response + logData.username + ': ' + wasted + ' wasted (' + logData.wordcount + ' words) \n\n';
            response = response + '```';
        });
    } else {
        response = 'No time wasted today.';
    }

    return response;
}

/**
 * Update the json file.
 *
 * @param  Object   matchJson
 */
function update(json) {
    if (!jsonIsValid(json)) {
        l('JSON not valid.');
    }
    else {
        try {
            fs.writeFile(logJson, JSON.stringify(json));
        } catch (e) {
            l('Failed writing log.');
        }
    }
    l('Log recorded.');
}

/**
 * Validate JSON.
 *
 * @param  object json
 *
 * @return hanne bool
 */
function jsonIsValid(json) {
    try {
        JSON.parse(JSON.stringify(json));
    } catch (e) {
        return false;
    }
    return true;
}

/**
 * get the fucking JSON
 */
function getLogJson() {
    return require('./log.json');
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
