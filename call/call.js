var     exports         = module.exports = {};
var     _               = require('lodash');
var     maxPlayers      = 5;
var     maxDiversions   = 5;
var     actions         = ['rush', 'push', 'go slow to', 'go fast to', 'peak', 'hold', 'protect', 'smoke', 'flash', 'nade', 'fake', 'fake rush', 'fake plant', 'plant', 'make noise'];
var     areas           = ['A site', 'B site', 'middle', 'connector'];

exports.getCall = function(customDiversions) {
    var diversions              = _.random(1, maxDiversions);
    var iterations              = 0;
    var iterationPlayers        = 0;
    var callPlayers             = _.clone(maxPlayers);
    var calls                   = [];

    if (customDiversions) {
        diversions = customDiversions;
    }

    var maxPlayersPrDiversion  = _.floor(maxPlayers / diversions);

    while (iterations < diversions) {
        var lastIteration = _.clone(iterations);
        lastIteration++;

        if (lastIteration == diversions || diversions == 1 || callPlayers == 1) {
            iterationPlayers = callPlayers;
        }
        else {
            iterationPlayers = _.random(1, maxPlayersPrDiversion);
        }

        callPlayers = callPlayers - iterationPlayers;
        calls.push(getDiversion(iterationPlayers));
        iterations++;
    }

    return calls.join(', ');
}

function getDiversion(iterationPlayers) {
    var action  = _.sample(actions);
    var area    = _.sample(areas);

    return iterationPlayers + ' ' + action + ' ' + area;
}
