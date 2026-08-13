const { z } = require('zod');
const { objectIdSchema } = require('./common');

const resumeParseRequestSchema = z.object({
  resumeId: objectIdSchema,
});

const resumeParseResultSchema = z.object({
  resumeId: objectIdSchema,
  atsScore: z.number().min(0).max(100).optional().nullable(),
  extractedSkills: z.array(z.string()).optional().default([]),
  extractedEducation: z.array(z.any()).optional().default([]),
  extractedExperience: z.array(z.any()).optional().default([]),
  keywords: z.array(z.string()).optional().default([]),
  candidateInfo: z.record(z.any()).optional().default({}),
  rawResult: z.any().optional(),
});

const resumeMatchRequestSchema = z.object({
  resumeId: objectIdSchema,
  jobId: objectIdSchema,
  applicationId: objectIdSchema.optional(),
});

const resumeMatchResultSchema = z.object({
  resumeId: objectIdSchema,
  jobId: objectIdSchema,
  applicationId: objectIdSchema.optional(),
  matchScore: z.number().min(0).max(100).optional().nullable(),
  strengths: z.array(z.string()).optional().default([]),
  weaknesses: z.array(z.string()).optional().default([]),
  missingSkills: z.array(z.string()).optional().default([]),
  recommendation: z.string().optional().default(''),
  keywords: z.array(z.string()).optional().default([]),
  rawResult: z.any().optional(),
});

const interviewSessionResultSchema = z.object({
  applicationId: objectIdSchema,
  transcript: z
    .array(
      z.object({
        speaker: z.enum(['ai', 'candidate']),
        message: z.string(),
        timestamp: z.coerce.date().optional(),
      })
    )
    .optional()
    .default([]),
  summary: z.string().optional().default(''),
  score: z.number().min(0).max(100).optional().nullable(),
  strengths: z.array(z.string()).optional().default([]),
  weaknesses: z.array(z.string()).optional().default([]),
  recommendation: z.string().optional().default(''),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']).optional().default('IN_PROGRESS'),
});

module.exports = {
  resumeParseRequestSchema,
  resumeParseResultSchema,
  resumeMatchRequestSchema,
  resumeMatchResultSchema,
  interviewSessionResultSchema,
};
