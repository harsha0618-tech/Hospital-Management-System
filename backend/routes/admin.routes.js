import express from "express";
import bcrypt from "bcrypt";
import { pool } from "../db.js";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

// Every route below requires a logged-in Admin
router.use(verifyToken, requireRole("admin"));

router.get("/staff", async (req, res) => {
  try {
    const doctors = await pool.query(`
      SELECT d.doctor_id AS staff_id, 'doctor' AS role, d.full_name, dep.department_name,
             d.consultation_fee, d.joining_date, d.leaving_date, d.salary, d.is_active
      FROM doctors d LEFT JOIN departments dep ON d.department_id = dep.department_id
      ORDER BY d.is_active DESC, d.full_name
    `);
    const nurses = await pool.query(`
      SELECT n.nurse_id AS staff_id, 'nurse' AS role, n.full_name, NULL AS department_name,
             NULL AS consultation_fee, n.joining_date, n.leaving_date, n.salary, n.is_active
      FROM nurses n ORDER BY n.is_active DESC, n.full_name
    `);
    res.json([...doctors.rows, ...nurses.rows]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/departments", async (req, res) => {
  const r = await pool.query("SELECT * FROM departments ORDER BY department_name");
  res.json(r.rows);
});

router.post("/staff", async (req, res) => {
  const { role, full_name, department_id, consultation_fee, joining_date, salary } = req.body;
  if (!["doctor", "nurse"].includes(role)) {
    return res.status(400).json({ error: "role must be 'doctor' or 'nurse'" });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const placeholder = await bcrypt.hash(Math.random().toString(36), 10);
    const username =
      full_name.toLowerCase().replace(/[^a-z]+/g, ".") + "." + Date.now().toString().slice(-4);

    const userResult = await client.query(
      `INSERT INTO users(username, password_hash, role, full_name)
       VALUES ($1,$2,$3,$4) RETURNING user_id`,
      [username, placeholder, role, full_name]
    );
    const user_id = userResult.rows[0].user_id;

    let staffRow;
    if (role === "doctor") {
      staffRow = await client.query(
        `INSERT INTO doctors(user_id, full_name, department_id, consultation_fee, joining_date, salary, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,true) RETURNING *`,
        [user_id, full_name, department_id, consultation_fee || 500, joining_date || new Date(), salary || 0]
      );
    } else {
      staffRow = await client.query(
        `INSERT INTO nurses(user_id, full_name, joining_date, salary, is_active)
         VALUES ($1,$2,$3,$4,true) RETURNING *`,
        [user_id, full_name, joining_date || new Date(), salary || 0]
      );
    }

    await client.query("COMMIT");
    res.status(201).json(staffRow.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.put("/staff/:role/:id", async (req, res) => {
  const { role, id } = req.params;
  const { salary, consultation_fee } = req.body;
  try {
    if (role === "doctor") {
      const r = await pool.query(
        `UPDATE doctors SET salary = COALESCE($1, salary), consultation_fee = COALESCE($2, consultation_fee)
         WHERE doctor_id = $3 RETURNING *`,
        [salary, consultation_fee, id]
      );
      return res.json(r.rows[0]);
    }
    const r = await pool.query(
      `UPDATE nurses SET salary = COALESCE($1, salary) WHERE nurse_id = $2 RETURNING *`,
      [salary, id]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/staff/:role/:id/status", async (req, res) => {
  const { role, id } = req.params;
  const { is_active, leaving_date } = req.body;
  const table = role === "doctor" ? "doctors" : "nurses";
  const idCol = role === "doctor" ? "doctor_id" : "nurse_id";
  try {
    const r = await pool.query(
      `UPDATE ${table} SET is_active = $1, leaving_date = $2 WHERE ${idCol} = $3 RETURNING *`,
      [is_active, is_active ? null : leaving_date || new Date(), id]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;