import { Prisma } from '@prisma/client';
import { prisma } from '../../config/db';
import { HttpError } from '../../utils/http';
import { CreateDoctorInput, UpdateDoctorInput } from './doctors.validation';

type DoctorFilters = {
  page: number;
  limit: number;
  search: string;
  specialization?: string;
  hospital?: string;
  sortBy: 'name' | 'specialization' | 'hospital' | 'createdAt';
  sortOrder: 'asc' | 'desc';
  startDate?: Date;
  endDate?: Date;
};

const textMatch = (value: string): Prisma.StringFilter => ({ contains: value, mode: 'insensitive' });

export async function listDoctors(filters: DoctorFilters) {
  const where: Prisma.DoctorWhereInput = {};
  if (filters.search) {
    where.OR = [
      { name: textMatch(filters.search) },
      { email: textMatch(filters.search) },
      { specialization: textMatch(filters.search) },
      { hospital: textMatch(filters.search) },
    ];
  }
  if (filters.specialization) where.specialization = textMatch(filters.specialization);
  if (filters.hospital) where.hospital = textMatch(filters.hospital);
  if (filters.startDate || filters.endDate) {
    where.createdAt = {
      ...(filters.startDate ? { gte: filters.startDate } : {}),
      ...(filters.endDate ? { lte: filters.endDate } : {}),
    };
  }

  const skip = (filters.page - 1) * filters.limit;
  const [data, total] = await Promise.all([
    prisma.doctor.findMany({
      where,
      skip,
      take: filters.limit,
      orderBy: { [filters.sortBy]: filters.sortOrder },
      include: { _count: { select: { patients: true } } },
    }),
    prisma.doctor.count({ where }),
  ]);
  return { data, meta: { page: filters.page, limit: filters.limit, total, totalPages: Math.ceil(total / filters.limit) } };
}

export async function createDoctor(input: CreateDoctorInput) {
  return prisma.doctor.create({ data: input });
}

export async function getDoctor(id: string) {
  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: { _count: { select: { patients: true } } },
  });
  if (!doctor) throw new HttpError(404, 'Doctor not found');
  return doctor;
}

export async function updateDoctor(id: string, input: UpdateDoctorInput) {
  return prisma.doctor.update({ where: { id }, data: input });
}

export async function deleteDoctor(id: string) {
  const assignedPatients = await prisma.patient.count({ where: { doctorId: id } });
  if (assignedPatients > 0) {
    throw new HttpError(409, `Cannot delete this doctor while ${assignedPatients} patient record(s) are assigned. Reassign or remove those records first.`);
  }
  await prisma.doctor.delete({ where: { id } });
}

export async function listDoctorPatients(id: string, page: number, limit: number) {
  const doctorExists = await prisma.doctor.findUnique({ where: { id }, select: { id: true } });
  if (!doctorExists) throw new HttpError(404, 'Doctor not found');

  const where = { doctorId: id };
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, age: true, gender: true, phone: true, medicalCondition: true, createdAt: true },
    }),
    prisma.patient.count({ where }),
  ]);
  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
