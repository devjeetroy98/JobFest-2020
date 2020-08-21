const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');

const userschema = new mongoose.Schema({
    email: {
        type: String,
    },
    username: {
        type: String,
    },
    password: {
        type: String,
    },
    verified : {
        type : Boolean
    },
    usertype:{
        type: String
    }
});
userschema.plugin(findOrCreate);
module.exports = new mongoose.model('user', userschema);