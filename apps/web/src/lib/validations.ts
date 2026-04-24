import { z } from 'zod';

export const bookingFormSchema = z.object({
  studentName: z
    .string()
    .min(2, 'Student name must be at least 2 characters')
    .max(100, 'Name is too long'),
  class: z
    .string()
    .min(1, 'Class is required')
    .max(20, 'Class name is too long'),
  schoolId: z.string().min(1, 'Please select a school'),
  houseId: z.string().min(1, 'Please select a house'),
  programmeId: z.string().min(1, 'Please select a programme'),
  email: z.string().email('Please enter a valid email address'),
  parentName: z
    .string()
    .min(2, 'Parent name must be at least 2 characters')
    .max(100, 'Name is too long'),
  parentContact: z
    .string()
    .transform((val) => val.replace(/[\s+]/g, ''))
    .refine(
      (val) => /^\d{10}$/.test(val) || /^233\d{9}$/.test(val),
      'Please enter a valid Ghana phone number (10 digits, or +233 followed by 9 digits)'
    ),
  routeId: z.string().min(1, 'Please select a route'),
  tripType: z.enum(['ONE_WAY_TO_SCHOOL', 'ONE_WAY_FROM_SCHOOL'], {
    errorMap: () => ({ message: 'Please select a trip type' }),
  }),
  stopName: z.string().optional(),
  customDropoff: z.string().optional(),
  whatsappContact: z.string()
    .optional()
    .refine(
      (val) => !val || /^\d{10}$/.test(val.replace(/\s+/g, '')) || /^233\d{9}$/.test(val.replace(/\s+/g, '')),
      'Please enter a valid Ghana phone number if provided'
    ),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
