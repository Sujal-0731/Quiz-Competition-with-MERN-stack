const express = require('express');
const router = express.Router();
const multer = require('multer');

const groupController = require('../controllers/groupController');
const quizController = require('../controllers/questionController');
const { isAdmin } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json') {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Add debug middleware for upload route
const debugUpload = (req, res, next) => {
  console.log('=== UPLOAD DEBUG ===');
  console.log('Headers received:', req.headers['content-type']);
  console.log('Has file field?', req.body?.quizFile ? 'Yes' : 'No');
  next();
};

router.use(isAdmin); 

router.get('/groups/available-teams', groupController.getAvailableTeams);
router.get('/groups/available-groups',groupController.getAvailableGroups);
router.post('/groups/create-group', groupController.createGroup);
router.post('/upload', debugUpload, upload.single('quizFile'), quizController.uploadQuestion);
router.get('/get-questions', quizController.getAllQuestions);


module.exports = router;

