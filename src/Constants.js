module.exports = {
    /**
     * Error Codes for Responses, which are not successful.
     */
    ErrorConstants: {
        WRONG_PASSWORD: 1,
        UNKNOWN_USER: 2,
        NO_TOKEN: 3,
        WRONG_TOKEN: 4,
        ENSURED_PARAMETER_NOT_FULFILLED: 5,
    },
    /**
     * Secret for JWT Tokens.
     */
    SIGNING_SECRET: 'secretcatpassword'
};