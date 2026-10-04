import { useState, useEffect } from 'react';
import { Activity, Calendar, Users, LayoutGrid, Stethoscope, Menu, X } from 'lucide-react';
import type { Page } from '@/types';
import HomePage from '@/pages/HomePage';
import DoctorsPage from '@/pages/DoctorsPage';
import DepartmentsPage from '@/pages/DepartmentsPage';
import AppointmentsPage from '@/pages/AppointmentsPage';
import QueuePage from '@/pages/QueuePage';
import BookingPage from '@/pages/BookingPage';

const navItems: { page: Page; label: string; icon: typeof Activity }[] = [
  { page: 'home', label: 'Home', icon: Activity },
  { page: 'doctors', label: 'Find Doctors', icon: Stethoscope },
  { page: 'departments', label: 'Departments', icon: LayoutGrid },
  { page: 'appointments', label: 'My Appointments', icon: Calendar },
  { page: 'queue', label: 'Live Queue', icon: Users },
];

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [bookingDoctorId, setBookingDoctorId] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function navigate(p: Page, doctorId?: string) {
    if (doctorId) setBookingDoctorId(doctorId);
    setPage(p);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass shadow-soft' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <button onClick={() => navigate('home')} className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow transition-transform group-hover:scale-105">
                <Activity className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <span className="font-display text-xl font-extrabold text-ink-900">
                  Kshana<span className="text-primary-600">Care</span>
                </span>
                <p className="text-[10px] font-medium uppercase tracking-wider text-ink-400 -mt-0.5">
                  Smart Healthcare
                </p>
              </div>
            </button>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => navigate(item.page)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                    page === item.page
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-ink-500 hover:text-ink-800 hover:bg-ink-100'
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* CTA + mobile toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('doctors')}
                className="hidden sm:flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105 active:scale-95"
              >
                <Calendar size={16} />
                Book Now
              </button>
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-ink-100 text-ink-600"
              >
                {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileNavOpen && (
          <div className="lg:hidden border-t border-ink-200 bg-white animate-fade-in">
            <nav className="mx-auto max-w-7xl px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => navigate(item.page)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                    page === item.page
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-ink-600 hover:bg-ink-100'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => navigate('doctors')}
                className="flex w-full items-center justify-center gap-2 rounded-xl gradient-primary px-5 py-3 text-sm font-semibold text-white shadow-glow mt-2"
              >
                <Calendar size={16} />
                Book Appointment
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Page content */}
      <main>
        {page === 'home' && <HomePage onNavigate={navigate} />}
        {page === 'doctors' && <DoctorsPage onNavigate={navigate} />}
        {page === 'departments' && <DepartmentsPage onNavigate={navigate} />}
        {page === 'appointments' && <AppointmentsPage onNavigate={navigate} />}
        {page === 'queue' && <QueuePage onNavigate={navigate} />}
        {page === 'booking' && (
          <BookingPage doctorId={bookingDoctorId} onNavigate={navigate} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-ink-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                  <Activity className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
                <span className="font-display text-xl font-extrabold text-ink-900">
                  Kshana<span className="text-primary-600">Care</span>
                </span>
              </div>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-500">
                KshanaCare simplifies the patient journey — from finding the right doctor to
                tracking your live queue position. Less waiting, better care.
              </p>
            </div>
            <div>
              <h4 className="font-display text-sm font-bold text-ink-900">Quick Links</h4>
              <ul className="mt-3 space-y-2">
                {navItems.map((item) => (
                  <li key={item.page}>
                    <button
                      onClick={() => navigate(item.page)}
                      className="text-sm text-ink-500 hover:text-primary-600 transition-colors"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-display text-sm font-bold text-ink-900">Contact</h4>
              <ul className="mt-3 space-y-2 text-sm text-ink-500">
                <li>KshanaCare Multispecialty Hospital</li>
                <li>24/7 Helpline: 1800-200-4000</li>
                <li>care@kshanacare.in</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-ink-100 pt-6 text-center text-xs text-ink-400">
            © 2026 KshanaCare. Built for better healthcare experiences.
          </div>
        </div>
      </footer>
    </div>
  );
}
