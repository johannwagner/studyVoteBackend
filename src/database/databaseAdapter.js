const MySQL = require('promise-mysql');
const DatabaseSecrets = require('../../secrets/databaseSecrets');


class DatabaseAdapter {
    constructor(poolCount) {

        this.poolPromise = MySQL.createPool({
            ...DatabaseSecrets.DatabaseSecrets,
            connectionLimit: poolCount
        })

    }

    /**
     * Gets the user from database matching the passed userEmail
     * @param userParams Must be filled with userEmail
     * @returns user Object
     */
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
        });

    }

    /**
     * Saves the user to the database and returns the user with filled id
     * @param user User Object
     */
    putUser(user)
    {
        let promiseQuery = this.poolPromise.query('INSERT INTO user (email, displayName, createDate, lastLoginDate, passwordHash) VALUES(?, ?, ?, ?, ?)',
            [user.email, user.displayName, user.createDate, user.lastLoginDate, user.passwordHash]);

        return promiseQuery.then((result) => {
            user.id = result.insertId;
            return user;
        });
    }
}

module.exports = DatabaseAdapter;