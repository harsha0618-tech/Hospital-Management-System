import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { pool } from "../db.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }
  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length === 0) return res.status(401).json({ error: "Invalid username or password" });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Invalid username or password" });

    let staff_id = null;
    let is_active = true;

    if (user.role === "doctor") {
      const d = await pool.query("SELECT doctor_id, is_active FROM doctors WHERE user_id = $1", [user.user_id]);
      staff_id = d.rows[0]?.doctor_id || null;
      is_active = d.rows[0]?.is_active ?? true;
    } else if (user.role === "nurse") {
      const n = await pool.query("SELECT nurse_id, is_active FROM nurses WHERE user_id = $1", [user.user_id]);
      staff_id = n.rows[0]?.nurse_id || null;
      is_active = n.rows[0]?.is_active ?? true;
    }

    if (!is_active) {
      return res.status(403).json({ error: "This staff account has been deactivated. Contact admin." });
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role, full_name: user.full_name, staff_id },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    await pool.query(
      `INSERT INTO audit_log(action, entity_type, entity_id, performed_by, details)
       VALUES ('login','user',$1,$2,$3)`,
      [user.user_id, user.full_name, `Logged in as ${user.role}`]
    );

    res.json({ token, role: user.role, full_name: user.full_name, staff_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
