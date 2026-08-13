const { z } = require('zod');
const { objectIdSchema } = require('./common');
const { QUESTION_TYPE } = require('../constants/assessmentConstants');

const createAssessmentTemplateSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(2000).optional().default(''),
  tags: z.array(z.string().trim().min(1)).min(1, 'At least one tag is required for matching'),
  durationMinutes: z.number().int().min(1).max(600).optional().default(30),
  questions: z
    .array(
      z.object({
        questionText: z.string().trim().min(1),
        type: z.enum(Object.values(QUESTION_TYPE)).optional().default(QUESTION_TYPE.MCQ),
        options: z.array(z.string().trim()).optional().default([]),
        correctAnswer: z.string().trim().optional().default(''),
        points: z.number().min(0).optional().default(1),
      })
    )
    .min(1, 'At least one question is required'),
});

const attemptIdParamSchema = z.object({
  id: objectIdSchema,
});

const submitAssessmentSchema = z.object({
  responses: z
    .array(
      z.object({
        questionId: objectIdSchema,
        answer: z.string().trim().max(5000).default(''),
      })
    )
    .min(1, 'At least one response is required'),
});

module.exports = {
  createAssessmentTemplateSchema,
  attemptIdParamSchema,
  submitAssessmentSchema,
};
