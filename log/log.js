var     exports         = module.exports = {};
var     fs              = require('fs');
var     logJson         = './log/log.json';
var     _               = require('lodash');
var     moment          = require('moment');


exports.log = function(message) {
    var logJson     = getLogJson();
    var userId      = message.author.id;
    var username    = message.author.username;
    var time        = new Date();
    var today       = time.getFullYear() + '-'
                      + ('0' + (time.getMonth()+1)).slice(-2) + '-'
                      + ('0' + time.getDate()).slice(-2);

    if (logJson[today] == undefined) {
        logJson[today] = {};
    }

    if (logJson[today][userId] == undefined) {
        logJson[today][userId] = {
            'username': username,
            'wordcount': 0,
            'secs_wasted': 0,
        };
    }

    // See http://smallbusiness.chron.com/good-typing-speed-per-minute-71789.html
    var averageWPM = 40;
    var averageSPW = 60/40;
    var wordCount = message.content.trim().toLowerCase().split(' ').length;
    var secs_wasted = wordCount * averageSPW;

    logJson[today][userId].wordcount += wordCount;
    logJson[today][userId].secs_wasted += secs_wasted;

    update(logJson);
}

exports.getWaste = function() {
    var logJson     = getLogJson();
    var response    = 'Time wasted on Discord today:\n';
    var time        = new Date();
    var today       = time.getFullYear() + '-'
                      + ('0' + (time.getMonth()+1)).slice(-2) + '-'
                      + ('0' + time.getDate()).slice(-2);

    if (logJson && _.size(logJson[today]) > 0) {
        _.forEach(logJson[today], function(logData) {
            var label = 'seconds';
            var wasted = logData.secs_wasted;

            if (logData.secs_wasted > 60) {
                label = 'minutes';
                wasted = wasted/60;
                wasted = wasted.toFixed(1);
            }
            if (logData.secs_wasted > 3600) {
                label = 'hours';
                wasted = (wasted/60)/60;
                wasted = wasted.toFixed(2);
            }

            response = response + '```diff\n';
            response = response + logData.username + ': ' + wasted + ' ' + label + ' wasted (' + logData.wordcount + ' words) \n\n';
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
        fs.writeFile(logJson, JSON.stringify(json));
    }
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
