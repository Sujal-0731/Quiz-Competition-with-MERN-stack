const mongoose=require('mongoose');
const QuestionGroup = require('../models/Question');

  // Helper function to get DB state name
function  getDBStateName(state) {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return states[state] || 'unknown';
  }

class QuestionService{
      async uploadQuizFile(fileData) {
    try {
      console.log('=== SERVICE START ===');
      console.log('File:', fileData.originalname);
      
      // 1. Parse JSON
      console.log('1. Parsing JSON...');
      const quizData = JSON.parse(fileData.buffer.toString());
      console.log('   ✓ Parsed. Groups:', quizData.groups?.length);
      
      // 2. Validate
      console.log('2. Validating...');
      this.validateQuizStructure(quizData);
      console.log('   ✓ Validation passed');
      
      // DEBUG: Check database connection
      console.log('3. Database check:');
      console.log('   DB name:', mongoose.connection.db?.databaseName);
      console.log('   DB state:', mongoose.connection.readyState, getDBStateName(mongoose.connection.readyState));
      console.log('   Model collection:', QuestionGroup.collection?.collectionName);
      
      const results = {
        groups: [],
        totalQuestions: 0,
        message: ''
      };

      // 4. Process each group
      console.log('4. Processing groups...');
      for (const groupData of quizData.groups) {
        console.log(`   Processing group ${groupData.group}...`);
        
        // Extract data correctly
        const round1 = groupData.questions?.round1 || [];
        const round2 = groupData.questions?.round2 || [];
        
        console.log(`   Data: round1=${round1.length}, round2=${round2.length}`);
        
        // Check if group exists
        const existingGroup = await QuestionGroup.findOne({ group: groupData.group });
        console.log('   Existing group?', existingGroup ? 'Yes' : 'No');
        
        if (existingGroup) {
          console.log('   Updating existing group...');
          existingGroup.round1 = round1;
          existingGroup.round2 = round2;
          
          // Try to save
          console.log('   Saving to DB...');
          const saved = await existingGroup.save();
          console.log('   Saved?', saved ? 'Yes' : 'No');
          console.log('   Saved ID:', saved?._id);
          console.log('   Saved to collection:', saved.constructor.collection.collectionName);
          
          results.groups.push({
            group: groupData.group,
            action: 'updated',
            round1Count: round1.length,
            round2Count: round2.length
          });
        } else {
          console.log('   Creating new group...');
          
          // FIXED: Use correct variable name - NOT questionGroupSchema!
          const questionGroup = new QuestionGroup({
            group: groupData.group,
            round1: round1,
            round2: round2
          });

          console.log('   Document created. Saving to DB...');
          const saved = await questionGroup.save();
          console.log('   Saved?', saved ? 'Yes' : 'No');
          console.log('   Saved ID:', saved?._id);
          console.log('   Saved group:', saved?.group);
          console.log('   Collection name:', saved.constructor.collection.collectionName);
          
          results.groups.push({
            group: groupData.group,
            action: 'created',
            round1Count: round1.length,
            round2Count: round2.length
          });
        }

        results.totalQuestions += round1.length + round2.length;
        console.log(`   ✓ Group ${groupData.group} processed`);
      }

      results.message = `Uploaded ${results.groups.length} group(s) with ${results.totalQuestions} questions`;
      console.log('=== SERVICE COMPLETE ===');
      console.log('Result:', results.message);
      
      return results;
    } catch (error) {
      console.error('=== SERVICE ERROR ===');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      throw error;
    }
  }
  


  // Validate quiz structure
  validateQuizStructure(quizData) {
    const errors = [];
    
    if (!quizData.groups || !Array.isArray(quizData.groups)) {
      errors.push('"groups" must be an array');
    }

    if (quizData.groups.length === 0) {
      errors.push('No groups found');
    }

    quizData.groups.forEach(group => {
      if (!group.group || typeof group.group !== 'number') {
        errors.push(`Group ${group.group || 'unknown'}: Invalid group number`);
      }

      if (!group.questions || typeof group.questions !== 'object') {
        errors.push(`Group ${group.group}: Missing questions`);
        return;
      }

      // Validate round1
      if (!group.questions.round1 || !Array.isArray(group.questions.round1)) {
        errors.push(`Group ${group.group}: round1 must be an array`);
      } else {
        this.validateRoundQuestions(group.questions.round1, group.group, 'round1', errors);
      }

      // Validate round2
      if (!group.questions.round2 || !Array.isArray(group.questions.round2)) {
        errors.push(`Group ${group.group}: round2 must be an array`);
      } else {
        this.validateRoundQuestions(group.questions.round2, group.group, 'round2', errors);
      }
    });

    if (errors.length > 0) {
      throw new Error(`Validation failed:\n${errors.join('\n')}`);
    }
  }

  // Validate round questions
  validateRoundQuestions(questions, groupNum, round, errors) {
    questions.forEach((q, index) => {
      const qn = q.qn || index + 1;
      
      if (!q.question || q.question.trim() === '') {
        errors.push(`Group ${groupNum} ${round} Q${qn}: Missing question`);
      }
      
      if (!q.answer || q.answer.trim() === '') {
        errors.push(`Group ${groupNum} ${round} Q${qn}: Missing answer`);
      }
      
      if (!q.points || typeof q.points !== 'number') {
        errors.push(`Group ${groupNum} ${round} Q${qn}: Invalid points`);
      }
      
      if (!q.category || q.category.trim() === '') {
        errors.push(`Group ${groupNum} ${round} Q${qn}: Missing category`);
      }
    });
  }

  // Validate against Mongoose schema
  async validateAgainstSchema(quizData) {
    for (const groupData of quizData.groups) {
      const tempGroup = new QuestionGroup({
        group: groupData.group,
        round1: groupData.questions.round1 || [],
        round2: groupData.questions.round2 || []
      });

      try {
        await tempGroup.validate();
      } catch (validationError) {
        if (validationError.errors) {
          const errors = Object.values(validationError.errors).map(err => err.message);
          throw new Error(`Schema validation failed for group ${groupData.group}: ${errors.join(', ')}`);
        }
        throw validationError;
      }
    }
  }

  // Get all questions
  async getAllQuestions() {
    try {
      const groups = await QuestionGroup.find()
        .select('group round1 round2')
        .sort({ group: 1 })
        .lean();

      const allQuestions = [];
      
      groups.forEach(group => {
        // Add round1 questions
        if (group.round1) {
          group.round1.forEach(q => {
            allQuestions.push({
              ...q,
              group: group.group,
              round: 'round1'
            });
          });
        }

        // Add round2 questions
        if (group.round2) {
          group.round2.forEach(q => {
            allQuestions.push({
              ...q,
              group: group.group,
              round: 'round2'
            });
          });
        }
      });

      return {
        questions: allQuestions,
        total: allQuestions.length,
        groups: groups.length,
        rounds: {
          round1: groups.reduce((sum, g) => sum + (g.round1?.length || 0), 0),
          round2: groups.reduce((sum, g) => sum + (g.round2?.length || 0), 0)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get questions: ${error.message}`);
    }
  }

  // Get question for judge (group number must match)
  async getQuestionForJudge(judgeGroupNumber, requestedGroupNumber, round, questionNumber) {
    try {
      // Check if judge is assigned to this group
      if (judgeGroupNumber !== requestedGroupNumber) {
        throw new Error(`Judge is not assigned to group ${requestedGroupNumber}`);
      }

      const group = await QuestionGroup.findOne({ group: requestedGroupNumber });
      
      if (!group) {
        throw new Error(`Group ${requestedGroupNumber} not found`);
      }

      // Validate round
      if (!['round1', 'round2'].includes(round)) {
        throw new Error('Round must be "round1" or "round2"');
      }

      const questions = round === 'round1' ? group.round1 : group.round2;
      
      if (questionNumber) {
        // Get specific question
        const question = questions.find(q => q.qn === questionNumber);
        
        if (!question) {
          throw new Error(`Question ${questionNumber} not found in ${round}`);
        }

        return {
          question: question.question,
          category: question.category,
          points: question.points,
          qn: question.qn,
          round: round,
          group: group.group
          // Note: No answer included for judge
        };
      } else {
        // Get all questions in the round (without answers)
        return {
          round: round,
          group: group.group,
          totalQuestions: questions.length,
          questions: questions.map(q => ({
            qn: q.qn,
            question: q.question,
            category: q.category,
            points: q.points
          }))
        };
      }
    } catch (error) {
      throw new Error(`Failed to get question: ${error.message}`);
    }
  }
}

module.exports = new QuestionService();
