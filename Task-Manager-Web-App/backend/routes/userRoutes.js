const express = require('express');

const { protect } = require('../middleware/authMiddleware');
const { getUsers, createTeamMember, deleteTeamMember } = require('../controllers/userController');

const router = express.Router();

router.use(protect);

router.get('/', getUsers);
router.post('/create', createTeamMember);
router.post('/', createTeamMember);
router.delete('/:id', deleteTeamMember);

module.exports = router;
