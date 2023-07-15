const mongoose = require('mongoose');
const User = require('./Schemas/User');

async function getUserByUsername(username) {
    return User.findOne({"username": `${username}`});
} 

async function validateUser(userData){
    const { username, password } = userData;
    const user = await dbh.getUserByUsername(username);
    if (!user) throw new Error("User could not be found");
    if (user.password === password) return user._id;
}

module.exports = {
    validateUser,
    getUserByUsername
};
