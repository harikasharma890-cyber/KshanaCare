/*
# KshanaCare — Departments, Doctors, Appointments & Queue

1. Overview
   Creates the core schema for KshanaCare, a patient appointment and queue management app.
   This is a single-tenant demo (no auth/login), so policies allow anon+authenticated CRUD.

2. New Tables
   - departments: hospital departments (Cardiology, Orthopedics, etc.)
     id, name, description, floor, wing, icon_name (lucide icon), color, created_at
   - doctors: doctors belonging to a department
     id, name, specialization, department_id (FK), photo_url, experience_years,
     rating, consultation_fee, bio, next_available, created_at
   - appointments: a booked appointment
     id, patient_name, patient_age, patient_phone, doctor_id (FK), department_id (FK),
     appointment_date, time_slot, status (pending/confirmed/completed/cancelled),
     queue_number, prep_notes, created_at
   - queue_entries: live queue tracking for a doctor on a given date
     id, doctor_id (FK), appointment_id (FK), queue_position, status (waiting/in_consult/done),
     estimated_wait_minutes, created_at

3. Security
   - RLS enabled on all tables.
   - All tables use TO anon, authenticated with permissive policies (single-tenant demo).
*/

CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  floor text NOT NULL DEFAULT '',
  wing text NOT NULL DEFAULT '',
  icon_name text NOT NULL DEFAULT 'HeartPulse',
  color text NOT NULL DEFAULT 'teal',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_departments" ON departments;
CREATE POLICY "anon_select_departments" ON departments FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_departments" ON departments;
CREATE POLICY "anon_insert_departments" ON departments FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_departments" ON departments;
CREATE POLICY "anon_update_departments" ON departments FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_departments" ON departments;
CREATE POLICY "anon_delete_departments" ON departments FOR DELETE
TO anon, authenticated USING (true);


CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialization text NOT NULL DEFAULT '',
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  photo_url text NOT NULL DEFAULT '',
  experience_years int NOT NULL DEFAULT 0,
  rating numeric(2,1) NOT NULL DEFAULT 4.8,
  consultation_fee int NOT NULL DEFAULT 0,
  bio text NOT NULL DEFAULT '',
  next_available text NOT NULL DEFAULT 'Today',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_doctors" ON doctors;
CREATE POLICY "anon_select_doctors" ON doctors FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_doctors" ON doctors;
CREATE POLICY "anon_insert_doctors" ON doctors FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_doctors" ON doctors;
CREATE POLICY "anon_update_doctors" ON doctors FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_doctors" ON doctors;
CREATE POLICY "anon_delete_doctors" ON doctors FOR DELETE
TO anon, authenticated USING (true);


CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  patient_age int NOT NULL DEFAULT 0,
  patient_phone text NOT NULL DEFAULT '',
  doctor_id uuid REFERENCES doctors(id) ON DELETE SET NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  appointment_date date NOT NULL DEFAULT CURRENT_DATE,
  time_slot text NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  queue_number int NOT NULL DEFAULT 0,
  prep_notes text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_appointments" ON appointments;
CREATE POLICY "anon_select_appointments" ON appointments FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_appointments" ON appointments;
CREATE POLICY "anon_insert_appointments" ON appointments FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_appointments" ON appointments;
CREATE POLICY "anon_update_appointments" ON appointments FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_appointments" ON appointments;
CREATE POLICY "anon_delete_appointments" ON appointments FOR DELETE
TO anon, authenticated USING (true);


CREATE TABLE IF NOT EXISTS queue_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES doctors(id) ON DELETE SET NULL,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  queue_position int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'waiting',
  estimated_wait_minutes int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_queue" ON queue_entries;
CREATE POLICY "anon_select_queue" ON queue_entries FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_queue" ON queue_entries;
CREATE POLICY "anon_insert_queue" ON queue_entries FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_queue" ON queue_entries;
CREATE POLICY "anon_update_queue" ON queue_entries FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_queue" ON queue_entries;
CREATE POLICY "anon_delete_queue" ON queue_entries FOR DELETE
TO anon, authenticated USING (true);
