import { useEffect, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Calendar, Clock, User, Phone, Shield,
  CheckCircle2, MapPin, Star, Info, Loader2, Stethoscope, Users,
} from 'lucide-react';
import type { Page, Doctor, Department, Appointment, TimeSlot } from '@/types';
import { fetchDoctor, fetchDepartments, createAppointment } from '@/lib/api';
import { getDepartmentIcon, getColorClasses } from '@/lib/departmentIcons';
import { StarRating, formatFee } from '@/lib/ui';

type Props = {
  doctorId: string | null;
  onNavigate: (page: Page, doctorId?: string) => void;
};

function generateSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const morning = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
  const afternoon = ['01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30'];
  const evening = ['05:00', '05:30', '06:00', '06:30'];
  const all = [...morning, ...afternoon, ...evening];
  // Randomly mark some as unavailable
  all.forEach((t, i) => {
    slots.push({ time: t, available: i % 5 !== 0 && i % 7 !== 0 });
  });
  return slots;
}

function getNext7Days(): { date: string; label: string; day: string; dateNum: string; isToday: boolean }[] {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const day = d.toLocaleDateString('en-US', { weekday: 'long' });
    const dateNum = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    days.push({ date: dateStr, label, day, dateNum, isToday: i === 0 });
  }
  return days;
}

export default function BookingPage({ doctorId, onNavigate }: Props) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState(getNext7Days()[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [form, setForm] = useState({ patient_name: '', patient_age: '', patient_phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [confirmedAppt, setConfirmedAppt] = useState<Appointment | null>(null);

  useEffect(() => {
    (async () => {
      if (!doctorId) {
        onNavigate('doctors');
        return;
      }
      try {
        const [doc, depts] = await Promise.all([fetchDoctor(doctorId), fetchDepartments()]);
        setDoctor(doc);
        setDepartments(depts);
        setSlots(generateSlots());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [doctorId, onNavigate]);

  function handleDateChange(date: typeof selectedDate) {
    setSelectedDate(date);
    setSelectedSlot(null);
    setSlots(generateSlots());
  }

  async function handleBooking() {
    if (!doctor || !selectedSlot) return;
    setSubmitting(true);
    try {
      const dept = departments.find((d) => d.id === doctor.department_id);
      const queueCount = Math.floor(Math.random() * 8) + 2;
      const appt = await createAppointment({
        patient_name: form.patient_name,
        patient_age: parseInt(form.patient_age) || 0,
        patient_phone: form.patient_phone,
        doctor_id: doctor.id,
        department_id: doctor.department_id,
        appointment_date: selectedDate.date,
        time_slot: selectedSlot,
        status: 'confirmed',
        queue_number: queueCount,
        prep_notes: dept?.name === 'Cardiology'
          ? 'Avoid caffeine for 4 hours before your appointment. Bring any previous ECG reports.'
          : dept?.name === 'Pediatrics'
          ? 'Bring your child\'s vaccination records and previous prescriptions.'
          : 'Bring any previous medical reports, scan images, and a list of current medications.',
      });
      setConfirmedAppt(appt);
      setStep(3);
    } catch (e) {
      console.error(e);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="py-32 text-center">
        <p className="text-ink-500">Doctor not found.</p>
        <button onClick={() => onNavigate('doctors')} className="mt-4 text-primary-600 font-semibold">
          Back to doctors
        </button>
      </div>
    );
  }

  const dept = departments.find((d) => d.id === doctor.department_id);
  const colors = dept ? getColorClasses(dept.color) : getColorClasses('teal');
  const Icon = dept ? getDepartmentIcon(dept.icon_name) : Stethoscope;
  const days = getNext7Days();

  // Confirmation screen
  if (step === 3 && confirmedAppt) {
    return (
      <div className="animate-fade-in py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          {/* Success animation */}
          <div className="text-center mb-8">
            <div className="relative inline-flex">
              <div className="absolute inset-0 rounded-full bg-secondary-400 animate-pulse-ring" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full gradient-emerald text-white shadow-glow">
                <CheckCircle2 size={40} />
              </div>
            </div>
            <h1 className="mt-6 font-display text-3xl font-extrabold text-ink-900">
              Appointment Confirmed!
            </h1>
            <p className="mt-2 text-ink-500">
              Your appointment has been booked successfully. We'll send a reminder before your visit.
            </p>
          </div>

          {/* Appointment details card */}
          <div className="rounded-2xl bg-white shadow-card border border-ink-100 overflow-hidden">
            <div className={`bg-gradient-to-r ${colors.gradient} p-6 text-white`}>
              <div className="flex items-center gap-4">
                <img src={doctor.photo_url} alt={doctor.name} className="h-16 w-16 rounded-xl object-cover ring-2 ring-white/30" />
                <div>
                  <h2 className="font-display text-xl font-bold">{doctor.name}</h2>
                  <p className="text-sm text-white/80">{doctor.specialization}</p>
                  {dept && <p className="text-xs text-white/70 mt-0.5">{dept.name}</p>}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-ink-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-ink-400 uppercase tracking-wider">
                    <Calendar size={14} /> Date
                  </div>
                  <p className="mt-1.5 font-bold text-ink-900">{selectedDate.label}, {selectedDate.dateNum}</p>
                </div>
                <div className="rounded-xl bg-ink-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-ink-400 uppercase tracking-wider">
                    <Clock size={14} /> Time
                  </div>
                  <p className="mt-1.5 font-bold text-ink-900">{confirmedAppt.time_slot}</p>
                </div>
                <div className="rounded-xl bg-ink-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-ink-400 uppercase tracking-wider">
                    <User size={14} /> Patient
                  </div>
                  <p className="mt-1.5 font-bold text-ink-900">{confirmedAppt.patient_name}</p>
                </div>
                <div className="rounded-xl bg-primary-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary-600 uppercase tracking-wider">
                    <Users size={14} /> Queue No.
                  </div>
                  <p className="mt-1.5 font-display text-2xl font-extrabold text-primary-700">
                    #{confirmedAppt.queue_number}
                  </p>
                </div>
              </div>

              {/* Location */}
              {dept && (
                <div className="rounded-xl border border-primary-100 bg-primary-50 p-4">
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="text-primary-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-ink-900">Location</p>
                      <p className="text-sm text-ink-600">{dept.floor}, {dept.wing} — {dept.name} Department</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Prep notes */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <Info size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-ink-900">Before your visit</p>
                    <p className="text-sm text-ink-600 mt-1">{confirmedAppt.prep_notes}</p>
                  </div>
                </div>
              </div>

              {/* Fee */}
              <div className="flex items-center justify-between border-t border-ink-100 pt-4">
                <span className="text-ink-500">Consultation Fee</span>
                <span className="font-display text-xl font-bold text-ink-900">{formatFee(doctor.consultation_fee)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate('queue')}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl gradient-primary px-6 py-3.5 font-bold text-white shadow-glow transition-transform hover:scale-105 active:scale-95"
            >
              <Users size={18} />
              Track Live Queue
            </button>
            <button
              onClick={() => onNavigate('appointments')}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-6 py-3.5 font-bold text-ink-700 hover:border-primary-300 transition-colors"
            >
              <Calendar size={18} />
              My Appointments
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Booking flow (steps 1 & 2)
  return (
    <div className="animate-fade-in">
      {/* Doctor header */}
      <div className="bg-white border-b border-ink-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => onNavigate('doctors')}
            className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 mb-6"
          >
            <ArrowLeft size={16} /> Back to doctors
          </button>

          <div className="flex flex-col sm:flex-row items-start gap-6">
            <img
              src={doctor.photo_url}
              alt={doctor.name}
              className="h-24 w-24 rounded-2xl object-cover ring-2 ring-ink-100"
            />
            <div className="flex-1">
              <h1 className="font-display text-3xl font-extrabold text-ink-900">{doctor.name}</h1>
              <p className="text-lg text-ink-500 mt-1">{doctor.specialization}</p>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <StarRating rating={doctor.rating} size={16} />
                <span className="text-sm text-ink-500">{doctor.experience_years} years experience</span>
                {dept && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${colors.soft}`}>
                    <Icon size={14} />
                    {dept.name}
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm text-ink-500 max-w-2xl leading-relaxed">{doctor.bio}</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-ink-400">Consultation Fee</p>
              <p className="font-display text-2xl font-extrabold text-ink-900">{formatFee(doctor.consultation_fee)}</p>
              <p className="mt-2 text-xs text-secondary-600 font-semibold">{doctor.next_available}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          {/* Left: booking steps */}
          <div>
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8">
              {[
                { num: 1, label: 'Select Date & Time' },
                { num: 2, label: 'Patient Details' },
              ].map((s, i) => (
                <div key={s.num} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                    step >= s.num ? 'gradient-primary text-white shadow-soft' : 'bg-white text-ink-400 border border-ink-200'
                  }`}>
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      step >= s.num ? 'bg-white/20 text-white' : 'bg-ink-100 text-ink-400'
                    }`}>
                      {step > s.num ? <CheckCircle2 size={14} /> : s.num}
                    </span>
                    {s.label}
                  </div>
                  {i === 0 && <div className={`h-0.5 w-8 ${step > 1 ? 'bg-primary-500' : 'bg-ink-200'}`} />}
                </div>
              ))}
            </div>

            {/* Step 1: Date & Time */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in-up">
                {/* Date selection */}
                <div className="rounded-2xl bg-white p-6 shadow-card border border-ink-100">
                  <h3 className="font-display text-lg font-bold text-ink-900 mb-4">Choose a Date</h3>
                  <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                    {days.map((d) => (
                      <button
                        key={d.date}
                        onClick={() => handleDateChange(d)}
                        className={`flex flex-col items-center justify-center rounded-xl px-4 py-3 min-w-[80px] transition-all border-2 ${
                          selectedDate.date === d.date
                            ? 'gradient-primary text-white border-transparent shadow-soft'
                            : 'bg-white text-ink-600 border-ink-200 hover:border-primary-300'
                        }`}
                      >
                        <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{d.label}</span>
                        <span className="mt-1 font-display text-lg font-bold">{d.dateNum}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time slots */}
                <div className="rounded-2xl bg-white p-6 shadow-card border border-ink-100">
                  <h3 className="font-display text-lg font-bold text-ink-900 mb-1">Choose a Time Slot</h3>
                  <p className="text-sm text-ink-400 mb-4">{selectedDate.day}, {selectedDate.dateNum}</p>

                  {/* Morning */}
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-ink-600">
                      <span className="text-amber-500">☀</span> Morning
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {slots.filter(s => parseInt(s.time) < 12).map((s) => (
                        <button
                          key={s.time}
                          disabled={!s.available}
                          onClick={() => setSelectedSlot(s.time)}
                          className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${
                            !s.available
                              ? 'bg-ink-50 text-ink-300 cursor-not-allowed line-through'
                              : selectedSlot === s.time
                              ? 'gradient-primary text-white shadow-soft'
                              : 'bg-ink-50 text-ink-700 hover:bg-primary-50 hover:text-primary-700'
                          }`}
                        >
                          {s.time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Afternoon */}
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-ink-600">
                      <span className="text-orange-500">☀</span> Afternoon
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {slots.filter(s => parseInt(s.time) >= 12 && parseInt(s.time) < 17).map((s) => (
                        <button
                          key={s.time}
                          disabled={!s.available}
                          onClick={() => setSelectedSlot(s.time)}
                          className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${
                            !s.available
                              ? 'bg-ink-50 text-ink-300 cursor-not-allowed line-through'
                              : selectedSlot === s.time
                              ? 'gradient-primary text-white shadow-soft'
                              : 'bg-ink-50 text-ink-700 hover:bg-primary-50 hover:text-primary-700'
                          }`}
                        >
                          {s.time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Evening */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-ink-600">
                      <span className="text-violet-500">☾</span> Evening
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {slots.filter(s => parseInt(s.time) >= 17).map((s) => (
                        <button
                          key={s.time}
                          disabled={!s.available}
                          onClick={() => setSelectedSlot(s.time)}
                          className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${
                            !s.available
                              ? 'bg-ink-50 text-ink-300 cursor-not-allowed line-through'
                              : selectedSlot === s.time
                              ? 'gradient-primary text-white shadow-soft'
                              : 'bg-ink-50 text-ink-700 hover:bg-primary-50 hover:text-primary-700'
                          }`}
                        >
                          {s.time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  disabled={!selectedSlot}
                  onClick={() => setStep(2)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl gradient-primary px-6 py-3.5 font-bold text-white shadow-glow transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                >
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            )}

            {/* Step 2: Patient details */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="rounded-2xl bg-white p-6 shadow-card border border-ink-100">
                  <h3 className="font-display text-lg font-bold text-ink-900 mb-4">Patient Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-ink-600 mb-1.5">Full Name</label>
                      <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                        <input
                          type="text"
                          value={form.patient_name}
                          onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
                          placeholder="Enter patient's full name"
                          className="w-full rounded-xl border border-ink-200 bg-ink-50 pl-12 pr-4 py-3 text-sm font-medium text-ink-800 placeholder:text-ink-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 transition-all outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-ink-600 mb-1.5">Age</label>
                        <input
                          type="number"
                          value={form.patient_age}
                          onChange={(e) => setForm({ ...form, patient_age: e.target.value })}
                          placeholder="e.g. 35"
                          className="w-full rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm font-medium text-ink-800 placeholder:text-ink-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-ink-600 mb-1.5">Phone Number</label>
                        <div className="relative">
                          <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                          <input
                            type="tel"
                            value={form.patient_phone}
                            onChange={(e) => setForm({ ...form, patient_phone: e.target.value })}
                            placeholder="e.g. 98765 43210"
                            className="w-full rounded-xl border border-ink-200 bg-ink-50 pl-12 pr-4 py-3 text-sm font-medium text-ink-800 placeholder:text-ink-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 transition-all outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prep info */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                  <div className="flex items-start gap-3">
                    <Shield size={22} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-display font-bold text-ink-900">Preparation Guidelines</h4>
                      <p className="text-sm text-ink-600 mt-1 leading-relaxed">
                        {dept?.name === 'Cardiology'
                          ? 'Avoid caffeine for 4 hours before your appointment. Bring any previous ECG reports.'
                          : dept?.name === 'Pediatrics'
                          ? 'Bring your child\'s vaccination records and previous prescriptions.'
                          : 'Bring any previous medical reports, scan images, and a list of current medications.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-6 py-3.5 font-bold text-ink-700 hover:border-primary-300 transition-colors"
                  >
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button
                    disabled={!form.patient_name || !form.patient_phone || submitting}
                    onClick={handleBooking}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl gradient-primary px-6 py-3.5 font-bold text-white shadow-glow transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                  >
                    {submitting ? (
                      <><Loader2 size={18} className="animate-spin" /> Confirming...</>
                    ) : (
                      <><CheckCircle2 size={18} /> Confirm Booking</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-2xl bg-white p-6 shadow-card border border-ink-100">
              <h3 className="font-display text-lg font-bold text-ink-900 mb-4">Booking Summary</h3>
              <div className="flex items-center gap-3 pb-4 border-b border-ink-100">
                <img src={doctor.photo_url} alt={doctor.name} className="h-14 w-14 rounded-xl object-cover" />
                <div>
                  <p className="font-bold text-ink-900">{doctor.name}</p>
                  <p className="text-xs text-ink-500">{doctor.specialization}</p>
                </div>
              </div>
              <div className="space-y-3 py-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-400">Date</span>
                  <span className="font-semibold text-ink-800">{selectedDate.label}, {selectedDate.dateNum}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-400">Time</span>
                  <span className="font-semibold text-ink-800">{selectedSlot ?? 'Not selected'}</span>
                </div>
                {dept && (
                  <div className="flex justify-between">
                    <span className="text-ink-400">Department</span>
                    <span className="font-semibold text-ink-800">{dept.name}</span>
                  </div>
                )}
                {dept && (
                  <div className="flex justify-between">
                    <span className="text-ink-400">Location</span>
                    <span className="font-semibold text-ink-800 text-right">{dept.floor}<br />{dept.wing}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-ink-100 pt-4">
                <span className="text-ink-500">Fee</span>
                <span className="font-display text-xl font-bold text-ink-900">{formatFee(doctor.consultation_fee)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
