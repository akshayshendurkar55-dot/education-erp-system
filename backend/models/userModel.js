const pool = require("../config/db");

// User fetch query for auth login check
async function findUserByUsername(username) {
  const sql = "SELECT * FROM users WHERE username = $1";
  const res = await pool.query(sql, [username]);
  return res.rows[0];
}

module.exports = {
  findUserByUsername,
};