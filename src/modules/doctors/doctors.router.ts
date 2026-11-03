import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { getDoctorById, getDoctors, getPatientsForDoctor, patchDoctor, postDoctor, removeDoctor } from './doctors.controller';

export const doctorsRouter = Router();
doctorsRouter.use(requireAuth);
doctorsRouter.get('/', getDoctors);
doctorsRouter.post('/', postDoctor);
doctorsRouter.get('/:id/patients', getPatientsForDoctor);
doctorsRouter.get('/:id', getDoctorById);
doctorsRouter.patch('/:id', patchDoctor);
doctorsRouter.delete('/:id', removeDoctor);
