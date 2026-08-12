const { z } = require('zod');
const { objectIdSchema } = require('./common');
const { APPLICATION_STATUS } = require('../constants/applicationConstants');

const createApplicationSchema = z.object({
  jobId: objectIdSchema,
  resumeId: objectIdSchema.optional(), // optional: falls back to candidate's activeResume
});

const applicationIdParamSchema = z.object({
  id: objectIdSchema,
});

const applicationQuerySchema = z.object({
  status: z.enum(Object.values(APPLICATION_STATUS)).optional(),
  jobId: objectIdSchema.optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

const advanceStatusSchema = z.object({
  toStatus: z.enum(Object.values(APPLICATION_STATUS)),
  note: z.string().trim().max(500).optional().default(''),
});

const finalDecisionSchema = z.object({
  decision: z.enum([APPLICATION_STATUS.OFFER, APPLICATION_STATUS.REJECTED]),
  note: z.string().trim().max(500).optional().default(''),
});

module.exports = {
  createApplicationSchema,
  applicationIdParamSchema,
  applicationQuerySchema,
  advanceStatusSchema,
  finalDecisionSchema,
};
