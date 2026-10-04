export type Department = {
  id: string;
  name: string;
  description: string;
  floor: string;
  wing: string;
  icon_name: string;
  color: string;
};

export type Doctor = {
  id: string;
  name: string;
  specialization: string;
  department_id: string;
  photo_url: string;
  experience_years: number;
  rating: number;
  consultation_fee: number;
  bio: string;
  next_available: string;
};

export type Appointment = {
  id: string;
  patient_name: string;
  patient_age: number;
  patient_phone: string;
  doctor_id: string;
  department_id: string;
  appointment_date: string;
  time_slot: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  queue_number: number;
  prep_notes: string;
  created_at: string;
};

export type QueueEntry = {
  id: string;
  doctor_id: string;
  appointment_id: string;
  queue_position: number;
  status: 'waiting' | 'in_consult' | 'done';
  estimated_wait_minutes: number;
  created_at: string;
};

export type Page =
  | 'home'
  | 'doctors'
  | 'departments'
  | 'appointments'
  | 'queue'
  | 'booking';

export type TimeSlot = {
  time: string;
  available: boolean;
};
