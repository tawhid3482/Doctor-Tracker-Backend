import { z } from 'zod';

const calendarDate = /^\d{4}-\d{2}-\d{2}$/;

export const startDateQuerySchema = z.union([
  z.string().regex(calendarDate).transform(value => new Date(`${value}T00:00:00.000Z`)),
  z.coerce.date(),
]);

export const endDateQuerySchema = z.union([
  z.string().regex(calendarDate).transform(value => new Date(`${value}T23:59:59.999Z`)),
  z.coerce.date(),
]);
