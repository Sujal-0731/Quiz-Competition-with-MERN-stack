const express = require('express');
const router = express.Router();
const School = require('../models/Team');       // School model
const Question = require('../models/Question');   // Question model
const RoundResult = require('../models/RoundResult'); // Round result model

// =======================
// ADMIN ROUTES
// =======================

// 1️⃣ Get all schools (view teams)
router.get('/schools', async (req, res) => {
    try {
        const schools = await School.find();
        res.json({ success: true, schools });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 2️⃣ Update team details
router.put('/schools/:id', async (req, res) => {
    try {
        const schoolId = req.params.id;
        const updateData = req.body; // { name, representative, members, logo }
        const updatedSchool = await School.findByIdAndUpdate(schoolId, updateData, { new: true });
        res.json({ success: true, school: updatedSchool });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 3️⃣ Group teams (you can assign group numbers to teams)
router.put('/schools/:id/group', async (req, res) => {
    try {
        const schoolId = req.params.id;
        const { groupNumber } = req.body; // e.g., 1, 2, 3
        const updatedSchool = await School.findByIdAndUpdate(schoolId, { group: groupNumber }, { new: true });
        res.json({ success: true, school: updatedSchool });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 4️⃣ Add questions (JSON format)
router.post('/questions', async (req, res) => {
    try {
        const questionsData = req.body; // { category: '', questions: [...] }
        const question = new Question(questionsData);
        await question.save();
        res.json({ success: true, message: 'Questions added successfully', question });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 5️⃣ View all questions
router.get('/questions', async (req, res) => {
    try {
        const questions = await Question.find();
        res.json({ success: true, questions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 6️⃣ Update scores manually
router.put('/roundResults/:round', async (req, res) => {
    try {
        const roundName = req.params.round;
        const { scores } = req.body; // [{ team: 'School 1', score: 50 }, ...]
        
        const updatedRound = await RoundResult.findOneAndUpdate(
            { round: roundName },
            { round: roundName, scores },
            { upsert: true, new: true }
        );
        
        res.json({ success: true, round: updatedRound });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
