const jsonWebToken = require('jsonwebtoken');
const Constants = require('../Constants');

exports.createSignedToken = function(data) {
    const jwtOptions = {
        expiresIn: '7d'
    };

    return jsonWebToken.sign(data, Constants.SIGNING_SECRET, jwtOptions);

}

