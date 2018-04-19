var     exports         = module.exports = {};
var     fs              = require('fs');
var     _               = require('lodash');
var mapsPath            = './tacs/maps/';

exports.getTacs = function(message) {
    var mapPath     = false;
    var map         = message.content.trim().toLowerCase().replace('!tacs ', '');
    mapPath         = mapsPath + map + '.png';

    return mapPath;
}

exports.getTacList = function() {
    return 'Nahh bicth, try canals, cbble, dust2, inferno, mirage, nuke, office, overpass or train';
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
