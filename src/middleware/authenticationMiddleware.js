const jsonWebToken = require("jsonwebtoken");
const Constants = require("../Constants");
exports.authenticationMiddleware = function(req, res, next) {
    let userToken;

    const sendError = function (res, error, errorCode) {
        res.status(403).send({
            error,
            errorCode
        })
    };

    if (userToken = req.headers['x-token']) {
        try {
            const tokenData = jsonWebToken.verify(userToken, Constants.SIGNING_SECRET);
            req.tokenContext = tokenData;
            next();
        } catch (err) {
            sendError(res, 'Wrong Token.', Constants.ErrorConstants.WRONG_TOKEN);
        }
    } else {
        sendError(res, 'No Token.', Constants.ErrorConstants.NO_TOKEN);
    }


};