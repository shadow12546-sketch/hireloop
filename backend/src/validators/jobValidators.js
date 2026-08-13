const { z } = require('zod');
const { ALL_WORK_MODES, ALL_EMPLOYMENT_TYPES, ALL_JOB_STATUS } = require('../constants/jobConstants');
const { objectIdSchema } = require('./common');

const createJobSchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10).max(8000),
  location: z.string().trim().max(150).optional().default(''),
  workMode: z.enum(ALL_WORK_MODES),
  employmentType: z.enum(ALL_EMPLOYMENT_TYPES),
  salaryMin: z.number().min(0).optional().nullable(),
  salaryMax: z.number().min(0).optional().nullable(),
  experience: z.string().trim().max(100).optional().default(''),
  skills: z.array(z.string().trim().min(1)).optional().default([]),
  deadline: z.coerce.date({ errorMap: () => ({ message: 'Deadline must be a valid date' }) }),
}).refine(
  (data) => data.deadline.getTime() > Date.now(),
  { message: 'Deadline must be in the future', path: ['deadline'] }
).refine(
  (data) => !data.salaryMin || !data.salaryMax || data.salaryMin <= data.salaryMax,
  { message: 'salaryMin cannot be greater than salaryMax', path: ['salaryMin'] }
);

const updateJobSchema = z.object({
  title: z.string().trim().min(3).max(150).optional(),
  description: z.string().trim().min(10).max(8000).optional(),
  location: z.string().trim().max(150).optional(),
  workMode: z.enum(ALL_WORK_MODES).optional(),
  employmentType: z.enum(ALL_EMPLOYMENT_TYPES).optional(),
  salaryMin: z.number().min(0).optional().nullable(),
  salaryMax: z.number().min(0).optional().nullable(),
  experience: z.string().trim().max(100).optional(),
  skills: z.array(z.string().trim().min(1)).optional(),
  deadline: z.coerce.date().optional(),
  status: z.enum(ALL_JOB_STATUS).optional(),
});

const jobIdParamSchema = z.object({
  id: objectIdSchema,
});

const jobQuerySchema = z.object({
  search: z.string().trim().optional(),
  location: z.string().trim().optional(),
  workMode: z.enum(ALL_WORK_MODES).optional(),
  employmentType: z.enum(ALL_EMPLOYMENT_TYPES).optional(),
  skills: z.string().trim().optional(), // comma-separated
  status: z.enum(ALL_JOB_STATUS).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = {
  createJobSchema,
  updateJobSchema,
  jobIdParamSchema,
  jobQuerySchema,
};
