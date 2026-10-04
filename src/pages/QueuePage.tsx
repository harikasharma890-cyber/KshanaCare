import { useEffect, useState } from 'react';
import {
  Users, Clock, MapPin, Loader2, Stethoscope, TrendingDown,
  CheckCircle2, AlertCircle, Activity, User, Calendar,
} from 'lucide-react';
import type { Page, Doctor, Department, Appointment } from '@/types';
import { fetchDoctors, fetchDepartments, fetchAppointments } from '@/lib/api';
import { getDepartmentIcon, getColorClasses } from '@/lib/departmentIcons';

type Props = {
  onNavigate: (page: Page, doctorId?: string) => void;
};

type QueueRow = {
  appointment: Appointment;
  doctor: Doctor | undefined;
  department: Department | undefined;
  position: number;
  ahead: number;
  estWait: number;
};

export default function QueuePage({ onNavigate }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApptId, setSelectedApptId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [appts, docs, depts] = await Promise.all([
          fetchAppointments(),
          fetchDoctors(),
          fetchDepartments(),
        ]);
        setAppointments(appts.filter((a) => a.status !== 'cancelled'));
        setDoctors(docs);
        setDepartments(depts);
        if (appts.length > 0 && appts[0].status !== 'cancelled') {
          setSelectedApptId(appts[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const activeAppts = appointments.filter((a) => a.status === 'confirmed' || a.status === 'pending');

  const queueRows: QueueRow[] = activeAppts.map((appt) => {
    const doctor = doctors.find((d) => d.id === appt.doctor_id);
    const department = departments.find((d) => d.id === appt.department_id);
    const ahead = Math.max(0, appt.queue_number - 1);
    const estWait = ahead * 8 + Math.floor(Math.random() * 5);
    return { appointment: appt, doctor, department, position: appt.queue_number, ahead, estWait };
  });

  const selectedRow = queueRows.find((r) => r.appointment.id === selectedApptId);
  const selectedDept = selectedRow?.department;
  const colors = selectedDept ? getColorClasses(selectedDept.color) : getColorClasses('teal');
  const Icon = selectedDept ? getDepartmentIcon(selectedDept.icon_name) : Stethoscope;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    );
  }

  if (queueRows.length === 0) {
    return (
      <div className="animate-fade-in py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-ink-100">
            <Users size={36} className="text-ink-300" />
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold text-ink-900">No Active Appointments</h1>
          <p className="mt-2 text-ink-500">
            Book an appointment to see your live queue position and estimated wait time here.
          </p>
          <button
            onClick={() => onNavigate('doctors')}
            className="mt-6 inline-flex items-center gap-2 rounded-xl gradient-primary px-6 py-3 font-bold text-white shadow-glow transition-transform hover:scale-105"
          >
            <Stethoscope size={18} /> Find a Doctor
          </button>
        </div>
      </div>
    );
  }

  const progress = selectedRow ? Math.max(0, Math.min(100, ((selectedRow.position - selectedRow.ahead) / selectedRow.position) * 100)) : 0;

  return (
    <div className="animate-fade-in">
      <div className="bg-white border-b border-ink-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Users size={22} />
            </div>
            <div>
              <h1 className="font-display text-3xl font-extrabold text-ink-900">Live Queue</h1>
              <p className="text-ink-500">Track your real-time position and estimated wait</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Left: queue visualization */}
          <div>
            {selectedRow && (
              <>
                {/* Main queue card */}
                <div className="rounded-2xl bg-white shadow-card border border-ink-100 overflow-hidden">
                  <div className={`bg-gradient-to-r ${colors.gradient} p-6 text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {selectedRow.doctor && (
                          <img
                            src={selectedRow.doctor.photo_url}
                            alt={selectedRow.doctor.name}
                            className="h-16 w-16 rounded-xl object-cover ring-2 ring-white/30"
                          />
                        )}
                        <div>
                          <p className="font-display text-xl font-bold">{selectedRow.doctor?.name}</p>
                          <p className="text-sm text-white/80">{selectedRow.doctor?.specialization}</p>
                          {selectedDept && (
                            <p className="text-xs text-white/70 mt-0.5 flex items-center gap-1">
                              <Icon size={12} /> {selectedDept.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/70 uppercase tracking-wider">Queue No.</p>
                        <p className="font-display text-4xl font-extrabold">#{selectedRow.position}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="rounded-xl bg-ink-50 p-4 text-center">
                        <div className="flex items-center justify-center text-ink-400 mb-1">
                          <Users size={18} />
                        </div>
                        <p className="font-display text-2xl font-extrabold text-ink-900">{selectedRow.ahead}</p>
                        <p className="text-xs text-ink-400">ahead of you</p>
                      </div>
                      <div className="rounded-xl bg-amber-50 p-4 text-center">
                        <div className="flex items-center justify-center text-amber-500 mb-1">
                          <Clock size={18} />
                        </div>
                        <p className="font-display text-2xl font-extrabold text-amber-600">~{selectedRow.estWait}</p>
                        <p className="text-xs text-ink-400">min wait</p>
                      </div>
                      <div className="rounded-xl bg-secondary-50 p-4 text-center">
                        <div className="flex items-center justify-center text-secondary-500 mb-1">
                          <Calendar size={18} />
                        </div>
                        <p className="font-display text-lg font-extrabold text-secondary-700">
                          {selectedRow.appointment.time_slot}
                        </p>
                        <p className="text-xs text-ink-400">your slot</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-semibold text-ink-600">Queue Progress</span>
                        <span className="font-bold text-primary-600">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-ink-100 overflow-hidden">
                        <div
                          className="h-full rounded-full gradient-emerald transition-all duration-700"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Position visualization */}
                    <div className="mt-6">
                      <p className="text-sm font-semibold text-ink-600 mb-3">People in queue ahead of you</p>
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: selectedRow.ahead }).map((_, i) => (
                          <div
                            key={i}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-100 text-ink-500 text-xs font-bold"
                          >
                            {i + 1}
                          </div>
                        ))}
                        <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-white text-xs font-bold ring-4 ring-primary-100">
                          You
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    {selectedDept && (
                      <div className="mt-6 rounded-xl border border-primary-100 bg-primary-50 p-4">
                        <div className="flex items-start gap-3">
                          <MapPin size={20} className="text-primary-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-ink-900 text-sm">Where to go</p>
                            <p className="text-sm text-ink-600 mt-0.5">
                              {selectedDept.floor}, {selectedDept.wing} — {selectedDept.name} Department
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status timeline */}
                <div className="mt-6 rounded-2xl bg-white p-6 shadow-card border border-ink-100">
                  <h3 className="font-display text-lg font-bold text-ink-900 mb-4">Your Status</h3>
                  <div className="space-y-1">
                    {[
                      { icon: CheckCircle2, label: 'Appointment booked', desc: selectedRow.appointment.created_at ? new Date(selectedRow.appointment.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '', done: true },
                      { icon: Users, label: 'In queue', desc: `${selectedRow.ahead} patients ahead of you`, done: true, active: true },
                      { icon: Activity, label: 'Your turn', desc: 'Doctor will call your queue number', done: false },
                      { icon: CheckCircle2, label: 'Consultation complete', desc: 'Visit finished — thank you!', done: false },
                    ].map((s, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                            s.done
                              ? s.active
                                ? 'gradient-primary text-white ring-4 ring-primary-100'
                                : 'bg-secondary-100 text-secondary-600'
                              : 'bg-ink-100 text-ink-300'
                          }`}>
                            <s.icon size={18} />
                          </div>
                          {i < 3 && <div className={`w-0.5 h-8 ${s.done ? 'bg-secondary-300' : 'bg-ink-100'}`} />}
                        </div>
                        <div className="pt-1.5 pb-6">
                          <p className={`font-semibold text-sm ${s.done ? 'text-ink-900' : 'text-ink-400'}`}>
                            {s.label}
                            {s.active && (
                              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse" /> Now
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-ink-400 mt-0.5">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right: appointment selector */}
          <div className="lg:sticky lg:top-24 h-fit space-y-4">
            <h3 className="font-display font-bold text-ink-900">Your Appointments</h3>
            {queueRows.map((row) => {
              const dept = row.department;
              const rowColors = dept ? getColorClasses(dept.color) : getColorClasses('teal');
              const isSelected = row.appointment.id === selectedApptId;
              return (
                <button
                  key={row.appointment.id}
                  onClick={() => setSelectedApptId(row.appointment.id)}
                  className={`w-full rounded-2xl p-5 text-left border-2 transition-all ${
                    isSelected
                      ? 'border-primary-400 bg-primary-50 shadow-soft'
                      : 'border-ink-100 bg-white hover:border-primary-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {row.doctor && (
                      <img src={row.doctor.photo_url} alt={row.doctor.name} className="h-12 w-12 rounded-xl object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-ink-900 text-sm truncate">{row.doctor?.name}</p>
                      <p className="text-xs text-ink-500">{row.appointment.time_slot} · {row.appointment.appointment_date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-xl font-extrabold text-primary-600">#{row.position}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Clock size={13} className="text-amber-500" />
                      <span className="font-semibold text-ink-600">~{row.estWait} min wait</span>
                    </div>
                    {dept && (
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${rowColors.soft}`}>
                        {dept.name}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}

            {/* Info card */}
            <div className="rounded-2xl border border-secondary-200 bg-secondary-50 p-5">
              <div className="flex items-start gap-3">
                <TrendingDown size={20} className="text-secondary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-ink-900 text-sm">Live updates</p>
                  <p className="text-xs text-ink-600 mt-1">
                    Queue positions update in real-time. We'll notify you when it's almost your turn.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('doctors')}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-5 py-3 text-sm font-bold text-ink-700 hover:border-primary-300 transition-colors"
            >
              <Stethoscope size={16} /> Book Another
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
