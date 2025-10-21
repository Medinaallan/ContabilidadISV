const Database = require("./src/models/Database");

// Crear instancia y ver qué pasa
const db = new Database();

console.log("Instancia de Database creada");
console.log("Objeto db:", db);

// Intentar hacer una consulta directa
db.db.get("SELECT name FROM sqlite_master WHERE type='table'", (err, row) => {
    if (err) {
        console.error("Error consultando tablas:", err);
    } else {
        console.log("Tablas disponibles:", row);
        
        // Listar todas las tablas
        db.db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
            console.log("Todas las tablas:", rows);
            
            // Si existe la tabla users, obtener usuarios
            if (rows.some(r => r.name === 'users')) {
                db.db.all("SELECT * FROM users", (err, users) => {
                    console.log("Usuarios:", users);
                });
            }
        });
    }
});
