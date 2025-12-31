const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },  
    phone: {
        type: String,
        required: true
    },
    enrolledDate : {
        type: Date,
        default: Date.now
    },

    courses :[{
        type: String
    }]
});



const student = mongoose.model('Student', studentSchema);

module.exports = student