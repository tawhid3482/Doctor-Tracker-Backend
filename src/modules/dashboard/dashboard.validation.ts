import { z } from 'zod';
import { endDateQuerySchema, startDateQuerySchema } from '../../utils/date-query';

export const dateRangeSchema = z.object({
  startDate: startDateQuerySchema.optional(),
  endDate: endDateQuerySchema.optional(),
}).refine(value => !value.startDate || !value.endDate || value.startDate <= value.endDate, {
  message: 'startDate must be on or before endDate',
});
