import { Prisma } from '@prisma/client';
import { prisma } from '../../config/db';
import { HttpError } from '../../utils/http';
import { CreatePatientInput, UpdatePatientInput } from './patients.validation';

type PatientFilters = {
  page: number;
  limit: number;
  search: string;
  doctor?: string;
  condition?: string;
  gender?: 'FEMALE' | 'MALE' | 'OTHER';
  sortBy: 'name' | 'age' | 'createdAt' | 'medicalCondition';
  sortOrder: 'asc' | 'desc';
  startDate?: Date;
  endDate?: Date;
};

const textMatch = (value: string): Prisma.StringFilter => ({ contains: value, mode: 'insensitive' });

async function requireDoctor(doctorId: string) {
  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId }, select: { id: true } });
  if (!doctor) throw new HttpError(400, 'Assigned doctor does not exist');
}

export async function listPatients(filters: PatientFilters) {
  const where: Prisma.PatientWhereInput = {};
  if (filters.search) {
    where.OR = [
      { name: textMatch(filters.search) },
      { email: textMatch(filters.search) },
      { phone: textMatch(filters.search) },
      { medicalCondition: textMatch(filters.search) },
    ];
  }
  if (filters.doctor) where.doctorId = filters.doctor;
  if (filters.condition) where.medicalCondition = textMatch(filters.condition);
  if (filters.gender) where.gender = filters.gender;
  if (filters.startDate || filters.endDate) {
    where.createdAt = {
      ...(filters.startDate ? { gte: filters.startDate } : {}),
      ...(filters.endDate ? { lte: filters.endDate } : {}),
    };
  }

  const skip = (filters.page - 1) * filters.limit;
  const [data, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      skip,
      take: filters.limit,
      orderBy: { [filters.sortBy]: filters.sortOrder },
      select: {
        id: true, name: true, age: true, dateOfBirth: true, gender: true,
        phone: true, email: true, medicalCondition: true, doctorId: true,
        doctor: { select: { id: true, name: true, specialization: true } }, createdAt: true,
      },
    }),
    prisma.patient.count({ where }),
  ]);
  return { data, meta: { page: filters.page, limit: filters.limit, total, totalPages: Math.ceil(total / filters.limit) } };
}

export async function createPatient(input: CreatePatientInput) {
  await requireDoctor(input.doctorId);
  return prisma.patient.create({ data: input });
}

export async function getPatient(id: string) {
  const patient = await prisma.patient.findUnique({
    where: { id },
    select: {
      id: true, name: true, age: true, dateOfBirth: true, gender: true,
      phone: true, email: true, address: true, medicalCondition: true,
      doctor: { select: { id: true, name: true, specialization: true } },
      createdAt: true, updatedAt: true,
    },
  });
  if (!patient) throw new HttpError(404, 'Patient not found');
  return patient;
}

export async function updatePatient(id: string, input: UpdatePatientInput) {
  if (input.doctorId) await requireDoctor(input.doctorId);
  return prisma.patient.update({ where: { id }, data: input });
}

export async function deletePatient(id: string) {
  await prisma.patient.delete({ where: { id } });
}
