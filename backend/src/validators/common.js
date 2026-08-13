const { z } = require('zod');
const mongoose = require('mongoose');

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid ID format',
});

const paginationQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = { objectIdSchema, paginationQuerySchema };
