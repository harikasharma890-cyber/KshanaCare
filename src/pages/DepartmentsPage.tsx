import { useEffect, useState } from 'react';
import { MapPin, ArrowRight, Users, Navigation, Building2, Search } from 'lucide-react';
import type { Page, Department, Doctor } from '@/types';
import { fetchDepartments, fetchDoctors } from '@/lib/api';
import { getDepartmentIcon, getColorClasses } from '@/lib/departmentIcons';

type Props = {
  onNavigate: (page: Page, doctorId?: string) => void;
};

export default function DepartmentsPage({ onNavigate }: Props) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [depts, docs] = await Promise.all([fetchDepartments(), fetchDoctors()]);
        setDepartments(depts);
        setDoctors(docs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredDepts = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  // Hospital floor plan data
  const floors = Array.from(new Set(departments.map((d) => d.floor))).sort();

  if (selectedDept) {
    const deptDoctors = doctors.filter((d) => d.department_id === selectedDept.id);
    const colors = getColorClasses(selectedDept.color);
    const Icon = getDepartmentIcon(selectedDept.icon_name);

    return (
      <div className="animate-fade-in">
        <div className="bg-white border-b border-ink-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <button
              onClick={() => setSelectedDept(null)}
              className="text-sm font-semibold text-primary-600 hover:text-primary-700 mb-4"
            >
              ← Back to all departments
            </button>
            <div className="flex items-start gap-5">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${colors.gradient} text-white shadow-soft`}>
                <Icon size={28} />
              </div>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink-900">
                  {selectedDept.name}
                </h1>
                <p className="mt-2 text-ink-500 max-w-2xl">{selectedDept.description}</p>
                <div className="mt-4 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-1.5 text-sm font-semibold text-ink-600">
                    <MapPin size={15} />
                    {selectedDept.floor}, {selectedDept.wing}
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-1.5 text-sm font-semibold text-ink-600">
                    <Users size={15} />
                    {deptDoctors.length} doctors
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation card */}
          <div className="rounded-2xl border border-primary-100 bg-primary-50 p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-white">
                <Navigation size={22} />
              </div>
              <div>
                <h3 className="font-display font-bold text-ink-900">How to get there</h3>
                <p className="text-sm text-ink-600 mt-1">
                  Enter through the main lobby, take the elevator to the{' '}
                  <strong>{selectedDept.floor}</strong>, and follow signs to the{' '}
                  <strong>{selectedDept.wing}</strong>. The {selectedDept.name} reception desk
                  will be on your right.
                </p>
              </div>
            </div>
          </div>

          <h2 className="font-display text-2xl font-bold text-ink-900 mb-6">Doctors in this department</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {deptDoctors.map((doc) => (
              <button
                key={doc.id}
                onClick={() => onNavigate('booking', doc.id)}
                className="group rounded-2xl bg-gradient-card p-6 shadow-card border border-ink-100 text-left transition-all hover:-translate-y-1 hover:shadow-glow"
              >
                <div className="flex items-start gap-4">
                  <img src={doc.photo_url} alt={doc.name} className="h-16 w-16 rounded-xl object-cover ring-2 ring-ink-100" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg font-bold text-ink-900 group-hover:text-primary-600">
                      {doc.name}
                    </h3>
                    <p className="text-sm text-ink-500">{doc.specialization}</p>
                    <p className="mt-1 text-xs text-ink-400">{doc.experience_years} years experience</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4">
                  <span className="text-sm font-semibold text-secondary-600">{doc.next_available}</span>
                  <span className="flex items-center gap-1 text-sm font-semibold text-primary-600 group-hover:gap-2 transition-all">
                    Book now <ArrowRight size={15} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-white border-b border-ink-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink-900">
            Hospital Departments
          </h1>
          <p className="mt-2 text-ink-500">
            Navigate our hospital with ease — find departments, floors, and specialists.
          </p>
          <div className="mt-6 relative max-w-xl">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Search departments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-ink-200 bg-ink-50 pl-12 pr-4 py-3 text-sm font-medium text-ink-800 placeholder:text-ink-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Department grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {loading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-ink-100 animate-pulse" />
            ))
          ) : (
            filteredDepts.map((dept) => {
              const Icon = getDepartmentIcon(dept.icon_name);
              const colors = getColorClasses(dept.color);
              const count = doctors.filter((d) => d.department_id === dept.id).length;
              return (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDept(dept)}
                  className="group rounded-2xl bg-white p-6 shadow-card border border-ink-100 text-left transition-all hover:-translate-y-1 hover:shadow-glow"
                >
                  <div className="flex items-start justify-between">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${colors.gradient} text-white shadow-soft`}>
                      <Icon size={26} />
                    </div>
                    <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${colors.soft}`}>
                      {count} doctors
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-ink-900 group-hover:text-primary-600 transition-colors">
                    {dept.name}
                  </h3>
                  <p className="mt-2 text-sm text-ink-500 line-clamp-2 leading-relaxed">{dept.description}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-ink-600">
                      <MapPin size={15} />
                      {dept.floor}, {dept.wing}
                    </div>
                    <ArrowRight size={18} className="text-ink-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Floor plan */}
        <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-card border border-ink-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-ink-900">Hospital Floor Map</h2>
              <p className="text-sm text-ink-500">Quick reference for department locations</p>
            </div>
          </div>
          <div className="space-y-4">
            {floors.map((floor) => {
              const floorDepts = departments.filter((d) => d.floor === floor);
              return (
                <div key={floor} className="flex flex-col sm:flex-row gap-4 sm:items-center rounded-xl border border-ink-100 p-4">
                  <div className="flex items-center gap-3 sm:w-40 flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary text-white font-bold text-sm">
                      {floor.charAt(0)}
                    </div>
                    <span className="font-display font-bold text-ink-900 text-sm">{floor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {floorDepts.map((dept) => {
                      const colors = getColorClasses(dept.color);
                      return (
                        <button
                          key={dept.id}
                          onClick={() => setSelectedDept(dept)}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${colors.soft} hover:opacity-80 transition-opacity`}
                        >
                          {dept.name}
                          <span className="text-[10px] opacity-70">· {dept.wing}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
