import { useEffect, useState } from 'react';
import {
  Activity, Calendar, Users, Stethoscope, HeartPulse, Shield,
  Clock, MapPin, ArrowRight, Star, CheckCircle2, Phone,
  Navigation, Bell, Sparkles, TrendingUp,
} from 'lucide-react';
import type { Page, Department, Doctor } from '@/types';
import { fetchDepartments, fetchDoctors } from '@/lib/api';
import { getDepartmentIcon, getColorClasses } from '@/lib/departmentIcons';
import { StarRating, formatFee } from '@/lib/ui';

type Props = {
  onNavigate: (page: Page, doctorId?: string) => void;
};

export default function HomePage({ onNavigate }: Props) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [depts, docs] = await Promise.all([fetchDepartments(), fetchDoctors()]);
        setDepartments(depts);
        setDoctors(docs.slice(0, 6));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = [
    { label: 'Expert Doctors', value: '120+', icon: Stethoscope },
    { label: 'Departments', value: '8', icon: HeartPulse },
    { label: 'Patients Served', value: '50k+', icon: Users },
    { label: 'Avg. Wait Time', value: '12 min', icon: Clock },
  ];

  const features = [
    {
      icon: Calendar,
      title: 'Easy Appointment Booking',
      desc: 'Find and book appointments with top specialists in just a few taps.',
      color: 'primary',
    },
    {
      icon: Users,
      title: 'Live Queue Tracking',
      desc: 'See your real-time queue position and estimated wait — no more guessing.',
      color: 'secondary',
    },
    {
      icon: MapPin,
      title: 'Hospital Navigation',
      desc: 'Find your way to any department with clear floor and wing directions.',
      color: 'accent',
    },
    {
      icon: Shield,
      title: 'Preparation Guidance',
      desc: 'Get clear pre-appointment instructions so you arrive ready.',
      color: 'rose',
    },
    {
      icon: Clock,
      title: 'Reschedule Anytime',
      desc: 'Plans changed? Cancel or reschedule your visit in seconds.',
      color: 'teal',
    },
    {
      icon: Bell,
      title: 'Smart Reminders',
      desc: 'Never miss an appointment — we nudge you before your slot arrives.',
      color: 'violet',
    },
  ];

  const colorClassMap: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600',
    secondary: 'bg-secondary-50 text-secondary-600',
    accent: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    teal: 'bg-teal-50 text-teal-600',
    violet: 'bg-violet-50 text-violet-600',
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-secondary-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: copy */}
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-semibold text-primary-700 shadow-soft">
                <Sparkles size={15} />
                Smart Patient Appointment & Queue Management
              </div>
              <h1 className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-ink-900 text-balance">
                Your health journey,{' '}
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  simplified
                </span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-600">
                Find the right doctor, book appointments instantly, track your live queue
                position, and navigate the hospital — all in one place. KshanaCare makes
                healthcare effortless.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => onNavigate('doctors')}
                  className="group flex items-center justify-center gap-2 rounded-xl gradient-primary px-7 py-3.5 text-base font-bold text-white shadow-glow transition-transform hover:scale-105 active:scale-95"
                >
                  Find a Doctor
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => onNavigate('queue')}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-bold text-ink-700 shadow-soft border border-ink-200 transition-all hover:border-primary-300 hover:text-primary-600"
                >
                  <Users size={18} />
                  View Live Queue
                </button>
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
                {['No registration needed', 'Real-time updates', 'Elderly-friendly design'].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-sm text-ink-500">
                    <CheckCircle2 size={16} className="text-secondary-500" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: visual card */}
            <div className="relative animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <div className="relative rounded-3xl bg-white p-6 shadow-card border border-ink-100">
                {/* Next appointment card */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-ink-400 uppercase tracking-wider">Up Next</span>
                  <span className="flex items-center gap-1.5 rounded-full bg-secondary-50 px-3 py-1 text-xs font-bold text-secondary-700">
                    <span className="h-2 w-2 rounded-full bg-secondary-500 animate-pulse" />
                    Live
                  </span>
                </div>

                <div className="rounded-2xl gradient-primary p-5 text-white">
                  <div className="flex items-center gap-4">
                    <img
                      src="https://images.pexels.com/photos/29995629/pexels-photo-29995629.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                      alt="Doctor"
                      className="h-14 w-14 rounded-xl object-cover ring-2 ring-white/30"
                    />
                    <div>
                      <p className="font-bold text-lg">Dr. Priya Sharma</p>
                      <p className="text-sm text-primary-100">Cardiologist</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={15} />
                      Today, 3:00 PM
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={15} />
                      3rd Floor, East Wing
                    </div>
                  </div>
                </div>

                {/* Queue position card */}
                <div className="mt-4 rounded-2xl border border-ink-100 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-ink-400 uppercase tracking-wider">Your Queue</p>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="font-display text-4xl font-extrabold text-primary-600">3</span>
                        <span className="text-sm text-ink-400">of 8</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-ink-400 uppercase tracking-wider">Est. Wait</p>
                      <div className="mt-2 flex items-baseline gap-1">
                        <Clock size={18} className="text-amber-500" />
                        <span className="font-display text-2xl font-bold text-ink-800">~12</span>
                        <span className="text-sm text-ink-400">min</span>
                      </div>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-4 h-2.5 rounded-full bg-ink-100 overflow-hidden">
                    <div className="h-full w-[62%] rounded-full gradient-emerald transition-all" />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-ink-400">
                    <span>Checked in</span>
                    <span>2 ahead of you</span>
                    <span>Your turn</span>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 rounded-2xl bg-white px-4 py-3 shadow-card border border-ink-100 animate-float">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary-50">
                    <TrendingUp size={18} className="text-secondary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-ink-400">Wait reduced</p>
                    <p className="text-sm font-bold text-ink-800">40% faster</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-12 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl bg-white p-6 shadow-card border border-ink-100 transition-transform hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <s.icon size={22} />
                </div>
                <p className="mt-4 font-display text-3xl font-extrabold text-ink-900">{s.value}</p>
                <p className="text-sm text-ink-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-sm font-bold text-primary-600 uppercase tracking-wider">Explore</span>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold text-ink-900">
                Hospital Departments
              </h2>
              <p className="mt-3 text-ink-500 max-w-xl">
                Browse our specialist departments and find exactly the care you need with
                floor and wing navigation.
              </p>
            </div>
            <button
              onClick={() => onNavigate('departments')}
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              View all <ArrowRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-36 rounded-2xl bg-ink-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {departments.map((dept) => {
                const Icon = getDepartmentIcon(dept.icon_name);
                const colors = getColorClasses(dept.color);
                return (
                  <button
                    key={dept.id}
                    onClick={() => onNavigate('doctors')}
                    className="group rounded-2xl bg-white p-6 shadow-card border border-ink-100 text-left transition-all hover:-translate-y-1 hover:shadow-glow"
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colors.gradient} text-white shadow-soft`}>
                      <Icon size={22} />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-bold text-ink-900 group-hover:text-primary-600 transition-colors">
                      {dept.name}
                    </h3>
                    <p className="mt-1 text-xs text-ink-400 line-clamp-2">{dept.description}</p>
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-ink-500">
                      <MapPin size={13} />
                      {dept.floor}, {dept.wing}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-sm font-bold text-primary-600 uppercase tracking-wider">Top Rated</span>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold text-ink-900">
                Featured Specialists
              </h2>
              <p className="mt-3 text-ink-500 max-w-xl">
                Trusted doctors loved by thousands of patients across the region.
              </p>
            </div>
            <button
              onClick={() => onNavigate('doctors')}
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              View all <ArrowRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 rounded-2xl bg-ink-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doc) => {
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
                        <h3 className="font-display text-lg font-bold text-ink-900 group-hover:text-primary-600 transition-colors truncate">
                          {doc.name}
                        </h3>
                        <p className="text-sm text-ink-500">{doc.specialization}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <StarRating rating={doc.rating} />
                          <span className="text-xs text-ink-400">{doc.experience_years} yrs exp</span>
                        </div>
                      </div>
                    </div>
                    {dept && (
                      <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold">
                        <span className={`px-2.5 py-1 rounded-lg ${colors.soft}`}>
                          {dept.name}
                        </span>
                      </div>
                    )}
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
      </section>

      {/* How it works */}
      <section className="py-20 bg-ink-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-sm font-bold text-primary-600 uppercase tracking-wider">Simple Process</span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold text-ink-900">
              How KshanaCare Works
            </h2>
            <p className="mt-3 text-ink-500 max-w-xl mx-auto">
              From discovery to consultation — four simple steps to better healthcare.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Stethoscope, step: '01', title: 'Find Your Doctor', desc: 'Search by department, specialization, or availability.' },
              { icon: Calendar, step: '02', title: 'Book a Slot', desc: 'Pick a time that works for you and confirm instantly.' },
              { icon: Users, step: '03', title: 'Track Your Queue', desc: 'Watch your live position and estimated wait time.' },
              { icon: CheckCircle2, step: '04', title: 'Get Consulted', desc: 'Arrive prepared and see your doctor on time.' },
            ].map((s, i) => (
              <div key={s.step} className="relative">
                <div className="rounded-2xl bg-white p-6 shadow-card border border-ink-100 h-full">
                  <span className="font-display text-4xl font-extrabold text-primary-100">{s.step}</span>
                  <div className="mt-3 flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-white shadow-soft">
                    <s.icon size={22} />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-ink-900">{s.title}</h3>
                  <p className="mt-2 text-sm text-ink-500 leading-relaxed">{s.desc}</p>
                </div>
                {i < 3 && (
                  <ArrowRight className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 text-ink-300" size={24} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-sm font-bold text-primary-600 uppercase tracking-wider">Why KshanaCare</span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold text-ink-900">
              Everything you need for a smooth visit
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl bg-gradient-card p-6 shadow-card border border-ink-100 transition-all hover:-translate-y-1 hover:shadow-glow"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClassMap[f.color]}`}>
                  <f.icon size={22} />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-ink-900">{f.title}</h3>
                <p className="mt-2 text-sm text-ink-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl gradient-primary px-8 py-16 sm:px-16 sm:py-20 text-center">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-secondary-300/20 blur-3xl" />
            <div className="relative">
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white text-balance">
                Ready to take control of your healthcare?
              </h2>
              <p className="mt-4 text-lg text-primary-100 max-w-xl mx-auto">
                Book your appointment today and experience hassle-free healthcare with KshanaCare.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => onNavigate('doctors')}
                  className="group flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-bold text-primary-700 shadow-soft transition-transform hover:scale-105 active:scale-95"
                >
                  Book Appointment
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => onNavigate('departments')}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/15 backdrop-blur px-7 py-3.5 text-base font-bold text-white border border-white/30 transition-all hover:bg-white/25"
                >
                  <Navigation size={18} />
                  Explore Departments
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency banner */}
      <section className="pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-rose text-white">
                <Phone size={22} />
              </div>
              <div>
                <p className="font-display font-bold text-ink-900">Emergency Helpline 24/7</p>
                <p className="text-sm text-ink-500">Immediate medical assistance when you need it most</p>
              </div>
            </div>
            <a
              href="tel:18002004000"
              className="flex items-center gap-2 rounded-xl gradient-rose px-6 py-3 text-base font-bold text-white shadow-soft transition-transform hover:scale-105"
            >
              <Phone size={18} />
              1800-200-4000
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
