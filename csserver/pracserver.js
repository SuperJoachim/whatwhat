
var     exports         = module.exports = {};
var     rp              = require('request-promise');


exports.serverStatus =  function() {
var options = {
    method: 'POST',
    uri: 'https://dathost.net/api/0.1/game-servers/5e6e4a382893cbf723df4786',
    headers: {
        'Content-Type': 'application/json'
    },
    auth: {
        username: 'joachim@stapelfeldt.com',
        password: 'll'
    },
    body: {
        'server_id': "5e6e4a382893cbf723df4786"
    },
    json: true
};

return new Promise(function(resolve, reject) {
    rp(options)
        .then(function (parsedBody) {
            var returnMsg = 'Server IP: ';
            console.log(parsedBody);
            resolve(returnMsg);
        })
        .catch(function (err) {
            // console.log('FEJL', err);
            reject(err);
        });
});
}



exports.serverStart =  function() {
    var options = {
        method: 'POST',
        uri: 'https://dathost.net/api/0.1/game-servers/5e6e4a382893cbf723df4786/start',
        headers: {
            'Content-Type': 'application/json'
        },
        auth: {
            username: 'joachim@stapelfeldt.com',
            password: 'll'
        },
        body: {
            'server_id': "5e6e4a382893cbf723df4786"
        },
        json: true
    };
    
    return new Promise(function(resolve, reject) {
        rp(options)
            .then(function (parsedBody) {
                var returnMsg = 'Server IP: ';
                if (parsedBody.description.captions.length > 0) {
                    returnMsg += parsedBody.description.captions.map(function (caption) {
                        return caption.text;
                    }).join(', ');
                }
                resolve(returnMsg);
            })
            .catch(function (err) {
                // console.log('FEJL', err);
                reject(err);
            });
    });
    }


            