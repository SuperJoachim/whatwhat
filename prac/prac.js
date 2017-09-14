var     exports         = module.exports = {};
var     fs              = require('fs');
var     pracJsonPath    = './prac/prac.json';
var     _               = require('lodash');

exports.getPracHelp = function() {
    return '**Commands:**\n**!prac** - get a prac summary\n**!prac yes <game>** - sign up for prac today (game is optional)\n**!prac no <game>** - let people know you can\'t prac today (game is optional)\n**!prac remove <game>** - remove yourself from the prac entry (game is optional)\n**!prac help** - get this help list';
}

/**
 * get a prac summary.
 *
 * @return string
 */
exports.getPracSummary = function() {
    var pracJson        = require('./prac.json');
    var time            = new Date();
    var today           = time.getFullYear() + '-'
                          + ('0' + (time.getMonth()+1)).slice(-2) + '-'
                          + ('0' + time.getDate()).slice(-2);
    var pracToday       = pracJson[today];

    var response       = 'Prac overview:\n';

    if (pracToday) {
        _.forEach(pracToday, function(gamePrac, gameKey) {
            var yes = [];
            var no = [];

            _.forEach(gamePrac['yes'], function(player) {
                yes.push(_.values(player)[0]);
            });
            _.forEach(gamePrac['no'], function(player) {
                no.push(_.values(player)[0]);
            });

            response = response + '```diff\n';
            response = response + gameKey.toUpperCase() + '\n';
            response = response + '+ ' + yes.join(', ') + '\n';
            response = response + '- ' + no.join(', ') + '\n';
            response = response + '```';
        });
    }
    else {
        response = 'No prac entries today :('
    }

    response = response + '\nHelp: !prac help';

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
exports.updatePrac = function(author, action, game) {
    var pracJson        = require('./prac.json');
    var userId          = author.id;
    var username        = author.username;
    var time            = new Date();
    var player          = {[userId]: username};
    var today           = time.getFullYear() + '-'
                          + ('0' + (time.getMonth()+1)).slice(-2) + '-'
                          + ('0' + time.getDate()).slice(-2);

    // Create today index if not set.
    if (pracJson[today] == undefined) {
        pracJson[today] = {};
    }

    if (pracJson[today][game] == undefined) {
        pracJson[today][game] = {"yes":[], "no":[]};
    }

    // Check if exists.
    if (_.find(pracJson[today][game][action], userId)) {
        return 'You already said ' + action;
    }

    if (action == 'remove') {
        _.remove(pracJson[today][game]['yes'], function(e) {
            return Object.keys(e)[0] == userId;
        });
        _.remove(pracJson[today][game]['no'], function(e) {
            return Object.keys(e)[0] == userId;
        });

        updatePracFile(pracJson);

        return 'You have been removed.';
    }

    var oppositeAction = action == 'yes' ? 'no' : 'yes';

    _.remove(pracJson[today][game][oppositeAction], function(e) {
        return Object.keys(e)[0] == userId;
    });

    // Add to dataset.
    pracJson[today][game][action].push(player);

    updatePracFile(pracJson);

    return 'You said ' + action + '!';
};

/**
 * Update the json file.
 *
 * @param  Object   pracJson
 */
function updatePracFile(pracJson) {
    fs.writeFile(pracJsonPath, JSON.stringify(pracJson));
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
