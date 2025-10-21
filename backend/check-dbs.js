const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath1 = path.join(__dirname, "database", "consolidacion.db");
const dbPath2 = path.join(__dirname, "src", "database", "consolidacion.db");

console.log("Verificando BD 1:", dbPath1);
const db1 = new sqlite3.Database(dbPath1);
db1.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
    console.log("BD 1 - Tabla users:", row ? "existe" : "no existe");
    db1.close();
    
    console.log("Verificando BD 2:", dbPath2);
    const db2 = new sqlite3.Database(dbPath2);
    db2.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
        console.log("BD 2 - Tabla users:", row ? "existe" : "no existe");
        if (row) {
            db2.all("SELECT * FROM users", (err, rows) => {
                console.log("Usuarios en BD 2:", rows);
                db2.close();
            });
        } else {
            db2.close();
        }
    });
});
