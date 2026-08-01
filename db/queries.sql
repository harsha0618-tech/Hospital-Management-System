-- Subquery: patients with an unpaid bill above average
SELECT patient_id, full_name FROM patients
WHERE patient_id IN (
  SELECT v.patient_id FROM visits v
  JOIN billing b ON b.visit_id = v.visit_id
  WHERE b.payment_status = 'Pending'
  AND b.total_amount > (SELECT AVG(total_amount) FROM billing)
);

-- Aggregate + HAVING: doctors who treated more than 2 patients
SELECT d.full_name, COUNT(v.visit_id) AS patient_count
FROM doctors d JOIN visits v ON v.doctor_id = d.doctor_id
GROUP BY d.full_name HAVING COUNT(v.visit_id) > 2;

-- Multi-table JOIN via the view
SELECT * FROM patient_full_summary WHERE status = 'Admitted';

-- Window function: rank doctors by revenue
SELECT d.full_name, SUM(b.total_amount) AS revenue,
       RANK() OVER (ORDER BY SUM(b.total_amount) DESC) AS rank
FROM doctors d
JOIN visits v ON v.doctor_id = d.doctor_id
JOIN billing b ON b.visit_id = v.visit_id
GROUP BY d.full_name;