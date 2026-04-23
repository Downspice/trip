'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ArrowRight, GraduationCap, MapPin, Bus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { bookingFormSchema, type BookingFormValues } from '@/lib/validations';
import { getHouses, getProgrammes, getRoutes, getSchools, previewBooking } from '@/lib/api';
import type { House, Programme, Route, School, TripType } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

const TRIP_TYPE_LABELS: Partial<Record<TripType, string>> = {
  ONE_WAY_TO_SCHOOL: 'One Way (To School)',
  ONE_WAY_FROM_SCHOOL: 'One Way (From School)',
};

function getRoutePrice(route: Route, type: string) {
  switch (type) {
    case 'ONE_WAY_TO_SCHOOL': return route.priceToSchool;
    case 'ONE_WAY_FROM_SCHOOL': return route.priceFromSchool;
    default: return 0;
  }
}

export default function BookingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [schools, setSchools] = useState<School[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [useCustomDropoff, setUseCustomDropoff] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
  });

  useEffect(() => {
  const saved = sessionStorage.getItem('bookingFormData');
  if (!saved) return;
  try {
    const values = JSON.parse(saved);
    // Only restore non-cascading fields to avoid conflicts with school/route/etc dropdowns
    setValue('studentName', values.studentName || '');
    setValue('class', values.class || '');
    setValue('email', values.email || '');
    setValue('parentName', values.parentName || '');
    setValue('parentContact', values.parentContact || '');
    setValue('tripType', values.tripType);
    setValue('stopName', values.stopName || '');
    setValue('customDropoff', values.customDropoff || '');
  } catch {
    // If parsing fails, just skip restoration — no harm done
  }
}, [setValue]);

  const selectedSchoolId = watch('schoolId');
  const selectedRouteId = watch('routeId');
  const selectedTripType = watch('tripType') as TripType | undefined;
  const selectedRoute = routes.find((r) => r.id === selectedRouteId);
  const calculatedPrice = selectedRoute && selectedTripType
    ? getRoutePrice(selectedRoute, selectedTripType)
    : null;

  useEffect(() => {
    getSchools()
      .then(setSchools)
      .catch(() => toast({ variant: 'destructive', title: 'Error', description: 'Failed to load schools.' }))
      .finally(() => setLoadingSchools(false));
  }, []);

  useEffect(() => {
    if (!selectedSchoolId) {
      setHouses([]); setRoutes([]); setProgrammes([]);
      return;
    }
    setLoadingOptions(true);
    Promise.all([
      getHouses(selectedSchoolId),
      getRoutes(selectedSchoolId),
      getProgrammes(selectedSchoolId),
    ])
      .then(([h, r, pr]) => {
        setHouses(h); setRoutes(r); setProgrammes(pr);
        setValue('houseId', '');
        setValue('programmeId', pr[0]?.id || '');
        setValue('routeId', '');
        // @ts-ignore
        setValue('tripType', undefined);
        setValue('stopName', '');
        setValue('customDropoff', '');
        setUseCustomDropoff(false);
      })
      .catch(() => toast({ variant: 'destructive', title: 'Error', description: 'Failed to load school options.' }))
      .finally(() => setLoadingOptions(false));
  }, [selectedSchoolId, setValue, toast]);

  const onSubmit = async (values: BookingFormValues) => {
    setSubmitting(true);
    try {
      const preview = await previewBooking(values);
      sessionStorage.setItem('bookingPreview', JSON.stringify(preview));
      sessionStorage.setItem('bookingFormData', JSON.stringify(values));
      router.push('/booking/confirm');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to preview booking.';
      toast({ variant: 'destructive', title: 'Error', description: message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingSchools) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">School Trip Registration</h1>
        <p className="text-gray-500">Fill in your details to register for the school trip</p>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl">Student Information</CardTitle>
          <CardDescription>All fields are required. Select your school first to unlock the rest.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* School Selection */}
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-secondary uppercase tracking-wider">Step 1: Choose Your School</Label>
              <Select onValueChange={(val) => setValue('schoolId', val)}>
                <SelectTrigger id="schoolId" className="h-12 border-2 focus:ring-primary">
                  <SelectValue placeholder="Select your school" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.schoolId && <p className="text-sm text-destructive">{errors.schoolId.message}</p>}
            </div>

            {!selectedSchoolId ? (
              <div className="bg-primary/5 border-2 border-dashed border-primary/20 rounded-2xl p-8 text-center">
                <GraduationCap className="w-12 h-12 text-primary/40 mx-auto mb-3" />
                <p className="text-primary font-bold text-lg">Please select your school first</p>
                <p className="text-primary/60 text-sm mt-1">Additional fields will be unlocked based on your school setup.</p>
              </div>
            ) : (
              <>
                {/* Grid: Student Details */}
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="studentName">Student Name</Label>
                    <Input id="studentName" placeholder="e.g. John Mensah" {...register('studentName')} />
                    {errors.studentName && <p className="text-sm text-destructive">{errors.studentName.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Class</Label>
                    <Select onValueChange={(val) => setValue('class', val)}>
                      <SelectTrigger id="class">
                        <SelectValue placeholder="Select your Form" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Form 1">Form 1</SelectItem>
                        <SelectItem value="Form 2">Form 2</SelectItem>
                        <SelectItem value="Form 3">Form 3</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.class && <p className="text-sm text-destructive">{errors.class.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label>House</Label>
                    <Select onValueChange={(val) => setValue('houseId', val)} disabled={loadingOptions}>
                      <SelectTrigger id="houseId">
                        <SelectValue placeholder={loadingOptions ? 'Loading...' : 'Select your house'} />
                      </SelectTrigger>
                      <SelectContent>
                        {houses.map((h) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {errors.houseId && <p className="text-sm text-destructive">{errors.houseId.message}</p>}
                  </div>

                  {false && (
                  <div className="space-y-1.5">
                    <Label>Programme of Study</Label>
                    <Select onValueChange={(val) => setValue('programmeId', val)} disabled={loadingOptions}>
                      <SelectTrigger id="programmeId">
                        <SelectValue placeholder={loadingOptions ? 'Loading...' : 'Select your programme'} />
                      </SelectTrigger>
                      <SelectContent>
                        {programmes.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {errors.programmeId && <p className="text-sm text-destructive">{errors.programmeId.message}</p>}
                  </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="student@example.com" {...register('email')} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="parentName">Parent / Guardian Name</Label>
                    <Input id="parentName" placeholder="e.g. Mrs. Ama Mensah" {...register('parentName')} />
                    {errors.parentName && <p className="text-sm text-destructive">{errors.parentName.message}</p>}
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="parentContact">Parent Contact</Label>
                    <Input id="parentContact" type="tel" placeholder="e.g. 0244000000" {...register('parentContact')} />
                    {errors.parentContact && <p className="text-sm text-destructive">{errors.parentContact.message}</p>}
                  </div>
                </div>

                {/* Route Selection */}
                <div className="border-t pt-6 space-y-5">
                  <Label className="text-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                    <Bus className="w-4 h-4" /> Step 2: Choose Your Route & Trip Type
                  </Label>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label>Route</Label>
                      <Select
                        onValueChange={(val) => {
                          setValue('routeId', val);
                          setValue('stopName', '');
                          setUseCustomDropoff(false);
                        }}
                        disabled={loadingOptions}
                      >
                        <SelectTrigger id="routeId">
                          <SelectValue placeholder={loadingOptions ? 'Loading...' : 'Select a route'} />
                        </SelectTrigger>
                        <SelectContent>
                          {routes.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {errors.routeId && <p className="text-sm text-destructive">{errors.routeId.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label>Trip Type</Label>
                      <Select onValueChange={(val) => {
                        setValue('tripType', val as TripType);
                        if (val !== 'ONE_WAY_FROM_SCHOOL' && useCustomDropoff) {
                          setUseCustomDropoff(false);
                          setValue('customDropoff', '');
                          setValue('stopName', '');
                        }
                      }} disabled={!selectedRouteId}>
                        <SelectTrigger id="tripType">
                          <SelectValue placeholder="Select trip type" />
                        </SelectTrigger>
                        <SelectContent>
                          {['ONE_WAY_TO_SCHOOL', 'ONE_WAY_FROM_SCHOOL'].map((t) => (
                            <SelectItem key={t} value={t}>{TRIP_TYPE_LABELS[t as TripType]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.tripType && <p className="text-sm text-destructive">{errors.tripType.message}</p>}
                    </div>
                  </div>

                  {/* Stop Selection */}
                  {selectedRoute && (
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Pickup / Drop-off Stop
                      </Label>
                      {!useCustomDropoff ? (
                        <div className="space-y-2">
                          <Select
                            onValueChange={(val) => {
                              if (val === '__custom__') {
                                setUseCustomDropoff(true);
                                setValue('stopName', '');
                              } else {
                                setValue('stopName', val);
                              }
                            }}
                          >
                            <SelectTrigger id="stopName">
                              <SelectValue placeholder="Select a stop, or choose custom" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedRoute.stops.map((s) => (
                                <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                              ))}
                              {selectedTripType === 'ONE_WAY_FROM_SCHOOL' && (
                                <SelectItem value="__custom__">📍 Enter a custom location…</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Input
                            placeholder="Enter your custom drop-off location"
                            {...register('customDropoff')}
                          />
                          <button
                            type="button"
                            className="text-xs text-primary underline"
                            onClick={() => { setUseCustomDropoff(false); setValue('customDropoff', ''); }}
                          >
                            ← Back to stop list
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Price Preview */}
                  {calculatedPrice !== null && (
                    <div className="bg-primary/10 border border-primary/20 p-6 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-primary/60 uppercase tracking-widest">Selected Route</p>
                        <p className="text-lg font-black text-secondary">{selectedRoute?.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{selectedTripType && TRIP_TYPE_LABELS[selectedTripType]}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary/60 uppercase tracking-widest">Total Price</p>
                        <p className="text-3xl font-black text-primary italic leading-none">
                          {formatCurrency(calculatedPrice)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                  ) : (
                    <>Preview Booking <ArrowRight className="ml-2 w-5 h-5" /></>
                  )}
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
