import { RequestHandler } from 'express';
import { asyncHandler } from '../../utils/http';
import { sendSuccess } from '../../utils/response';
import { getConditionStatistics, getDashboardOverview, getDoctorStatistics, getPatientRegistrationTrends } from './dashboard.service';
import { dateRangeSchema } from './dashboard.validation';

export const overview: RequestHandler = asyncHandler(async (_req, res) =>
  sendSuccess(res, 'Dashboard overview retrieved', await getDashboardOverview()));

export const patientTrends: RequestHandler = asyncHandler(async (req, res) => {
  const { startDate, endDate } = dateRangeSchema.parse(req.query);
  return sendSuccess(res, 'Patient trends retrieved', await getPatientRegistrationTrends(startDate, endDate));
});

export const doctorStatistics: RequestHandler = asyncHandler(async (_req, res) =>
  sendSuccess(res, 'Doctor statistics retrieved', await getDoctorStatistics()));

export const conditionStatistics: RequestHandler = asyncHandler(async (_req, res) =>
  sendSuccess(res, 'Condition statistics retrieved', await getConditionStatistics()));
