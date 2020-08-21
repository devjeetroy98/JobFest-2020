const mongoose = require('mongoose');

const userdata = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    dob:{
        type: String,
        minlength: 6
    },
    yog:{
        type: String,
    },
    lastDegree:{
        type: String,
    },
    ylastDegree:{
        type: Number
    },
    jobrole:{
        type: String,
    },
    genre:[{
        type: String,
    }],
    yoe:{
        type:String,
    },
    textpro:{
        type:String
    },
    expectSal:{
        type: Number,
    },
    resume:{
        type: String
    }

});

module.exports = new mongoose.model('employees', userdata,'employees');