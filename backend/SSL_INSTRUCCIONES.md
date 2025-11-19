# Instrucciones para SSL en Node.js/Express (Let’s Encrypt)

1. **Obtén tu certificado SSL**
   - Si tienes un dominio y acceso root a tu servidor, usa [Certbot](https://certbot.eff.org/) para obtener certificados gratuitos de Let’s Encrypt.
   - Los archivos generados serán algo como:
     - `/etc/letsencrypt/live/tu-dominio/fullchain.pem` (certificado)
     - `/etc/letsencrypt/live/tu-dominio/privkey.pem` (llave privada)

2. **Copia los archivos a tu servidor o asegúrate de que Node.js pueda leerlos.**

3. **Modifica `backend/server.js` para usar HTTPS:**
   - Requiere los módulos `https` y `fs`.
   - Lee los archivos del certificado.
   - Usa `https.createServer` en vez de `app.listen`.

4. **Ejemplo de código:**

```js
const https = require('https');
const fs = require('fs');

// ...tu código Express...

const sslOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/tu-dominio/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/tu-dominio/fullchain.pem')
};

const server = https.createServer(sslOptions, app).listen(PORT, HOST, async () => {
  // ...tu código de inicio...
});
```

5. **Redirecciona HTTP a HTTPS (opcional pero recomendado):**
   - Puedes correr un pequeño servidor HTTP en el mismo puerto 80 que redirija todo a HTTPS.

6. **Reinicia tu backend tras los cambios.**

---

**Nota:**
- El puerto estándar para HTTPS es 443. Si usas otro, deberás especificarlo en la URL.
- Si usas un proxy inverso (Nginx/Apache), lo ideal es que el proxy gestione el SSL y Node.js escuche solo en HTTP local.
- ¡Haz backup antes de modificar tu servidor!
