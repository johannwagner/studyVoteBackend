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
        USER_ALREADY_REGISTERED: 6,
        INVALID_PARAMETERS: 7,
        DUPLICATE_ENTRY: 8,
        DATABASE_ERROR: 9,
        UNKNOWN_ERROR: 10,
        NO_ENTRY_FOR_ID: 11,
        SEMESTER_NOT_FOUND: 12
    },
    /**
     * Secret for JWT Tokens.
     */
    SIGNING_SECRET: 'secretcatpassword'
};