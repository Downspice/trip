'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Loader2, RefreshCw, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  getSchools, createSchool, updateSchool, deleteSchool,
  getHouses, createHouse, updateHouse, deleteHouse,
  getRoutes, createRoute, updateRoute, deleteRoute, addRouteStop, updateRouteStop, deleteRouteStop,
  type School, type House, type Route,
} from '@/lib/api';
import { formatCurrency } from '@/lib/utils';


// ─── Route Stop Manager Sub-component ────────────────────────────────────────

function RouteStopManager({ route, onStopsChanged }: { route: Route; onStopsChanged: () => void }) {
  const { toast } = useToast();
  const [newStopName, setNewStopName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingStopId, setEditingStopId] = useState<string | null>(null);
  const [editStopName, setEditStopName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!newStopName.trim()) return;
    setAdding(true);
    try {
      await addRouteStop(route.id, newStopName.trim());
      setNewStopName('');
      onStopsChanged();
      toast({ title: 'Stop added' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to add stop.' });
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = (stopId: string, currentName: string) => {
    setEditingStopId(stopId);
    setEditStopName(currentName);
  };

  const handleSaveEdit = async (stopId: string) => {
    if (!editStopName.trim()) return;
    setSaving(true);
    try {
      await updateRouteStop(route.id, stopId, editStopName.trim());
      setEditingStopId(null);
      onStopsChanged();
      toast({ title: 'Stop renamed' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to rename stop.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (stopId: string) => {
    if (!confirm('Remove this stop?')) return;
    try {
      await deleteRouteStop(route.id, stopId);
      onStopsChanged();
      toast({ title: 'Stop removed' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to remove stop.' });
    }
  };

  return (
    <div className="border-t pt-3 mt-2 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pickup / Drop-off Stops</p>
      <div className="space-y-1.5">
        {route.stops.length === 0 && (
          <span className="text-xs text-muted-foreground italic block">No stops yet — add one below.</span>
        )}
        {route.stops.map((stop) => (
          <div key={stop.id}>
            {editingStopId === stop.id ? (
              /* ── Editing state ── */
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-primary shrink-0" />
                <Input
                  className="h-7 text-xs flex-1"
                  value={editStopName}
                  onChange={(e) => setEditStopName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit(stop.id);
                    if (e.key === 'Escape') setEditingStopId(null);
                  }}
                  autoFocus
                />
                <button
                  onClick={() => handleSaveEdit(stop.id)}
                  disabled={saving || !editStopName.trim()}
                  className="text-green-600 hover:text-green-800 disabled:opacity-40"
                >
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => setEditingStopId(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              /* ── Display state ── */
              <div className="group flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-md text-xs">
                <MapPin className="h-3 w-3 text-primary shrink-0" />
                <span className="flex-1 font-medium">{stop.name}</span>
                <button
                  onClick={() => handleEdit(stop.id, stop.name)}
                  className="text-gray-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                  title="Rename stop"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleDelete(stop.id)}
                  className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove stop"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Add stop */}
      <div className="flex space-x-2">
        <Input
          className="h-7 text-xs"
          placeholder="Add stop name…"
          value={newStopName}
          onChange={(e) => setNewStopName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button size="sm" variant="secondary" className="h-7 text-xs px-2" onClick={handleAdd} disabled={adding || !newStopName.trim()}>
          {adding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
        </Button>
      </div>
    </div>
  );
}


// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminConfigPage() {
  const { toast } = useToast();

  // Schools
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [newSchoolName, setNewSchoolName] = useState('');
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [editingSchool, setEditingSchool] = useState(false);
  const [editSchoolName, setEditSchoolName] = useState('');

  // Entities
  const [houses, setHouses] = useState<House[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loadingEntities, setLoadingEntities] = useState(false);

  // New House/Programme/Route forms
  const [newHouseName, setNewHouseName] = useState('');
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteTo, setNewRouteTo] = useState('');
  const [newRouteFrom, setNewRouteFrom] = useState('');

  // Edit states
  const [editingHouseId, setEditingHouseId] = useState<string | null>(null);
  const [editHouseName, setEditHouseName] = useState('');
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [editRouteName, setEditRouteName] = useState('');
  const [editRouteTo, setEditRouteTo] = useState('');
  const [editRouteFrom, setEditRouteFrom] = useState('');
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

  const loadSchools = async () => {
    try {
      setSchools(await getSchools());
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load schools.' });
    } finally {
      setLoadingSchools(false);
    }
  };

  const loadEntities = async (schoolId: string) => {
    if (!schoolId) return;
    setLoadingEntities(true);
    try {
      const [h, ro] = await Promise.all([
        getHouses(schoolId),
        getRoutes(schoolId),
      ]);
      setHouses(h);
      setRoutes(ro);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load entities.' });
    } finally {
      setLoadingEntities(false);
    }
  };

  useEffect(() => { loadSchools(); }, []);
  useEffect(() => { loadEntities(selectedSchoolId); }, [selectedSchoolId]);

  // ─── School Handlers ──────────────────────────────────────────────────────
  const handleCreateSchool = async () => {
    if (!newSchoolName.trim()) return;
    try {
      const s = await createSchool(newSchoolName);
      setSchools([...schools, s]);
      setNewSchoolName('');
      setSelectedSchoolId(s.id);
      toast({ title: 'School created.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create school.' });
    }
  };

  const handleUpdateSchool = async () => {
    if (!editSchoolName.trim() || !selectedSchoolId) return;
    try {
      const updated = await updateSchool(selectedSchoolId, editSchoolName);
      setSchools(schools.map((s) => (s.id === selectedSchoolId ? updated : s)));
      setEditingSchool(false);
      toast({ title: 'School updated.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update school.' });
    }
  };

  const handleDeleteSchool = async () => {
    if (!selectedSchoolId) return;
    if (!confirm('Delete this school and ALL its data? This cannot be undone.')) return;
    try {
      await deleteSchool(selectedSchoolId);
      setSchools(schools.filter((s) => s.id !== selectedSchoolId));
      setSelectedSchoolId('');
      setHouses([]); setRoutes([]);
      toast({ title: 'School deleted.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete school.' });
    }
  };

  // ─── House Handlers ───────────────────────────────────────────────────────
  const handleCreateHouse = async () => {
    if (!newHouseName.trim() || !selectedSchoolId) return;
    try {
      const h = await createHouse(newHouseName, selectedSchoolId);
      setHouses([...houses, h]);
      setNewHouseName('');
      toast({ title: 'House added.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create house.' });
    }
  };

  const handleUpdateHouse = async (id: string) => {
    if (!editHouseName.trim()) return;
    try {
      const updated = await updateHouse(id, editHouseName);
      setHouses(houses.map((h) => (h.id === id ? updated : h)));
      setEditingHouseId(null);
      toast({ title: 'House updated.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update.' });
    }
  };

  const handleDeleteHouse = async (id: string) => {
    if (!confirm('Delete this house?')) return;
    try {
      await deleteHouse(id);
      setHouses(houses.filter((h) => h.id !== id));
      toast({ title: 'House removed.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete.' });
    }
  };


  // ─── Route Handlers ───────────────────────────────────────────────────────
  const handleCreateRoute = async () => {
    if (!newRouteName.trim() || !newRouteTo || !newRouteFrom || !selectedSchoolId) return;
    try {
      const r = await createRoute({
        name: newRouteName,
        schoolId: selectedSchoolId,
        priceToSchool: parseFloat(newRouteTo),
        priceFromSchool: parseFloat(newRouteFrom),
      });
      setRoutes([...routes, r]);
      setNewRouteName(''); setNewRouteTo(''); setNewRouteFrom('');
      toast({ title: 'Route added.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create route.' });
    }
  };

  const handleUpdateRoute = async (id: string) => {
    if (!editRouteName.trim()) return;
    try {
      const updated = await updateRoute(id, {
        name: editRouteName,
        priceToSchool: parseFloat(editRouteTo),
        priceFromSchool: parseFloat(editRouteFrom),
      });
      setRoutes(routes.map((r) => (r.id === id ? updated : r)));
      setEditingRouteId(null);
      toast({ title: 'Route updated.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update route.' });
    }
  };

  const handleDeleteRoute = async (id: string) => {
    if (!confirm('Delete this route and all its stops?')) return;
    try {
      await deleteRoute(id);
      setRoutes(routes.filter((r) => r.id !== id));
      toast({ title: 'Route removed.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete.' });
    }
  };

  if (loadingSchools) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedSchool = schools.find((s) => s.id === selectedSchoolId);

  return (
    <main className="container mx-auto p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Platform Configuration</h1>
        <p className="text-gray-500">Manage schools, houses, and trip routes with 3-tier pricing.</p>
      </div>

      {/* School Selection & Creation */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Select Context</CardTitle>
            <CardDescription>Choose a school to manage its data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!editingSchool ? (
              <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
                <SelectTrigger><SelectValue placeholder="Select a school" /></SelectTrigger>
                <SelectContent>
                  {schools.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center space-x-2">
                <Input value={editSchoolName} onChange={(e) => setEditSchoolName(e.target.value)} autoFocus />
                <Button size="icon" variant="outline" className="text-green-600" onClick={handleUpdateSchool}><Check className="h-4 w-4" /></Button>
                <Button size="icon" variant="outline" className="text-gray-500" onClick={() => setEditingSchool(false)}><X className="h-4 w-4" /></Button>
              </div>
            )}
            {selectedSchoolId && !editingSchool && (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => { setEditSchoolName(selectedSchool?.name || ''); setEditingSchool(true); }}>
                  <Edit2 className="mr-2 h-4 w-4" /> Rename School
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDeleteSchool}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete School
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add New School</CardTitle>
            <CardDescription>Create a new school root entity.</CardDescription>
          </CardHeader>
          <CardContent className="flex space-x-2">
            <Input
              placeholder="e.g. PRESEC Legon"
              value={newSchoolName}
              onChange={(e) => setNewSchoolName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateSchool()}
            />
            <Button onClick={handleCreateSchool} disabled={!newSchoolName.trim()}>
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* School Entities */}
      {selectedSchoolId && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-2 border-b">
            <h2 className="text-2xl font-semibold">Configuring: {selectedSchool?.name}</h2>
            <Button variant="outline" size="sm" onClick={() => loadEntities(selectedSchoolId)}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh Data
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* HOUSES */}
            <Card>
              <CardHeader>
                <CardTitle>Houses</CardTitle>
                <CardDescription>Manage residential houses.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input placeholder="House name" value={newHouseName} onChange={(e) => setNewHouseName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateHouse()} />
                  <Button variant="secondary" onClick={handleCreateHouse} disabled={!newHouseName.trim()}>Add</Button>
                </div>
                {loadingEntities ? (
                  <div className="py-4 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>
                ) : (
                  <div className="rounded-md border bg-white overflow-hidden">
                    <Table>
                      <TableBody>
                        {houses.length === 0 && (
                          <TableRow><TableCell className="text-center text-gray-500 py-6">No houses found</TableCell></TableRow>
                        )}
                        {houses.map((house) => (
                          <TableRow key={house.id} className="group">
                            <TableCell className="font-medium p-2">
                              {editingHouseId === house.id ? (
                                <Input value={editHouseName} onChange={(e) => setEditHouseName(e.target.value)} className="h-8 text-sm" autoFocus />
                              ) : house.name}
                            </TableCell>
                            <TableCell className="text-right p-2 w-24">
                              {editingHouseId === house.id ? (
                                <div className="flex justify-end space-x-1">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-green-600" onClick={() => handleUpdateHouse(house.id)}><Check className="h-4 w-4" /></Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500" onClick={() => setEditingHouseId(null)}><X className="h-4 w-4" /></Button>
                                </div>
                              ) : (
                                <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500" onClick={() => { setEditingHouseId(house.id); setEditHouseName(house.name); }}><Edit2 className="h-4 w-4" /></Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteHouse(house.id)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>


            {/* ROUTES */}
            <Card>
              <CardHeader>
                <CardTitle>Routes & Pricing</CardTitle>
                <CardDescription>Manage trip routes with 3-tier pricing and stops.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* New Route Form */}
                <div className="space-y-2 p-3 bg-muted/40 rounded-lg border">
                  <Input
                    placeholder="Route name (e.g. Accra ↔ AUGUSCO)"
                    value={newRouteName}
                    onChange={(e) => setNewRouteName(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">→ To School</label>
                      <Input type="number" className="h-7 text-xs" placeholder="GHS" value={newRouteTo} onChange={(e) => setNewRouteTo(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">← From School</label>
                      <Input type="number" className="h-7 text-xs" placeholder="GHS" value={newRouteFrom} onChange={(e) => setNewRouteFrom(e.target.value)} />
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full h-8 text-xs"
                    onClick={handleCreateRoute}
                    disabled={!newRouteName.trim() || !newRouteTo || !newRouteFrom}
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Route
                  </Button>
                </div>

                {loadingEntities ? (
                  <div className="py-4 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>
                ) : (
                  <div className="space-y-2">
                    {routes.length === 0 && (
                      <p className="text-center text-gray-500 py-4 text-sm">No routes found</p>
                    )}
                    {routes.map((route) => (
                      <div key={route.id} className="rounded-lg border bg-white overflow-hidden">
                        {/* Route row */}
                        <div className="p-3">
                          {editingRouteId === route.id ? (
                            <div className="space-y-2">
                              <Input value={editRouteName} onChange={(e) => setEditRouteName(e.target.value)} className="h-8 text-sm" autoFocus />
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">→ To School</label>
                                  <Input type="number" className="h-7 text-xs" value={editRouteTo} onChange={(e) => setEditRouteTo(e.target.value)} />
                                </div>
                                <div>
                                  <label className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">← From School</label>
                                  <Input type="number" className="h-7 text-xs" value={editRouteFrom} onChange={(e) => setEditRouteFrom(e.target.value)} />
                                </div>
                              </div>
                              <div className="flex justify-end space-x-1">
                                <Button variant="ghost" size="sm" className="h-7 text-xs text-green-600" onClick={() => handleUpdateRoute(route.id)}><Check className="h-3.5 w-3.5 mr-1" /> Save</Button>
                                <Button variant="ghost" size="sm" className="h-7 text-xs text-gray-500" onClick={() => setEditingRouteId(null)}><X className="h-3.5 w-3.5 mr-1" /> Cancel</Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-sm">{route.name}</p>
                                  <div className="flex gap-3 mt-1">
                                    <span className="text-xs bg-green-50 text-green-700 rounded px-1.5 py-0.5 font-semibold">→ {formatCurrency(route.priceToSchool)}</span>
                                    <span className="text-xs bg-amber-50 text-amber-700 rounded px-1.5 py-0.5 font-semibold">← {formatCurrency(route.priceFromSchool)}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 ml-2 shrink-0">
                                  <Button
                                    variant="ghost" size="sm"
                                    className="h-7 w-7 p-0 text-gray-500"
                                    onClick={() => setExpandedRouteId(expandedRouteId === route.id ? null : route.id)}
                                  >
                                    {expandedRouteId === route.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-500" onClick={() => {
                                    setEditingRouteId(route.id);
                                    setEditRouteName(route.name);
                                    setEditRouteTo(route.priceToSchool.toString());
                                    setEditRouteFrom(route.priceFromSchool.toString());
                                  }}>
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteRoute(route.id)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>

                              {/* Expandable stops section */}
                              {expandedRouteId === route.id && (
                                <RouteStopManager
                                  route={route}
                                  onStopsChanged={() => loadEntities(selectedSchoolId)}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </main>
  );
}
