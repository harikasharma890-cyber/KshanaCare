import { supabase } from './supabase';
import type { Department, Doctor, Appointment, QueueEntry } from '@/types';

export async function fetchDepartments(): Promise<Department[]> {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function fetchDoctors(departmentId?: string): Promise<Doctor[]> {
  let query = supabase
    .from('doctors')
    .select('*')
    .order('rating', { ascending: false });
  if (departmentId) {
    query = query.eq('department_id', departmentId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchDoctor(id: string): Promise<Doctor | null> {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createAppointment(
  appt: Omit<Appointment, 'id' | 'created_at'>
): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .insert(appt)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAppointmentStatus(
  id: string,
  status: Appointment['status']
): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}

export async function rescheduleAppointment(
  id: string,
  appointment_date: string,
  time_slot: string
): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .update({ appointment_date, time_slot })
    .eq('id', id);
  if (error) throw error;
}

export async function fetchQueueEntries(doctorId?: string): Promise<QueueEntry[]> {
  let query = supabase
    .from('queue_entries')
    .select('*')
    .order('queue_position', { ascending: true });
  if (doctorId) {
    query = query.eq('doctor_id', doctorId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
