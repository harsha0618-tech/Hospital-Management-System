import express from "express";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = express.Router();

// No password check for now - authenticate purely by selected role.
// Each role has exactly one seeded user (see backend/seed_users.js).
router.post("/login", async (req, res) => {
  const { role } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE role = $1 LIMIT 1", [role]);
    if (result.rows.length === 0) return res.status(401).json({ error: "No user found for this role" });

    const user = result.rows[0];

    let staff_id = null;
    if (user.role === "doctor") {
      const d = await pool.query("SELECT doctor_id FROM doctors WHERE user_id = $1", [user.user_id]);
      staff_id = d.rows[0]?.doctor_id || null;
    } else if (user.role === "nurse") {
      const n = await pool.query("SELECT nurse_id FROM nurses WHERE user_id = $1", [user.user_id]);
      staff_id = n.rows[0]?.nurse_id || null;
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role, full_name: user.full_name, staff_id },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token, role: user.role, full_name: user.full_name, staff_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;