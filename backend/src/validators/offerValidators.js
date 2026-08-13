const { z } = require('zod');
const { objectIdSchema } = require('./common');

const createOfferSchema = z.object({
  applicationId: objectIdSchema,
  salary: z.number().min(0),
  joiningDate: z.coerce.date(),
  benefits: z.array(z.string().trim()).optional().default([]),
  notes: z.string().trim().max(1000).optional().default(''),
});

module.exports = { createOfferSchema };
