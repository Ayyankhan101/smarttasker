const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

router.post('/', authMiddleware, adminOnly, validate(schemas.createTeam), teamController.createTeam);
router.get('/', authMiddleware, teamController.getTeams);
router.get('/my-teams', authMiddleware, teamController.getUserTeams);
router.get('/:id', authMiddleware, teamController.getTeam);
router.put('/:id', authMiddleware, adminOnly, validate(schemas.updateTeam), teamController.updateTeam);
router.delete('/:id', authMiddleware, adminOnly, teamController.deleteTeam);
router.post('/:id/members', authMiddleware, adminOnly, validate(schemas.addMember), teamController.addMember);
router.delete('/:id/members', authMiddleware, adminOnly, validate(schemas.addMember), teamController.removeMember);
router.get('/:id/members', authMiddleware, teamController.getMembers);

module.exports = router;