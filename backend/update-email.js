const Database = require("./src/models/Database");

const db = new Database();

async function updateAdminEmail() {
    try {
        console.log(" Actualizando email del usuario admin...");
        
        await new Promise((resolve, reject) => {
            db.db.run(
                "UPDATE users SET email = ? WHERE username = ?",
                ["admin@contabilidad.com", "admin"],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
        
        console.log(" Email actualizado correctamente");
        
        const user = await db.findUserByEmail("admin@contabilidad.com");
        if (user) {
            console.log(" Usuario encontrado:", {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            });
        }
        
    } catch (error) {
        console.error("Error:", error);
    }
}

updateAdminEmail();
