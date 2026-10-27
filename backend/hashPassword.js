const bcrypt = require("bcrypt");

async function generateHash() {
  const plainPassword = process.argv[2] || process.env.HASH_PASSWORD;
  if (!plainPassword) {
    console.error("Usage: node hashPassword.js <password-to-hash> (or set HASH_PASSWORD env var)");
    process.exit(1);
  }

  const hash = await bcrypt.hash(plainPassword, 10);
  console.log(hash);
}

generateHash();