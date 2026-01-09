const express = require('express');
const router = express.Router();

const groupController = require('../controllers/groupController');
const uploadQuestionsController = require('../controllers/questionController');
const { isAdmin } = require('../middleware/auth');
router.use(isAdmin); 

router.get('/groups/available-teams', groupController.getAvailableTeams);
router.get('/groups/available-groups',groupController.getAvailableGroups);
router.post('/groups/create-group', groupController.createGroup);
module.exports = router;

