const Joi = require('joi');

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            return res.status(400).json({ error: 'Validation failed', details: errors });
        }
        
        next();
    };
};

const schemas = {
    register: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        name: Joi.string().min(2).max(100).required()
    }),
    
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),
    
    createTask: Joi.object({
        title: Joi.string().min(3).max(255).required(),
        description: Joi.string().max(2000).allow(''),
        teamId: Joi.number().integer().allow(null),
        assignedTo: Joi.number().integer().allow(null)
    }),
    
    updateTask: Joi.object({
        title: Joi.string().min(3).max(255),
        description: Joi.string().max(2000).allow(''),
        status: Joi.string().valid('created', 'in_progress', 'completed', 'archived', 'blocked'),
        assignedTo: Joi.number().integer().allow(null),
        teamId: Joi.number().integer().allow(null),
        blockedReason: Joi.string().max(500).allow('')
    }),
    
    createTeam: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        description: Joi.string().max(500).allow('')
    }),
    
    updateTeam: Joi.object({
        name: Joi.string().min(2).max(100),
        description: Joi.string().max(500).allow('')
    }),
    
    addMember: Joi.object({
        userId: Joi.number().integer().required()
    }),
    
    verify2FA: Joi.object({
        tempToken: Joi.string().required(),
        code: Joi.string().length(6).pattern(/^\d+$/).required()
    })
};

module.exports = { validate, schemas };