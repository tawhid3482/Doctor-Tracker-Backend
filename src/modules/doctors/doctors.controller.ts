import { RequestHandler } from 'express';
import { asyncHandler } from '../../utils/http';
import { sendSuccess } from '../../utils/response';
import { createDoctor, deleteDoctor, getDoctor, listDoctorPatients, listDoctors, updateDoctor } from './doctors.service';
import { createDoctorSchema, doctorIdSchema, doctorListQuerySchema, doctorPatientsQuerySchema, updateDoctorSchema } from './doctors.validation';

export const getDoctors: RequestHandler = asyncHandler(async (req, res) => {
  const filters = doctorListQuerySchema.parse(req.query);
  const result = await listDoctors(filters);
  return sendSuccess(res, 'Doctors retrieved successfully', result.data, result.meta);
});

export const postDoctor: RequestHandler = asyncHandler(async (req, res) => {
  const input = createDoctorSchema.parse(req.body);
  const doctor = await createDoctor(input);
  return sendSuccess(res, 'Doctor created', doctor);
});

export const getDoctorById: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = doctorIdSchema.parse(req.params);
  return sendSuccess(res, 'Doctor retrieved', await getDoctor(id));
});

export const patchDoctor: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = doctorIdSchema.parse(req.params);
  const input = updateDoctorSchema.parse(req.body);
  return sendSuccess(res, 'Doctor updated', await updateDoctor(id, input));
});

export const removeDoctor: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = doctorIdSchema.parse(req.params);
  await deleteDoctor(id);
  return sendSuccess(res, 'Doctor deleted', null);
});

export const getPatientsForDoctor: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = doctorIdSchema.parse(req.params);
  const { page, limit } = doctorPatientsQuerySchema.parse(req.query);
  const result = await listDoctorPatients(id, page, limit);
  return sendSuccess(res, 'Doctor patients retrieved', result.data, result.meta);
});
