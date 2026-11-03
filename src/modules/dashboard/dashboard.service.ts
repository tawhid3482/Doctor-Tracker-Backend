import { prisma } from '../../config/db';

export async function getDashboardOverview() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [totalDoctors, totalPatients, newDoctors, newPatients, recentDoctors, recentPatients, patientGroups, conditionGroups] = await Promise.all([
    prisma.doctor.count(),
    prisma.patient.count(),
    prisma.doctor.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.patient.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.doctor.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, specialization: true, hospital: true, createdAt: true } }),
    prisma.patient.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, medicalCondition: true, createdAt: true, doctor: { select: { name: true } } } }),
    prisma.patient.groupBy({ by: ['doctorId'], _count: { _all: true }, orderBy: { _count: { doctorId: 'desc' } }, take: 8 }),
    prisma.patient.groupBy({ by: ['medicalCondition'], _count: { _all: true }, orderBy: { _count: { medicalCondition: 'desc' } }, take: 6 }),
  ]);

  const doctors = await prisma.doctor.findMany({
    where: { id: { in: patientGroups.map(group => group.doctorId) } },
    select: { id: true, name: true },
  });
  const doctorNames = new Map(doctors.map(doctor => [doctor.id, doctor.name]));

  return {
    totalDoctors,
    totalPatients,
    newDoctors,
    newPatients,
    recentDoctors,
    recentPatients,
    patientsPerDoctor: patientGroups.map(group => ({
      name: doctorNames.get(group.doctorId) ?? 'Unknown doctor',
      patients: group._count._all,
    })),
    conditions: conditionGroups.map(group => ({ name: group.medicalCondition, value: group._count._all })),
  };
}

export async function getPatientRegistrationTrends(startDate?: Date, endDate?: Date) {
  const start = startDate ?? new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1);
  const end = endDate ?? new Date();
  const rows = await prisma.patient.aggregateRaw({
    pipeline: [
      { $match: { createdAt: { $gte: { $date: start.toISOString() }, $lte: { $date: end.toISOString() } } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, patients: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ],
  });
  return (rows as unknown as Array<{ _id: string; patients: number }>).map(row => ({ month: row._id, patients: row.patients }));
}

export async function getDoctorStatistics() {
  const groups = await prisma.patient.groupBy({
    by: ['doctorId'], _count: { _all: true }, orderBy: { _count: { doctorId: 'desc' } }, take: 12,
  });
  const doctors = await prisma.doctor.findMany({ where: { id: { in: groups.map(group => group.doctorId) } }, select: { id: true, name: true } });
  const names = new Map(doctors.map(doctor => [doctor.id, doctor.name]));
  return groups.map(group => ({ name: names.get(group.doctorId) ?? 'Unknown', patients: group._count._all }));
}

export async function getConditionStatistics() {
  const groups = await prisma.patient.groupBy({
    by: ['medicalCondition'], _count: { _all: true }, orderBy: { _count: { medicalCondition: 'desc' } }, take: 10,
  });
  return groups.map(group => ({ name: group.medicalCondition, value: group._count._all }));
}
