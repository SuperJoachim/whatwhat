var     exports         = module.exports = {};
var     fs              = require('fs');
var     matchJsonPath   = './match/match.json';
var     _               = require('lodash');
var     moment          = require('moment');

exports.getMatchHelp = function() {
    return '**Commands:**\n**!match** - get a match list\n**!match yes/no <match hash>** - say yes/no for a match\n**!match add <date> <opponent>** - add a new match\n**!match remove <match hash>** - remove a match\n**!match help** - get this help list\n';
}

exports.updateMatches = function(action, args) {
    var matchJson       = getMatchJson();
    var response        = '';

    if (action == 'add') {
        var matchDate       = args[1];
        var matchOpponent   = args[2];
        var matchHash       = createMatchHash();

        var matchMoment = moment(matchDate);

        if (!matchMoment.isValid()) {
            return 'Date format is not valid, use: YYYY-MM-DDTHH:MM eg 2018-05-20T20:00';
        }

        if (!matchOpponent) {
            return 'No opponent given. See !match help';
        }

        matchJson[matchHash] = {
            'opponent': '' + matchOpponent + '',
            'date': '' + matchMoment.format('YYYY-MM-DDTHH:mm') + '',
            'players': {
                'yes': [],
                'no': []
            }
        }

        updateMatchFile(matchJson);

        response = 'Match **' + matchHash + '** has been added!';
    }

    if (action == 'remove') {
        var matchHash       = args[1];

        if (matchJson[matchHash]) {
            matchJson = _.omit(matchJson, matchHash);
            updateMatchFile(matchJson);
            delete require.cache[require.resolve('./match.json')];
            response = 'Match **' + matchHash + '** has been removed!';
        }
        else {
            response = 'Match **' + matchHash + '** not found!';
        }
    }

    return response;
}


/**
 * get a prac summary.
 *
 * @return string
 */
exports.getMatchSummary = function() {
    var matchJson       = getMatchJson();
    var response        = 'Matches overview:\n';

    if (!_.isEmpty(matchJson)) {
        _.forEach(matchJson, function(matchData, matchHash) {
            var yes = [];
            var no = [];

            _.forEach(matchData['players']['yes'], function(player) {
                yes.push(_.values(player)[0]);
            });
            _.forEach(matchData['players']['no'], function(player) {
                no.push(_.values(player)[0]);
            });

            response = response + '```diff\n';
            response = response + matchData.date + ' vs ' + matchData.opponent.toUpperCase() + ' (hash: ' + matchHash + ')\n';
            response = response + '+ ' + yes.join(', ') + '\n';
            response = response + '- ' + no.join(', ') + '\n';
            response = response + '```';
        });
    }
    else {
        response = 'No matches found.'
    }

    response = response + '\n**Help:** !match help';

    return response;
}

/**
 * Update the prac.
 *
 * @param  author
 * @param  action
 *
 * @return void
 */
exports.updateMatch = function(author, action, matchHash) {
    var matchJson       = getMatchJson();
    var userId          = author.id;
    var username        = author.username;
    var player          = {[userId]: username};

    if (!matchJson[matchHash]) {
        return 'Match **' + matchHash + '** not found!';
    }

    // Check if exists.
    if (_.find(matchJson[matchHash].players[action], userId)) {
        return 'You f***! You already said ' + action;
    }

    matchJson[matchHash].players[action].push(player);

    var oppositeAction = action == 'yes' ? 'no' : 'yes';

    _.remove(matchJson[matchHash].players[oppositeAction], function(e) {
        return Object.keys(e)[0] == userId;
    });

    updateMatchFile(matchJson);

    return 'You said ' + action + '!';
};

/**
 * Update the json file.
 *
 * @param  Object   matchJson
 */
function updateMatchFile(matchJson) {
    if (!jsonIsValid(matchJson)) {
        l('JSON not valid.');
    }
    else {
        l('JSON is valid.');

        fs.writeFile(matchJsonPath, JSON.stringify(matchJson));
    }
}

/**
 * Validate JSON.
 *
 * @param  object matchJson
 *
 * @return hanne bool
 */
function jsonIsValid(matchJson) {
    try {
        JSON.parse(JSON.stringify(matchJson));
    } catch (e) {
        return false;
    }
    return true;
}

/**
 * get the fucking JSON
 */
function getMatchJson() {
    return require('./match.json');
}

function createMatchHash(){
    return Math.random().toString(36).substr(2, 7);
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
