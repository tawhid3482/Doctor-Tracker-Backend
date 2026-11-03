import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { getPatientById, getPatients, patchPatient, postPatient, removePatient } from './patients.controller';

export const patientsRouter = Router();
patientsRouter.use(requireAuth);
patientsRouter.get('/', getPatients);
patientsRouter.post('/', postPatient);
patientsRouter.get('/:id', getPatientById);
patientsRouter.patch('/:id', patchPatient);
patientsRouter.delete('/:id', removePatient);
