const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "database", "consolidacion.db");
console.log("Ruta de la base de datos:", dbPath);

const db = new sqlite3.Database(dbPath);

db.get("SELECT * FROM users WHERE email = ?", ["admin@contabilidad.com"], (err, row) => {
    if (err) {
        console.error("Error:", err);
    } else {
        console.log("Usuario encontrado:", row);
    }
    db.close();
});
