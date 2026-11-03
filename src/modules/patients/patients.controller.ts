import { RequestHandler } from 'express';
import { asyncHandler } from '../../utils/http';
import { sendSuccess } from '../../utils/response';
import { createPatient, deletePatient, getPatient, listPatients, updatePatient } from './patients.service';
import { createPatientSchema, patientIdSchema, patientListQuerySchema, updatePatientSchema } from './patients.validation';

export const getPatients: RequestHandler = asyncHandler(async (req, res) => {
  const filters = patientListQuerySchema.parse(req.query);
  const result = await listPatients(filters);
  return sendSuccess(res, 'Patients retrieved successfully', result.data, result.meta);
});

export const postPatient: RequestHandler = asyncHandler(async (req, res) => {
  const input = createPatientSchema.parse(req.body);
  return sendSuccess(res, 'Patient created', await createPatient(input));
});

export const getPatientById: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = patientIdSchema.parse(req.params);
  return sendSuccess(res, 'Patient retrieved', await getPatient(id));
});

export const patchPatient: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = patientIdSchema.parse(req.params);
  const input = updatePatientSchema.parse(req.body);
  return sendSuccess(res, 'Patient updated', await updatePatient(id, input));
});

export const removePatient: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = patientIdSchema.parse(req.params);
  await deletePatient(id);
  return sendSuccess(res, 'Patient deleted', null);
});
