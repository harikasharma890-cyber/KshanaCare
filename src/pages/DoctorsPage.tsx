import { useEffect, useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Star, MapPin, Calendar, X } from 'lucide-react';
import type { Page, Department, Doctor } from '@/types';
import { fetchDepartments, fetchDoctors } from '@/lib/api';
import { getDepartmentIcon, getColorClasses } from '@/lib/departmentIcons';
import { StarRating, formatFee } from '@/lib/ui';

type Props = {
  onNavigate: (page: Page, doctorId?: string) => void;
};

export default function DoctorsPage({ onNavigate }: Props) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'fee' | 'experience'>('rating');
  const [showFilters, setShowFilters] = useState(false);

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

  const filteredDoctors = useMemo(() => {
    let result = [...doctors];
    if (selectedDept !== 'all') {
      result = result.filter((d) => d.department_id === selectedDept);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'fee') return a.consultation_fee - b.consultation_fee;
      return b.experience_years - a.experience_years;
    });
    return result;
  }, [doctors, selectedDept, search, sortBy]);

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="bg-white border-b border-ink-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink-900">
            Find Your Doctor
          </h1>
          <p className="mt-2 text-ink-500">
            {doctors.length} specialists across {departments.length} departments
          </p>

          {/* Search bar */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                placeholder="Search by doctor name or specialization..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-ink-200 bg-ink-50 pl-12 pr-4 py-3 text-sm font-medium text-ink-800 placeholder:text-ink-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 transition-all outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-5 py-3 text-sm font-semibold text-ink-700 hover:border-primary-300 transition-colors lg:hidden"
            >
              <SlidersHorizontal size={18} />
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-6`}>
            <div className="rounded-2xl bg-white p-5 shadow-card border border-ink-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-ink-900">Departments</h3>
                <button
                  onClick={() => { setSelectedDept('all'); setSearch(''); }}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  Reset
                </button>
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedDept('all')}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    selectedDept === 'all'
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-ink-600 hover:bg-ink-50'
                  }`}
                >
                  All Departments
                  <span className="text-xs text-ink-400">{doctors.length}</span>
                </button>
                {departments.map((dept) => {
                  const Icon = getDepartmentIcon(dept.icon_name);
                  const count = doctors.filter((d) => d.department_id === dept.id).length;
                  return (
                    <button
                      key={dept.id}
                      onClick={() => setSelectedDept(dept.id)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                        selectedDept === dept.id
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-ink-600 hover:bg-ink-50'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon size={16} />
                        {dept.name}
                      </span>
                      <span className="text-xs text-ink-400">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-card border border-ink-100">
              <h3 className="font-display font-bold text-ink-900 mb-4">Sort By</h3>
              <div className="space-y-2">
                {[
                  { val: 'rating', label: 'Top Rated' },
                  { val: 'fee', label: 'Lowest Fee' },
                  { val: 'experience', label: 'Most Experienced' },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => setSortBy(opt.val as typeof sortBy)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      sortBy === opt.val
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-ink-600 hover:bg-ink-50'
                    }`}
                  >
                    <span className={`h-4 w-4 rounded-full border-2 ${
                      sortBy === opt.val ? 'border-primary-500 bg-primary-500' : 'border-ink-300'
                    }`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Doctor cards */}
          <div>
            {/* Active filter chips */}
            {(selectedDept !== 'all' || search) && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {selectedDept !== 'all' && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-sm font-semibold text-primary-700">
                    {departments.find((d) => d.id === selectedDept)?.name}
                    <button onClick={() => setSelectedDept('all')}>
                      <X size={14} />
                    </button>
                  </span>
                )}
                {search && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-sm font-semibold text-primary-700">
                    "{search}"
                    <button onClick={() => setSearch('')}>
                      <X size={14} />
                    </button>
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-72 rounded-2xl bg-ink-100 animate-pulse" />
                ))}
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="rounded-2xl bg-white p-16 text-center shadow-card border border-ink-100">
                <Search size={48} className="mx-auto text-ink-300" />
                <h3 className="mt-4 font-display text-xl font-bold text-ink-700">No doctors found</h3>
                <p className="mt-2 text-ink-500">Try adjusting your search or filters.</p>
                <button
                  onClick={() => { setSelectedDept('all'); setSearch(''); }}
                  className="mt-6 rounded-xl bg-primary-50 px-5 py-2.5 text-sm font-semibold text-primary-700"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {filteredDoctors.map((doc) => {
                  const dept = departments.find((d) => d.id === doc.department_id);
                  const colors = dept ? getColorClasses(dept.color) : getColorClasses('teal');
                  return (
                    <button
                      key={doc.id}
                      onClick={() => onNavigate('booking', doc.id)}
                      className="group rounded-2xl bg-gradient-card p-6 shadow-card border border-ink-100 text-left transition-all hover:-translate-y-1 hover:shadow-glow"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={doc.photo_url}
                          alt={doc.name}
                          className="h-20 w-20 rounded-2xl object-cover ring-2 ring-ink-100"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display text-lg font-bold text-ink-900 group-hover:text-primary-600 transition-colors">
                            {doc.name}
                          </h3>
                          <p className="text-sm text-ink-500">{doc.specialization}</p>
                          <div className="mt-2 flex items-center gap-3 flex-wrap">
                            <StarRating rating={doc.rating} />
                            <span className="text-xs text-ink-400">{doc.experience_years} yrs exp</span>
                          </div>
                        </div>
                      </div>
                      {dept && (
                        <div className="mt-4">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${colors.soft}`}>
                            {dept.name}
                          </span>
                        </div>
                      )}
                      <p className="mt-3 text-sm text-ink-500 line-clamp-2">{doc.bio}</p>
                      <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4">
                        <div>
                          <p className="text-xs text-ink-400">Consultation</p>
                          <p className="font-bold text-ink-800">{formatFee(doc.consultation_fee)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-ink-400">Next available</p>
                          <p className="text-sm font-semibold text-secondary-600">{doc.next_available}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary-50 py-2.5 text-sm font-semibold text-primary-700 group-hover:bg-primary-500 group-hover:text-white transition-all">
                        <Calendar size={16} />
                        Book Appointment
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
