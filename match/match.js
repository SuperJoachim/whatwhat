var     exports         = module.exports = {};
var     fs              = require('fs');
var     matchJsonPath   = './match/match.json';
var     _               = require('lodash');
var     moment          = require('moment');

exports.getMatchHelp = function() {
    var commands = [
        { name: 'match', desc: 'get a match list' },
        { name: 'match yes/no <match hash>', desc: 'say yes/no for a match' },
        { name: 'match add <date> <opponent>', desc: 'add a new match' },
        { name: 'match remove <match hash', desc: 'remove a match' },
        { name: 'match move <match hash> <date>', desc: 'move a match to a new time' },
        { name: 'match played <match hash> yes/no', desc: 'mark match as played' },
        { name: 'match result <match hash> <result>', desc: 'save result for the match' },
        { name: 'match help', desc: 'get this help list' },
    ];

    return '**Commands:**\n' + commands.map(cmd => '**!' + cmd.name + '** - ' + cmd.desc).join('\n') + '\n';
}

exports.updateMatches = function(action, args) {
    var matchJson       = getMatchJson();
    var response        = '';

    if (action == 'add') {
        var matchDate       = args[1];
        var matchOpponent   = args.slice(2).join(' ');
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
            'played': false,
            'result': '',
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

    if (action == 'move') {
        var matchHash = args[1];
        var matchDate = args[2];
        var matchMoment = moment(matchDate);

        if (!matchMoment.isValid()) {
            return 'Date format is not valid, use: YYYY-MM-DDTHH:MM eg 2018-05-20T20:00';
        }

        if (matchJson[matchHash]) {
            matchJson[matchHash].date = matchMoment.format('YYYY-MM-DDTHH:mm');
            updateMatchFile(matchJson);
            response = 'Match **' + matchHash + '** has been moved!';
        }
        else {
            response = 'Match **' + matchHash + '** not found!';
        }
    }

    if (action == 'played') {
        var matchHash = args[1];
        var played = args[2];

        if (played) {
            played.trim();
        }

        if (!played || !(['yes', 'no'].indexOf(played) >= 0)) {
            return 'Played can be true or false';
        }

        if (matchJson[matchHash]) {
            matchJson[matchHash].played = played;
            updateMatchFile(matchJson);
            response = 'Match **' + matchHash + '** has been updated!';
        }
        else {
            response = 'Match **' + matchHash + '** not found!';
        }
    }

    if (action == 'result') {
        var matchHash = args[1];
        var matchResult = args[2];

        if (matchResult) {
            matchResult.trim();
        }

        if (!matchResult) {
            return 'No result given.';
        }

        if (matchJson[matchHash]) {
            matchJson[matchHash].result = matchResult;
            updateMatchFile(matchJson);
            response = 'Match **' + matchHash + '** has been updated!';
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
    var matches         = sortMatchesByDate(getMatchJson());
    var response        = 'Matches overview:\n';

    if (matches && _.size(matches) > 0) {
        _.forEach(matches, function(matchData) {
            var yes = [];
            var no = [];

            _.forEach(matchData['players']['yes'], function(player) {
                yes.push(_.values(player)[0]);
            });
            _.forEach(matchData['players']['no'], function(player) {
                no.push(_.values(player)[0]);
            });

            response = response + '```diff\n';
            response = response + matchData.date + ' vs ' + matchData.opponent.toUpperCase() + ' (hash: ' + matchData.hash + ') \n\n';

            if (matchData.played && matchData.played == 'yes') {
                response = response + 'Result: ' + matchData.result + '\n\n';
            }

            response = response + '+ ' + yes.join(', ') + '\n';
            response = response + '- ' + no.join(', ') + '\n';
            response = response + '```';
        });
    } else {
        response = 'No matches found.';
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
 * Transform matchJson object to collection/array, sorted by date
 * @param  object matchJson
 * @return array
 */
function sortMatchesByDate(matchJson)
{
    return _.orderBy(_.mapValues(matchJson, function(match, hash) {
        match.hash = hash;
        return match;
    }), ['date'], ['asc']);
}

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
