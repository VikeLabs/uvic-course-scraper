import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
    },
    code: {
        type: Number,
        required: true,
    },
    crn: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model('Courses', CourseSchema);