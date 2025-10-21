const Database = require('./src/models/Database');

const db = new Database();

async function updateAdminEmail() {
    try {
        console.log('🔄 Actualizando email del usuario admin...');
        
        // Actualizar el email del usuario admin
        await new Promise((resolve, reject) => {
            db.db.run(
                'UPDATE users SET email = ? WHERE username = ?', 
                ['admin@contabilidad.com', 'admin'], 
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('✅ Email actualizado. Filas afectadas:', this.changes);
                        resolve();
                    }
                }
            );
        });
        
        // Verificar el cambio
        const user = await db.findUserByEmail('admin@contabilidad.com');
        if (user) {
            console.log('✅ Usuario actualizado:', {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            });
        } else {
            console.log('❌ No se pudo verificar la actualización');
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}

updateAdminEmail();