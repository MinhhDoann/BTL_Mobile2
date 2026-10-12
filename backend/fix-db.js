import mysql from "mysql2/promise";
async function fix() {
  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "352001",
      database: process.env.DB_NAME || "mobile2",
    });
    
    console.log("Connected to DB, altering users table...");
    try {
      await db.query(`ALTER TABLE users ADD COLUMN artist_request_status ENUM('none', 'pending', 'approved', 'rejected') DEFAULT 'none';`);
      console.log("Added artist_request_status successfully.");
    } catch (err) {
      if (err.code === "ER_DUP_FIELDNAME") {
        console.log("Column artist_request_status already exists.");
      } else {
        console.error("Error altering table", err);
      }
    }
    
    // Check if artist_request_status exists now
    const [rows] = await db.query("DESCRIBE users");
    console.log("Desc users:", rows);
    
    await db.end();
  } catch (err) {
    console.error("Connection error:", err);
  }
}
fix();
