var     exports         = module.exports = {};
var     fs              = require('fs');
var     pracJsonPath    = './prac/prac.json';
var     _               = require('lodash');

exports.getPracHelp = function() {
    return '**Commands:**\n**!prac** - get a prac summary\n**!prac yes** - sign up for prac today\n**!prac no** - let people know you can\'t prac today\n**!prac remove** - remove yourself from the prac entry\n**!prac help** - get this help list';
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

    var yesString       = '**Yes:** ';
    var noString        = '**No:** ';

    if (pracToday) {
        if (pracToday['yes']) {
            _.forEach(pracToday['yes'], function(player) {
                yesString = yesString + _.values(player)[0] + ', ';
            });
        }
        if (pracToday['no']) {
            _.forEach(pracToday['no'], function(player) {
                noString = noString + _.values(player)[0] + ', ';
            });
        }
    }

    return '**Todays prac:**' + '\n' + yesString + '\n' + noString + '\n' + 'Help: !prac help';
}

/**
 * Update the prac.
 *
 * @param  author
 * @param  action
 *
 * @return void
 */
exports.updatePrac = function(author, action) {
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
        pracJson[today] = {"yes":[], "no":[]};
    }

    // Check if exists.
    if (_.find(pracJson[today][action], userId)) {
        return 'You already said ' + action;
    }

    if (action == 'remove') {
        _.remove(pracJson[today]['yes'], function(e) {
            return Object.keys(e)[0] == userId;
        });
        _.remove(pracJson[today]['no'], function(e) {
            return Object.keys(e)[0] == userId;
        });

        updatePracFile(pracJson);

        return 'You have been removed.';
    }

    var oppositeAction = action == 'yes' ? 'no' : 'yes';

    _.remove(pracJson[today][oppositeAction], function(e) {
        return Object.keys(e)[0] == userId;
    });

    // Add to dataset.
    pracJson[today][action].push(player);

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
