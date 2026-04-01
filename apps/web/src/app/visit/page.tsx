'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Loader2, GraduationCap, Bus, MapPin } from 'lucide-react';

import {
  visitBookingFormSchema,
  type VisitBookingFormValues,
} from '@/lib/visit-validations';
import { getSchools, getRoutes, previewVisitBooking, type School, type Route, type TripType } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
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
import { Separator } from '@/components/ui/separator';

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

export default function VisitBookingPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [schools, setSchools] = useState<School[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [useCustomDropoff, setUseCustomDropoff] = useState(false);

  const form = useForm<VisitBookingFormValues>({
    resolver: zodResolver(visitBookingFormSchema),
    defaultValues: {
      parentName: '',
      parentContact: '',
      email: '',
      schoolId: '',
      routeId: '',
      stopName: '',
      customDropoff: '',
    },
  });

  const selectedSchoolId = form.watch('schoolId');
  const selectedRouteId = form.watch('routeId');
  const selectedTripType = form.watch('tripType') as TripType | undefined;
  const selectedRoute = routes.find((r) => r.id === selectedRouteId);
  const calculatedPrice =
    selectedRoute && selectedTripType ? getRoutePrice(selectedRoute, selectedTripType) : null;

  useEffect(() => {
    getSchools()
      .then(setSchools)
      .catch(() => toast({ title: 'Error loading schools', variant: 'destructive' }))
      .finally(() => setLoadingInitial(false));
  }, [toast]);

  useEffect(() => {
    if (!selectedSchoolId) {
      setRoutes([]);
      return;
    }
    setLoadingRoutes(true);
    getRoutes(selectedSchoolId)
      .then(setRoutes)
      .catch(() => toast({ title: 'Error loading routes', variant: 'destructive' }))
      .finally(() => setLoadingRoutes(false));

    // Reset dependent fields when school changes
    form.setValue('routeId', '');
    // @ts-ignore
    form.setValue('tripType', undefined);
    form.setValue('stopName', '');
    form.setValue('customDropoff', '');
    setUseCustomDropoff(false);
  }, [selectedSchoolId]);

  const onSubmit = async (data: VisitBookingFormValues) => {
    setSubmitting(true);
    try {
      const preview = await previewVisitBooking(data);
      sessionStorage.setItem('visitBookingPreview', JSON.stringify(preview));
      sessionStorage.setItem('visitBookingFormData', JSON.stringify(data));
      router.push('/visit/confirm');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to process booking.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl text-left">
      <Card className="shadow-lg border-t-4 border-t-purple-600">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Book a Parent Visit</CardTitle>
          <CardDescription>
            Arrange a comfortable trip to visit your child at school.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* ── Step 1: Parent Details ── */}
            <div className="space-y-4">
              <h3 className="font-bold text-secondary uppercase tracking-widest text-sm">Step 1: Parent Details</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="parentName">Full Name</Label>
                  <Input id="parentName" placeholder="Jane Doe" {...form.register('parentName')} />
                  {form.formState.errors.parentName && (
                    <p className="text-sm text-red-500">{form.formState.errors.parentName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentContact">Phone Number</Label>
                  <Input id="parentContact" placeholder="024xxxxxxx" {...form.register('parentContact')} />
                  {form.formState.errors.parentContact && (
                    <p className="text-sm text-red-500">{form.formState.errors.parentContact.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="jane@example.com" {...form.register('email')} />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* ── Step 2: School ── */}
            <div className="space-y-3">
              <h3 className="font-bold text-secondary uppercase tracking-widest text-sm flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> Step 2: Select School
              </h3>
              <Select
                onValueChange={(value) => form.setValue('schoolId', value, { shouldValidate: true })}
                value={selectedSchoolId}
              >
                <SelectTrigger className="h-11 border-2 border-purple-100 focus:ring-purple-500">
                  <SelectValue placeholder="Select school to visit" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.schoolId && (
                <p className="text-sm text-red-500">{form.formState.errors.schoolId.message}</p>
              )}
            </div>

            {/* ── Steps 3+: Only when school selected ── */}
            {!selectedSchoolId ? (
              <div className="bg-purple-50 border-2 border-dashed border-purple-200 rounded-2xl p-8 text-center flex flex-col items-center">
                <div className="bg-white p-3 rounded-full mb-3 shadow-sm">
                  <Bus className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-purple-800 font-bold text-lg">Please select a school first</p>
                <p className="text-purple-500 text-sm mt-1">Route options will appear once a school is chosen.</p>
              </div>
            ) : (
              <>
                <Separator />

                {/* ── Step 3: Route & Trip Type ── */}
                <div className="space-y-4">
                  <h3 className="font-bold text-secondary uppercase tracking-widest text-sm flex items-center gap-2">
                    <Bus className="w-4 h-4" /> Step 3: Route & Trip Type
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Route</Label>
                      <Select
                        onValueChange={(val) => {
                          form.setValue('routeId', val, { shouldValidate: true });
                          form.setValue('stopName', '');
                          setUseCustomDropoff(false);
                        }}
                        disabled={loadingRoutes}
                        value={selectedRouteId}
                      >
                        <SelectTrigger className="h-11 border-2 border-purple-100">
                          <SelectValue placeholder={loadingRoutes ? 'Loading...' : 'Select a route'} />
                        </SelectTrigger>
                        <SelectContent>
                          {routes.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.routeId && (
                        <p className="text-sm text-red-500">{form.formState.errors.routeId.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Trip Type</Label>
                      <Select
                        onValueChange={(val) => {
                          form.setValue('tripType', val as TripType, { shouldValidate: true });
                          if (val !== 'ONE_WAY_FROM_SCHOOL' && useCustomDropoff) {
                            setUseCustomDropoff(false);
                            form.setValue('customDropoff', '');
                            form.setValue('stopName', '');
                          }
                        }}
                        disabled={!selectedRouteId}
                      >
                        <SelectTrigger className="h-11 border-2 border-purple-100">
                          <SelectValue placeholder="Select trip type" />
                        </SelectTrigger>
                        <SelectContent>
                          {['ONE_WAY_TO_SCHOOL'].map((t) => (
                            <SelectItem key={t} value={t}>{TRIP_TYPE_LABELS[t as TripType]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.tripType && (
                        <p className="text-sm text-red-500">{form.formState.errors.tripType.message}</p>
                      )}
                    </div>
                  </div>

                  {/* ── Stop Selection ── */}
                  {selectedRoute && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Pickup / Drop-off Stop
                      </Label>
                      {!useCustomDropoff ? (
                        <Select
                          onValueChange={(val) => {
                            if (val === '__custom__') {
                              setUseCustomDropoff(true);
                              form.setValue('stopName', '');
                            } else {
                              form.setValue('stopName', val);
                            }
                          }}
                        >
                          <SelectTrigger className="h-11 border-2 border-purple-100">
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
                      ) : (
                        <div className="space-y-2">
                          <Input
                            placeholder="Enter your custom pickup/drop-off location"
                            {...form.register('customDropoff')}
                          />
                          <button
                            type="button"
                            className="text-xs text-purple-600 underline"
                            onClick={() => { setUseCustomDropoff(false); form.setValue('customDropoff', ''); }}
                          >
                            ← Back to stop list
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Price Preview ── */}
                  {calculatedPrice !== null && (
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6 rounded-2xl flex items-center justify-between text-white shadow-xl shadow-purple-500/20">
                      <div>
                        <p className="text-xs font-black text-purple-100 uppercase tracking-widest opacity-80 mb-1">Route</p>
                        <p className="text-lg font-black">{selectedRoute?.name}</p>
                        <p className="text-purple-200 text-sm">{selectedTripType && TRIP_TYPE_LABELS[selectedTripType]}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-purple-100 uppercase tracking-widest opacity-80 mb-1">Amount Due</p>
                        <p className="text-4xl font-black italic leading-none">{formatCurrency(calculatedPrice)}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  size="lg"
                  disabled={submitting}
                >
                  {submitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>
                  ) : (
                    <>Continue to Preview <ArrowRight className="ml-2 h-4 w-4" /></>
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
