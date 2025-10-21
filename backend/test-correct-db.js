const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const path = require("path");

const dbPath = path.join(__dirname, "src", "database", "consolidacion.db");
console.log("Probando con BD:", dbPath);

const db = new sqlite3.Database(dbPath);

db.get("SELECT * FROM users WHERE email = ?", ["admin@contabilidad.com"], async (err, user) => {
    if (err) {
        console.error("Error:", err);
        db.close();
        return;
    }
    
    if (!user) {
        console.log("Usuario no encontrado");
        db.close();
        return;
    }
    
    console.log("Usuario encontrado:", {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
    });
    
    const isValid = await bcrypt.compare("admin123", user.password);
    console.log("Contraseña válida:", isValid);
    
    db.close();
});
