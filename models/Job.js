const mongoose = require('mongoose');
// const { images } = require('../data/data');

const jobSchema = new mongoose.Schema({
    // title:{type: String, required : true},
    companyName: { type: String, required: true },
    // companyImg : {
    //     type: String,
    //     default : ()=>{
    //         return images[Math.floor(Math.random() * images.length)]
    //     }
    // },
    position: { type: String, required: true },
    contract: { type: String, required: true },
    location: { type: String, required: true },
    applicants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
