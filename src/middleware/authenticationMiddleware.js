const jsonWebToken = require("jsonwebtoken");
const Constants = require("../Constants");

/**
 * authenticationMiddleware adds a protection layer to an endpoint.
 * Request must contain a "X-Token" header, which contains the requested token.
 * @param req Request
 * @param res Response
 * @param next Next Middleware
 */
exports.authenticationMiddleware = function(req, res, next) {
    let userToken;

    /**
     *
     * @param res Response
     * @param error Readable Error
     * @param errorCode ErrorCode, defined in Constants.js
     */
    const sendError = function (res, error, errorCode) {
        res.status(403).send({
            error,
            errorCode
        })
    };

    if (userToken = req.headers['x-token']) {
        try {
            // Unpacking Data from Token.
            // TODO: Add Private Key for Verification
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