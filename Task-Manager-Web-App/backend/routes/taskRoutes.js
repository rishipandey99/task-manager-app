const express = require('express');

const { protect } = require('../middleware/authMiddleware');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

const router = express.Router();

// Protect all task routes.
router.use(protect);

router.get('/', getTasks); // GET /api/tasks
router.post('/', createTask); // POST /api/tasks
router.put('/:id', updateTask); // PUT /api/tasks/:id
router.delete('/:id', deleteTask); // DELETE /api/tasks/:id

module.exports = router;

