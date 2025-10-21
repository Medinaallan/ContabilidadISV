const Database = require('./src/models/Database');
const bcrypt = require('bcryptjs');

async function testLogin() {
    try {
        console.log('🔍 Probando credenciales de login...');
        
        const db = new Database();
        
        // Esperar un momento para que se inicialice
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Buscar usuario por email
        const user = await db.findUserByEmail('admin@contabilidad.com');
        
        if (!user) {
            console.log('❌ Usuario no encontrado');
            return;
        }
        
        console.log('✅ Usuario encontrado:', {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        });
        
        // Probar la contraseña
        const isValidPassword = await bcrypt.compare('admin123', user.password);
        
        if (isValidPassword) {
            console.log('✅ Contraseña correcta');
        } else {
            console.log('❌ Contraseña incorrecta');
            console.log('Hash almacenado:', user.password);
            
            // Vamos a crear un nuevo hash para verificar
            const newHash = await bcrypt.hash('admin123', 10);
            console.log('Hash nuevo para admin123:', newHash);
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testLogin();