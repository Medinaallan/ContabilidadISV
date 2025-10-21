const Database = require("./src/models/Database");

const db = new Database();

console.log(" Probando método findUserByEmail...");

// Usar el método directamente
db.findUserByEmail("admin@contabilidad.com")
    .then(user => {
        if (user) {
            console.log(" Usuario encontrado:", user);
        } else {
            console.log(" Usuario no encontrado");
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
