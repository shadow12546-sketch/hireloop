const { z } = require('zod');

const educationSchema = z.object({
  institution: z.string().trim().max(200).optional().default(''),
  degree: z.string().trim().max(150).optional().default(''),
  fieldOfStudy: z.string().trim().max(150).optional().default(''),
  startYear: z.number().int().optional().nullable(),
  endYear: z.number().int().optional().nullable(),
});

const experienceSchema = z.object({
  company: z.string().trim().max(200).optional().default(''),
  title: z.string().trim().max(150).optional().default(''),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  isCurrent: z.boolean().optional().default(false),
  description: z.string().trim().max(1000).optional().default(''),
});

const updateCandidateProfileSchema = z.object({
  phone: z.string().trim().max(20).optional(),
  location: z.string().trim().max(150).optional(),
  bio: z.string().trim().max(2000).optional(),
  skills: z.array(z.string().trim().min(1)).optional(),
  education: z.array(educationSchema).optional(),
  experience: z.array(experienceSchema).optional(),
  links: z
    .object({
      linkedin: z.string().trim().max(300).optional(),
      github: z.string().trim().max(300).optional(),
      portfolio: z.string().trim().max(300).optional(),
    })
    .optional(),
});

const upsertCompanySchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(3000).optional().default(''),
  industry: z.string().trim().max(100).optional().default(''),
  location: z.string().trim().max(150).optional().default(''),
  website: z.string().trim().max(300).optional().default(''),
  logoUrl: z.string().trim().max(500).optional().default(''),
});

module.exports = {
  updateCandidateProfileSchema,
  upsertCompanySchema,
};
