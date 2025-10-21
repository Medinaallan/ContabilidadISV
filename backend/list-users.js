const Database = require('./src/models/Database');

const db = new Database();

async function listUsers() {
    try {
        console.log('👥 Listando todos los usuarios en la base de datos...');
        
        // Obtener todos los usuarios
        const users = await new Promise((resolve, reject) => {
            db.db.all('SELECT id, username, email, role FROM users', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
        
        console.log('Usuarios encontrados:', users.length);
        users.forEach(user => {
            console.log(`- ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    }
}

listUsers();