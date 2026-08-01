-- Auto-generate patient_id like MCR260001 (replaces your patientIdGenerator.js, now done in DB)
CREATE OR REPLACE FUNCTION generate_patient_id() RETURNS TRIGGER AS $$
DECLARE
  yr VARCHAR(2) := to_char(CURRENT_DATE, 'YY');
  next_num INT;
BEGIN
  INSERT INTO patient_id_counters(year_code, last_number)
  VALUES (yr, 1)
  ON CONFLICT (year_code) DO UPDATE SET last_number = patient_id_counters.last_number + 1
  RETURNING last_number INTO next_num;

  NEW.patient_id := 'MCR' || yr || LPAD(next_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_patient_id
BEFORE INSERT ON patients
FOR EACH ROW WHEN (NEW.patient_id IS NULL)
EXECUTE FUNCTION generate_patient_id();

-- Auto-generate daily queue number (replaces queueCounter.js)
CREATE OR REPLACE FUNCTION generate_queue_number() RETURNS TRIGGER AS $$
DECLARE next_num INT;
BEGIN
  INSERT INTO queue_counters(visit_date, last_number)
  VALUES (NEW.visit_date, 1)
  ON CONFLICT (visit_date) DO UPDATE SET last_number = queue_counters.last_number + 1
  RETURNING last_number INTO next_num;
  NEW.queue_number := next_num;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_queue_number
BEFORE INSERT ON visits
FOR EACH ROW EXECUTE FUNCTION generate_queue_number();

-- Auto reduce medicine stock the moment a prescription is created
CREATE OR REPLACE FUNCTION reduce_stock() RETURNS TRIGGER AS $$
BEGIN
  UPDATE medicines SET stock_qty = stock_qty - NEW.quantity WHERE medicine_id = NEW.medicine_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reduce_stock
AFTER INSERT ON prescriptions
FOR EACH ROW EXECUTE FUNCTION reduce_stock();

-- VIEW: flattened patient record (recreates what your UI needs, via JOINs)
CREATE VIEW patient_full_summary AS
SELECT
  p.patient_id, p.full_name, p.age, p.gender,
  v.visit_id, v.visit_date, v.status, v.diagnosis,
  d.full_name AS doctor_name, dep.department_name,
  n.full_name AS nurse_name,
  b.consultation_fee, b.lab_total, b.pharmacy_total, b.total_amount, b.payment_status
FROM patients p
JOIN visits v ON v.patient_id = p.patient_id
LEFT JOIN doctors d ON v.doctor_id = d.doctor_id
LEFT JOIN departments dep ON d.department_id = dep.department_id
LEFT JOIN nurses n ON v.nurse_id = n.nurse_id
LEFT JOIN billing b ON b.visit_id = v.visit_id;

-- VIEW: revenue per department (for Admin dashboard)
CREATE VIEW revenue_by_department AS
SELECT dep.department_name, SUM(b.total_amount) AS total_revenue, COUNT(v.visit_id) AS visit_count
FROM visits v
JOIN doctors d ON v.doctor_id = d.doctor_id
JOIN departments dep ON d.department_id = dep.department_id
JOIN billing b ON b.visit_id = v.visit_id
GROUP BY dep.department_name
ORDER BY total_revenue DESC;

-- VIEW: low stock alert (for Pharmacy dashboard)
CREATE VIEW low_stock_medicines AS
SELECT medicine_id, medicine_name, stock_qty FROM medicines WHERE stock_qty < 20;

-- FUNCTION: discharge a patient
CREATE OR REPLACE FUNCTION discharge_patient(p_visit_id INT) RETURNS VOID AS $$
BEGIN
  UPDATE visits SET status = 'Discharged' WHERE visit_id = p_visit_id;
END;
$$ LANGUAGE plpgsql;

-- PROCEDURE: compute and store the final bill for a visit
CREATE OR REPLACE PROCEDURE finalize_billing(p_visit_id INT) AS $$
DECLARE
  v_consult NUMERIC(10,2);
  v_lab NUMERIC(10,2);
  v_pharma NUMERIC(10,2);
BEGIN
  SELECT d.consultation_fee INTO v_consult
  FROM visits v JOIN doctors d ON v.doctor_id = d.doctor_id
  WHERE v.visit_id = p_visit_id;

  SELECT COALESCE(SUM(cost),0) INTO v_lab FROM lab_reports WHERE visit_id = p_visit_id;

  SELECT COALESCE(SUM(m.unit_price * pr.quantity),0) INTO v_pharma
  FROM prescriptions pr JOIN medicines m ON pr.medicine_id = m.medicine_id
  WHERE pr.visit_id = p_visit_id;

  INSERT INTO billing(visit_id, consultation_fee, lab_total, pharmacy_total)
  VALUES (p_visit_id, v_consult, v_lab, v_pharma)
  ON CONFLICT (visit_id) DO UPDATE
    SET consultation_fee = EXCLUDED.consultation_fee,
        lab_total = EXCLUDED.lab_total,
        pharmacy_total = EXCLUDED.pharmacy_total;
END;
$$ LANGUAGE plpgsql;