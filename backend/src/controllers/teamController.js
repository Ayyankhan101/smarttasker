const Team = require('../models/Team');
const User = require('../models/User');

const createTeam = (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Team name required' });
        }

        const teamId = Team.create(name, description);
        res.status(201).json({ message: 'Team created', teamId });
    } catch (error) {
        console.error('Create team error:', error);
        res.status(500).json({ error: 'Failed to create team' });
    }
};

const getTeams = (req, res) => {
    try {
        const teams = Team.getAll();
        res.json(teams);
    } catch (error) {
        console.error('Get teams error:', error);
        res.status(500).json({ error: 'Failed to get teams' });
    }
};

const getTeam = (req, res) => {
    try {
        const team = Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }
        res.json(team);
    } catch (error) {
        console.error('Get team error:', error);
        res.status(500).json({ error: 'Failed to get team' });
    }
};

const updateTeam = (req, res) => {
    try {
        const { name, description } = req.body;
        const team = Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        Team.update(req.params.id, name, description);
        res.json({ message: 'Team updated' });
    } catch (error) {
        console.error('Update team error:', error);
        res.status(500).json({ error: 'Failed to update team' });
    }
};

const deleteTeam = (req, res) => {
    try {
        const team = Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        Team.delete(req.params.id);
        res.json({ message: 'Team deleted' });
    } catch (error) {
        console.error('Delete team error:', error);
        res.status(500).json({ error: 'Failed to delete team' });
    }
};

const addMember = (req, res) => {
    try {
        const { userId } = req.body;
        const teamId = req.params.id;

        const team = Team.findById(teamId);
        const user = User.findById(userId);

        if (!team || !user) {
            return res.status(404).json({ error: 'Team or user not found' });
        }

        Team.addMember(userId, teamId);
        res.json({ message: 'Member added to team' });
    } catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({ error: 'Failed to add member' });
    }
};

const removeMember = (req, res) => {
    try {
        const { userId } = req.body;
        Team.removeMember(userId, req.params.id);
        res.json({ message: 'Member removed from team' });
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({ error: 'Failed to remove member' });
    }
};

const getMembers = (req, res) => {
    try {
        const members = Team.getMembers(req.params.id);
        res.json(members);
    } catch (error) {
        console.error('Get members error:', error);
        res.status(500).json({ error: 'Failed to get members' });
    }
};

const getUserTeams = (req, res) => {
    try {
        const teams = Team.getUserTeams(req.user.id);
        res.json(teams);
    } catch (error) {
        console.error('Get user teams error:', error);
        res.status(500).json({ error: 'Failed to get teams' });
    }
};

module.exports = { createTeam, getTeams, getTeam, updateTeam, deleteTeam, addMember, removeMember, getMembers, getUserTeams };