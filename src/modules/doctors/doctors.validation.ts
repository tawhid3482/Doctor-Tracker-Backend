import { z } from 'zod';
import { endDateQuerySchema, startDateQuerySchema } from '../../utils/date-query';

const doctorFieldsSchema = z.object({
  name: z.string().trim().min(2).max(120),
  specialization: z.string().trim().min(2).max(100),
  hospital: z.string().trim().min(2).max(150),
  phone: z.string().trim().min(6).max(30),
  email: z.string().email().transform(value => value.toLowerCase()),
});

export const createDoctorSchema = doctorFieldsSchema;
export const updateDoctorSchema = doctorFieldsSchema.partial().refine(value => Object.keys(value).length > 0, 'Provide at least one field to update');
export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;

export const doctorIdSchema = z.object({ id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid doctor ID') });

export const doctorListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().default(''),
  specialization: z.string().trim().optional(),
  hospital: z.string().trim().optional(),
  sortBy: z.enum(['name', 'specialization', 'hospital', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  startDate: startDateQuerySchema.optional(),
  endDate: endDateQuerySchema.optional(),
}).refine(value => !value.startDate || !value.endDate || value.startDate <= value.endDate, {
  message: 'startDate must be on or before endDate',
});

export const doctorPatientsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
