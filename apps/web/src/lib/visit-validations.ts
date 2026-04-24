import * as z from 'zod';

export const visitBookingFormSchema = z.object({
  parentName: z.string().min(2, { message: 'Parent name must be at least 2 characters.' }),
  parentContact: z.string().regex(/^\+?[0-9\s-]{10,15}$/, { message: 'Enter a valid phone number.' }),
  email: z.string().email({ message: 'Enter a valid email address.' }),
  schoolId: z.string().min(1, { message: 'Please select a school.' }),
  routeId: z.string().min(1, { message: 'Please select a route.' }),
  tripType: z.enum(['ONE_WAY_TO_SCHOOL', 'ONE_WAY_FROM_SCHOOL'], {
    required_error: 'Please select a trip type.',
  }),
  stopName: z.string().optional(),
  customDropoff: z.string().optional(),
  whatsappContact: z.string().regex(/^\+?[0-9\s-]{10,15}$/, { message: 'Enter a valid phone number.' }),
});

export type VisitBookingFormValues = z.infer<typeof visitBookingFormSchema>;

