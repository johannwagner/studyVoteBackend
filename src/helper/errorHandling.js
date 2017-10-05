const Constants = require('../Constants');

/**
 * Handles the given error and sends back the correct State
 * @param res
 * @param req
 * @param next
 * @param error Can be one of our errors or SQL Error
 */
function handleError(req, res, next, error)
{
    // Own defined error
    if(error.message && error.errorCode)
    {
        res.status(500).json({
            error: error.message,
            errorCode: error.errorCode
        });
    }

    // Database Error
    else if(error.code) {
        switch (error.code) {
            case 'ER_DUP_ENTRY':
                res.status(500).json({
                    error: 'Object already exists in the database',
                    errorCode: Constants.ErrorConstants.DUPLICATE_ENTRY
                });
                break;
            default:
                res.status(500).json({
                    error: error.sqlMessage,
                    errorCode: Constants.ErrorConstants.DATABASE_ERROR
                });
        }
    }
    // No idea what this is
    else
    {
        res.status(500).json({
            error: error.message,
            errorCode: Constants.ErrorConstants.UNKNOWN_ERROR
        });
    }
}

module.exports = handleError;