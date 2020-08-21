const mongoose = require('mongoose');

const jobschema = new mongoose.Schema({
    jobtitle:{
        type: String,
        required: true
    },
    company:{
        type: String,
        required: true
    },
    skills:[{
        type: String,
    }],
    aq:{
        type: String,
        required: true
    },
    exp:{
        type: String,
        required: true
    },
    sal:{
        type: String,
        required: true
    },
    contact:{
        type:String,
        required: true
    },
    PostedBy:{
        type:String,
        required: true
    }
});

module.exports = new mongoose.model('jobs', jobschema);