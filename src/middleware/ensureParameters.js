const _ = require('lodash');
const Constants = require("../Constants");

/**
 * Generates a middleware, which checks a request for parameters.
 * @param ensureParameters Array with Parameters
 * @returns {Function} Middleware
 */
exports.ensureParameters = function(ensureParameters) {
    return function(req, res, next) {
        for(let i = 0; i < ensureParameters.length; i++){
            let ensuredParameter = ensureParameters[i];

            if(_.isUndefined(req[ensuredParameter])){
                res.status(422).json({
                    ensuredParameter: ensuredParameter,
                    errorCode: Constants.ErrorConstants.ENSURED_PARAMETER_NOT_FULFILLED
                });
                return;
            }
        }

        next();
    }
};