CREATE TYPE role_type AS ENUM ('admin','doctor','nurse','receptionist','pharmacist','labtech');
CREATE TYPE visit_status AS ENUM ('Admitted','Discharged');
CREATE TYPE payment_status_type AS ENUM ('Pending','Paid');

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role role_type NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE departments (
  department_id SERIAL PRIMARY KEY,
  department_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE doctors (
  doctor_id SERIAL PRIMARY KEY,
  user_id INT UNIQUE REFERENCES users(user_id) ON DELETE SET NULL,
  full_name VARCHAR(100) NOT NULL,
  department_id INT REFERENCES departments(department_id),
  consultation_fee NUMERIC(10,2) NOT NULL DEFAULT 500
);

CREATE TABLE nurses (
  nurse_id SERIAL PRIMARY KEY,
  user_id INT UNIQUE REFERENCES users(user_id) ON DELETE SET NULL,
  full_name VARCHAR(100) NOT NULL
);

CREATE TABLE patients (
  patient_id VARCHAR(10) PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  age INT CHECK (age > 0 AND age < 130),
  gender VARCHAR(10) CHECK (gender IN ('Male','Female','Other')),
  phone VARCHAR(15),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE patient_id_counters (
  year_code VARCHAR(2) PRIMARY KEY,
  last_number INT NOT NULL DEFAULT 0
);

CREATE TABLE visits (
  visit_id SERIAL PRIMARY KEY,
  patient_id VARCHAR(10) REFERENCES patients(patient_id) ON DELETE CASCADE,
  doctor_id INT REFERENCES doctors(doctor_id),
  nurse_id INT REFERENCES nurses(nurse_id),
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status visit_status NOT NULL DEFAULT 'Admitted',
  diagnosis TEXT,
  queue_number INT
);

CREATE TABLE queue_counters (
  visit_date DATE PRIMARY KEY,
  last_number INT NOT NULL DEFAULT 0
);

CREATE TABLE tests (
  test_id SERIAL PRIMARY KEY,
  test_name VARCHAR(100) UNIQUE NOT NULL,
  base_cost NUMERIC(10,2) NOT NULL
);

CREATE TABLE visit_tests (
  visit_id INT REFERENCES visits(visit_id) ON DELETE CASCADE,
  test_id INT REFERENCES tests(test_id),
  PRIMARY KEY (visit_id, test_id)
);

CREATE TABLE lab_reports (
  report_id SERIAL PRIMARY KEY,
  visit_id INT REFERENCES visits(visit_id) ON DELETE CASCADE,
  test_id INT REFERENCES tests(test_id),
  report_text TEXT,
  cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE medicines (
  medicine_id SERIAL PRIMARY KEY,
  medicine_name VARCHAR(100) UNIQUE NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  stock_qty INT NOT NULL DEFAULT 100 CHECK (stock_qty >= 0)
);

CREATE TABLE prescriptions (
  prescription_id SERIAL PRIMARY KEY,
  visit_id INT REFERENCES visits(visit_id) ON DELETE CASCADE,
  medicine_id INT REFERENCES medicines(medicine_id),
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  dispensed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE billing (
  bill_id SERIAL PRIMARY KEY,
  visit_id INT UNIQUE REFERENCES visits(visit_id) ON DELETE CASCADE,
  consultation_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  lab_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  pharmacy_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) GENERATED ALWAYS AS (consultation_fee + lab_total + pharmacy_total) STORED,
  payment_status payment_status_type NOT NULL DEFAULT 'Pending',
  generated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_visits_patient ON visits(patient_id);
CREATE INDEX idx_visits_doctor ON visits(doctor_id);
CREATE INDEX idx_prescriptions_visit ON prescriptions(visit_id);
CREATE INDEX idx_labreports_visit ON lab_reports(visit_id);
CREATE INDEX idx_patients_name ON patients(full_name);