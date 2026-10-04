import { useEffect, useState } from 'react';
import {
  Calendar, Clock, MapPin, X, CheckCircle2, Users, Phone,
  Loader2, AlertCircle, Stethoscope, RotateCcw, Trash2, Info,
} from 'lucide-react';
import type { Page, Doctor, Department, Appointment } from '@/types';
import {
  fetchAppointments, fetchDoctors, fetchDepartments,
  updateAppointmentStatus, rescheduleAppointment,
} from '@/lib/api';
import { getDepartmentIcon, getColorClasses } from '@/lib/departmentIcons';

type Props = {
  onNavigate: (page: Page, doctorId?: string) => void;
};

type EnrichedAppt = Appointment & { doctor?: Doctor; department?: Department };

export default function AppointmentsPage({ onNavigate }: Props) {
  const [appointments, setAppointments] = useState<EnrichedAppt[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [rescheduleAppt, setRescheduleAppt] = useState<EnrichedAppt | null>(null);
  const [cancelAppt, setCancelAppt] = useState<EnrichedAppt | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [appts, docs, depts] = await Promise.all([
        fetchAppointments(),
        fetchDoctors(),
        fetchDepartments(),
      ]);
      setDoctors(docs);
      setDepartments(depts);
      setAppointments(
        appts.map((a) => ({
          ...a,
          doctor: docs.find((d) => d.id === a.doctor_id),
          department: depts.find((d) => d.id === a.department_id),
        }))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const filteredAppts = appointments.filter((a) => filter === 'all' || a.status === filter);

  const sortedAppts = [...filteredAppts].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  async function handleCancel() {
    if (!cancelAppt) return;
    setActionLoading(true);
    try {
      await updateAppointmentStatus(cancelAppt.id, 'cancelled');
      setCancelAppt(null);
      await loadData();
    } catch (e) {
      console.error(e);
      alert('Failed to cancel appointment.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReschedule(newDate: string, newSlot: string) {
    if (!rescheduleAppt) return;
    setActionLoading(true);
    try {
      await rescheduleAppointment(rescheduleAppt.id, newDate, newSlot);
      setRescheduleAppt(null);
      await loadData();
    } catch (e) {
      console.error(e);
      alert('Failed to reschedule appointment.');
    } finally {
      setActionLoading(false);
    }
  }

  const filters: { val: typeof filter; label: string }[] = [
    { val: 'all', label: 'All' },
    { val: 'confirmed', label: 'Confirmed' },
    { val: 'completed', label: 'Completed' },
    { val: 'cancelled', label: 'Cancelled' },
  ];

  const statusConfig: Record<string, { label: string; classes: string; icon: typeof CheckCircle2 }> = {
    confirmed: { label: 'Confirmed', classes: 'bg-secondary-50 text-secondary-700 border-secondary-200', icon: CheckCircle2 },
    completed: { label: 'Completed', classes: 'bg-primary-50 text-primary-700 border-primary-200', icon: CheckCircle2 },
    cancelled: { label: 'Cancelled', classes: 'bg-rose-50 text-rose-700 border-rose-200', icon: X },
    pending: { label: 'Pending', classes: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-white border-b border-ink-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-display text-3xl font-extrabold text-ink-900">My Appointments</h1>
          <p className="mt-2 text-ink-500">View, reschedule, or cancel your appointments</p>

          {/* Filter tabs */}
          <div className="mt-6 flex gap-2 overflow-x-auto scrollbar-hide">
            {filters.map((f) => {
              const count = f.val === 'all' ? appointments.length : appointments.filter((a) => a.status === f.val).length;
              return (
                <button
                  key={f.val}
                  onClick={() => setFilter(f.val)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all ${
                    filter === f.val
                      ? 'gradient-primary text-white shadow-soft'
                      : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                  }`}
                >
                  {f.label}
                  <span className={`text-xs rounded-full px-1.5 py-0.5 ${filter === f.val ? 'bg-white/20' : 'bg-ink-200 text-ink-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {sortedAppts.length === 0 ? (
          <div className="rounded-2xl bg-white p-16 text-center shadow-card border border-ink-100">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-ink-100">
              <Calendar size={36} className="text-ink-300" />
            </div>
            <h3 className="mt-6 font-display text-xl font-bold text-ink-700">
              {filter === 'all' ? 'No appointments yet' : `No ${filter} appointments`}
            </h3>
            <p className="mt-2 text-ink-500">
              {filter === 'all'
                ? 'Book your first appointment to get started.'
                : 'Try switching to a different filter.'}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => onNavigate('doctors')}
                className="mt-6 inline-flex items-center gap-2 rounded-xl gradient-primary px-6 py-3 font-bold text-white shadow-glow transition-transform hover:scale-105"
              >
                <Stethoscope size={18} /> Find a Doctor
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAppts.map((appt) => {
              const dept = appt.department;
              const colors = dept ? getColorClasses(dept.color) : getColorClasses('teal');
              const Icon = dept ? getDepartmentIcon(dept.icon_name) : Stethoscope;
              const status = statusConfig[appt.status] ?? statusConfig.confirmed;
              const isActive = appt.status === 'confirmed' || appt.status === 'pending';

              return (
                <div
                  key={appt.id}
                  className="rounded-2xl bg-white shadow-card border border-ink-100 overflow-hidden transition-all hover:shadow-glow"
                >
                  {/* Doctor header */}
                  <div className={`bg-gradient-to-r ${colors.gradient} p-5 text-white`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur`}>
                        <status.icon size={12} /> {status.label}
                      </span>
                      <span className="text-xs text-white/70 flex items-center gap-1">
                        <Users size={12} /> Queue #{appt.queue_number}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {appt.doctor && (
                        <img src={appt.doctor.photo_url} alt={appt.doctor.name} className="h-12 w-12 rounded-xl object-cover ring-2 ring-white/30" />
                      )}
                      <div className="min-w-0">
                        <p className="font-display font-bold truncate">{appt.doctor?.name}</p>
                        <p className="text-xs text-white/80 truncate">{appt.doctor?.specialization}</p>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-ink-400" />
                        <div>
                          <p className="text-xs text-ink-400">Date</p>
                          <p className="font-semibold text-ink-800">
                            {new Date(appt.appointment_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-ink-400" />
                        <div>
                          <p className="text-xs text-ink-400">Time</p>
                          <p className="font-semibold text-ink-800">{appt.time_slot}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <User2 size={16} className="text-ink-400" />
                      <span className="font-semibold text-ink-800">{appt.patient_name}</span>
                      <span className="text-ink-400">· {appt.patient_age} yrs</span>
                    </div>

                    {dept && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin size={16} className="text-ink-400" />
                        <span className="text-ink-600">{dept.floor}, {dept.wing}</span>
                      </div>
                    )}

                    {/* Prep notes */}
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-start gap-2">
                      <Info size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-ink-600 leading-relaxed">{appt.prep_notes}</p>
                    </div>

                    {/* Actions */}
                    {isActive ? (
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => onNavigate('queue')}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary-50 py-2.5 text-xs font-bold text-primary-700 hover:bg-primary-100 transition-colors"
                        >
                          <Users size={14} /> Track Queue
                        </button>
                        <button
                          onClick={() => setRescheduleAppt(appt)}
                          className="flex items-center justify-center gap-1.5 rounded-lg bg-ink-50 px-3 py-2.5 text-xs font-bold text-ink-600 hover:bg-ink-100 transition-colors"
                        >
                          <RotateCcw size={14} /> Reschedule
                        </button>
                        <button
                          onClick={() => setCancelAppt(appt)}
                          className="flex items-center justify-center rounded-lg bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => onNavigate('doctors')}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary-50 py-2.5 text-xs font-bold text-primary-700 hover:bg-primary-100 transition-colors"
                        >
                          <Stethoscope size={14} /> Book Again
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel modal */}
      {cancelAppt && (
        <Modal onClose={() => setCancelAppt(null)}>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-ink-900">Cancel Appointment?</h3>
              <p className="text-sm text-ink-500">This action cannot be undone.</p>
            </div>
          </div>
          <div className="rounded-xl bg-ink-50 p-4 text-sm space-y-1">
            <p><span className="text-ink-400">Doctor:</span> <span className="font-semibold text-ink-800">{cancelAppt.doctor?.name}</span></p>
            <p><span className="text-ink-400">Date:</span> <span className="font-semibold text-ink-800">
              {new Date(cancelAppt.appointment_date).toLocaleDateString('en-US', { dateStyle: 'long' })} at {cancelAppt.time_slot}
            </span></p>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setCancelAppt(null)}
              className="flex-1 rounded-xl border border-ink-200 bg-white py-3 text-sm font-bold text-ink-700 hover:border-ink-300 transition-colors"
            >
              Keep Appointment
            </button>
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-rose-500 py-3 text-sm font-bold text-white hover:bg-rose-600 transition-colors disabled:opacity-50"
            >
              {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Yes, Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* Reschedule modal */}
      {rescheduleAppt && (
        <RescheduleModal
          appt={rescheduleAppt}
          onReschedule={handleReschedule}
          onClose={() => setRescheduleAppt(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

function User2({ size, className }: { size: number; className?: string }) {
  return <Phone size={size} className={className} />;
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-card animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100">
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}

function RescheduleModal({
  appt, onReschedule, onClose, loading,
}: {
  appt: EnrichedAppt;
  onReschedule: (date: string, slot: string) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [selectedDate, setSelectedDate] = useState(appt.appointment_date);
  const [selectedSlot, setSelectedSlot] = useState(appt.time_slot);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().split('T')[0],
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    };
  });

  const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '05:00', '05:30', '06:00'];

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
          <RotateCcw size={24} />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-ink-900">Reschedule Appointment</h3>
          <p className="text-sm text-ink-500">{appt.doctor?.name}</p>
        </div>
      </div>

      {/* Date */}
      <p className="text-sm font-semibold text-ink-600 mb-2">Select new date</p>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4">
        {days.map((d) => (
          <button
            key={d.date}
            onClick={() => setSelectedDate(d.date)}
            className={`flex flex-col items-center justify-center rounded-xl px-3 py-2.5 min-w-[70px] transition-all border-2 ${
              selectedDate === d.date
                ? 'gradient-primary text-white border-transparent'
                : 'bg-white text-ink-600 border-ink-200 hover:border-primary-300'
            }`}
          >
            <span className="text-xs font-semibold opacity-80">{d.label}</span>
            <span className="text-sm font-bold">{d.dateNum}</span>
          </button>
        ))}
      </div>

      {/* Time */}
      <p className="text-sm font-semibold text-ink-600 mb-2">Select new time</p>
      <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
        {timeSlots.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedSlot(t)}
            className={`rounded-lg py-2 text-sm font-semibold transition-all ${
              selectedSlot === t
                ? 'gradient-primary text-white'
                : 'bg-ink-50 text-ink-700 hover:bg-primary-50 hover:text-primary-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 rounded-xl border border-ink-200 bg-white py-3 text-sm font-bold text-ink-700 hover:border-ink-300 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onReschedule(selectedDate, selectedSlot)}
          disabled={loading || (selectedDate === appt.appointment_date && selectedSlot === appt.time_slot)}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl gradient-primary py-3 text-sm font-bold text-white shadow-soft transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
          Confirm
        </button>
      </div>
    </Modal>
  );
}
