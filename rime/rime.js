var     exports         = module.exports = {};
var     fs              = require('fs');
var     rimesJsonPath   = './rime/rimes.json';
var     _               = require('lodash');

/**
 * Get a random rime.
 *
 * @return string
 */
exports.getRandomRime = function() {
    var rimes = require('./rimes.json');
    return _.sample(rimes);
}

/**
 * Add rime
 *
 * @param  author
 * @param  action
 *
 * @return void
 */
exports.addRime = function(author, message) {
    var rimes = require('./rimes.json');

    var newRime = {
        'author': author.username,
        'rime': message
    };

    rimes.push(newRime);

    updateRimesFile(rimes);

    return 'Thank you good sir!';
};

/**
 * Update the json file.
 *
 * @param  Object   json
 */
function updateRimesFile(json) {
    fs.writeFile(rimesJsonPath, JSON.stringify(json));
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
