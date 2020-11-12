import { classScheduleListingExtractor } from '../pages/courseListingEntries/index';
import { getSchedule, getScheduleBySubject, getScheduleByTerm } from '../utils/tests/getSchedule';
import express from 'express';

const Course = require('../models/Course');
const router = express.Router();

// Gets back every course
router.get('/', async (req: any, res) => {
    try{
        const posts = await Course.find();
        res.json(posts);
    }catch(err){
        res.json({message:err});
    }
});

// Submits courses for a given term
router.post('/:term', async (req: any, res) => {
    const paths = getScheduleByTerm(req.params.courseCRN);
    const post = new Course({
        subject: req.body.subject,
        code: req.body.code,
        crn: req.body.crn
    });

    try{
        const savedPost = await post.save()
        res.json(savedPost);
    }catch(err){
        res.json({message: err});
    }
});

// Gets specific course
router.get('/:courseCRN', async (req: any, res) => {
    try{
        const course = await Course.findById(req.params.courseCRN);
        res.json(course);
    }catch(err){
        res.json({message: err});
    }
});


module.exports = router;
