import Joi from 'joi';
import { logger } from './loggerMiddleware.js';


export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.warn('Validation error', {
        method: req.method,
        url: req.url,
        errors: errorDetails,
        ip: req.ip
      });

      return res.status(400).json({
        error: 'Validation failed',
        details: errorDetails
      });
    }

    
    req[property] = value;
    next();
  };
};


export const userValidationSchemas = {
  login: Joi.object({
    email: Joi.alternatives().try(
      Joi.string().email().required(),
      Joi.number().integer().positive().required()
    ).required(),
    password: Joi.string().min(6).required()
  }),

  register: Joi.object({
    matricule: Joi.number().integer().positive().required()
  }),

  createUser: Joi.object({
    nom: Joi.string().min(2).max(50).required(),
    prenom: Joi.string().min(2).max(50).required(),
    fonction: Joi.string().max(100).optional(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    matricule: Joi.number().integer().positive().required(),
    gsm: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional(),
    roles: Joi.array().items(Joi.string()).min(1).required(),
    service: Joi.string().hex().length(24).optional(),
    direction: Joi.string().hex().length(24).required(),
    departement: Joi.string().hex().length(24).optional(),
    interim: Joi.string().hex().length(24).optional(),
    isChefDeService: Joi.boolean().default(false),
    isDirecteur: Joi.boolean().default(false)
  }),

  updateUser: Joi.object({
    nom: Joi.string().min(2).max(50).optional(),
    prenom: Joi.string().min(2).max(50).optional(),
    fonction: Joi.string().max(100).optional(),
    email: Joi.string().email().optional(),
    matricule: Joi.number().integer().positive().optional(),
    gsm: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional(),
    roles: Joi.array().items(Joi.string()).min(1).optional(),
    service: Joi.string().hex().length(24).optional(),
    direction: Joi.string().hex().length(24).optional(),
    departement: Joi.string().hex().length(24).optional(),
    interim: Joi.string().hex().length(24).optional(),
    isChefDeService: Joi.boolean().optional(),
    isDirecteur: Joi.boolean().optional()
  }),

  changePassword: Joi.object({
    password: Joi.string().min(6).required(),
    token: Joi.string().required()
  }),

  forgotPassword: Joi.object({
    matricule: Joi.number().integer().positive().required()
  })
};


export const demandeValidationSchemas = {
  createDemande: Joi.object({
    option: Joi.string().hex().length(24).required(),
    contenu: Joi.string().min(10).max(1000).required()
  }),

  updateDemande: Joi.object({
    contenu: Joi.string().min(10).max(1000).optional(),
    status: Joi.string().valid('en cours', 'validé', 'refusé', 'annulé').optional()
  }),

  processDemande: Joi.object({
    status: Joi.string().valid('validé', 'refusé').required(),
    motifRefus: Joi.string().max(500).when('status', {
      is: 'refusé',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    motifValidation: Joi.string().max(500).when('status', {
      is: 'validé',
      then: Joi.optional(),
      otherwise: Joi.forbidden()
    })
  })
};


export const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
    logger.warn('Invalid ObjectId', {
      id,
      method: req.method,
      url: req.url,
      ip: req.ip
    });

    return res.status(400).json({
      error: 'Invalid ID format'
    });
  }

  next();
};


export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};
