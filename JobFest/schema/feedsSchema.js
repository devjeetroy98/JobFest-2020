const mongoose = require('mongoose');

const feedsSchema = new mongoose.Schema({
    author:{
        type:String,
        required: true
    },
    time:{
        type: Date,
        default: new Date(),
        required: true
    },
    timesort2:{
        type: Number
    },
    content:{
        type: String,
        required: true
    },
    uppic:{
        type: String,
    }
});
module.exports = new mongoose.model('feeds', feedsSchema);