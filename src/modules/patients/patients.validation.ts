import { z } from 'zod';
import { endDateQuerySchema, startDateQuerySchema } from '../../utils/date-query';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB ID');

const patientFieldsSchema = z.object({
  name: z.string().trim().min(2).max(120),
  age: z.coerce.number().int().min(0).max(125).optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.enum(['FEMALE', 'MALE', 'OTHER']),
  phone: z.string().trim().min(6).max(30),
  email: z.union([z.string().email(), z.literal('')]).optional().transform(value => value || null),
  address: z.string().trim().min(3).max(300),
  medicalCondition: z.string().trim().min(2).max(160),
  doctorId: objectId,
});

export const createPatientSchema = patientFieldsSchema.refine(value => value.age !== undefined || value.dateOfBirth !== undefined, {
  message: 'Provide an age or date of birth',
  path: ['age'],
});
export const updatePatientSchema = patientFieldsSchema.partial().refine(value => Object.keys(value).length > 0, 'Provide at least one field to update');
export const patientIdSchema = z.object({ id: objectId });
export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;

export const patientListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().default(''),
  doctor: objectId.optional(),
  condition: z.string().trim().optional(),
  gender: z.enum(['FEMALE', 'MALE', 'OTHER']).optional(),
  sortBy: z.enum(['name', 'age', 'createdAt', 'medicalCondition']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  startDate: startDateQuerySchema.optional(),
  endDate: endDateQuerySchema.optional(),
}).refine(value => !value.startDate || !value.endDate || value.startDate <= value.endDate, {
  message: 'startDate must be on or before endDate',
});
