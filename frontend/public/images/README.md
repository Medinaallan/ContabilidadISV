# LOGO DE LA EMPRESA

## Ubicación del Logo
Para personalizar la página de inicio con el logo de tu empresa, coloca el archivo de imagen en:

```
frontend/public/images/logo-contabilidad.png
```

## Formatos Soportados
- PNG (recomendado para logos con transparencia)
- JPG/JPEG (para imágenes fotográficas)
- SVG (para logos vectoriales)

## Especificaciones Recomendadas
- **Resolución:** 800x600 píxeles o superior
- **Formato:** PNG con fondo transparente
- **Tamaño de archivo:** Máximo 2MB para mejor rendimiento
- **Proporción:** 4:3 o 16:9 para mejor visualización

## Configuración Actual
El sistema está configurado para:
- Mostrar el logo como fondo sutil en la página de inicio
- Usar un overlay semitransparente para mantener la legibilidad
- Adaptar automáticamente el tamaño según la pantalla

## Si no tienes logo
El sistema funciona perfectamente sin logo, mostrando un diseño elegante con gradientes y el icono corporativo.

## Cambiar el logo
1. Guarda tu logo como `logo-contabilidad.png` en `frontend/public/images/`
2. El sistema lo detectará automáticamente
3. Si usas otro nombre, edita el archivo `HomeSection.tsx` línea 20