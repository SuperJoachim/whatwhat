
var     exports         = module.exports = {};
var     rp              = require('request-promise');


exports.serverStatus =  function(accountpw) {
var options = {
    method: 'POST',
    uri: 'https://dathost.net/api/0.1/game-servers/5e6e4a382893cbf723df4786',
    headers: {
        'Content-Type': 'application/json'
    },
    auth: {
        username: 'joachim@stapelfeldt.com',
        password: accountpw
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
            console.log("LOL");
        })
        .catch(function (err) {
            console.log("PASSWORD ER: " + accountpw)
            console.log('FEJL', err);
            reject(err);
        });
});
}



            