const MySQL = require('promise-mysql');
const DatabaseSecrets = require('../../secrets/databaseSecrets');


class DatabaseAdapter {
    constructor(poolCount) {

        this.poolPromise = MySQL.createPool({
            ...DatabaseSecrets.DatabaseSecrets,
            connectionLimit: poolCount
        })

    }

    getUser(userParams) {

        let promiseQuery;

        if(userParams.userMail){
            promiseQuery = this.poolPromise.query('SELECT * FROM user WHERE email = ?', [userParams.userMail])
        } else {
            throw Error('Wrong Params.');
        }

        return promiseQuery.then((users) => {
            if(users.length <= 0) {
                return null;
            } else {
                return users[0];
            }
        })

    }
}

module.exports = DatabaseAdapter;