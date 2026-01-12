const questionService = require('../services/questionServices');

class QuizController {
  // Upload quiz JSON file
  async uploadQuestion(req, res) {
    try {
      console.log('=== DEBUG: Upload Request ===');
      console.log('Headers:', req.headers);
      console.log('Files:', req.file);
      console.log('Body:', req.body);
      
      if (!req.file) {
        console.log('ERROR: No file found in req.file');
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      console.log('File received:', req.file.originalname);
      const result = await questionService.uploadQuizFile(req.file);
      
      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          groups: result.groups,
          totalQuestions: result.totalQuestions
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get all questions
  async getAllQuestions(req, res) {
    try {
      const result = await questionService.getAllQuestions();
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get question for judge
  async getQuestionForJudge(req, res) {
    try {
      const { judgeGroup, group, round, questionNumber } = req.query;
      
      // Validate required parameters
      if (!judgeGroup || !group || !round) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: judgeGroup, group, round'
        });
      }

      // Convert to numbers
      const judgeGroupNum = parseInt(judgeGroup);
      const groupNum = parseInt(group);
      const qn = questionNumber ? parseInt(questionNumber) : null;
      
      if (isNaN(judgeGroupNum) || isNaN(groupNum)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid group numbers'
        });
      }

      const result = await questionService.getQuestionForJudge(judgeGroupNum, groupNum, round, qn);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(error.message.includes('not assigned') ? 403 : 500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new QuizController();