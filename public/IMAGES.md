# Imágenes del Slider de Login

El frontend de PC Store está utilizando imágenes de **Unsplash** (libres de derechos) para el slider de login.

## Imágenes Actuales

Las imágenes se cargan directamente desde URLs de Unsplash:

1. **Teclado Mecánico** - Foto de teclados gaming/mecánicos
2. **Mouse Gaming** - Foto de mouse de precisión
3. **Auriculares** - Foto de auriculares profesionales

## Si Deseas Usar Imágenes Locales

Puedes descargar estas imágenes de Unsplash o usar tus propias imágenes:

1. Descarga 3 imágenes de PC components (teclados, mouses, auriculares)
2. Guarda las imágenes en esta carpeta `/public/` con los nombres:
   - `pc_keyboard_cover.png` (1200x800 recomendado)
   - `pc_mouse_cover.png` (1200x800 recomendado)
   - `pc_headphones_cover.png` (1200x800 recomendado)

3. Actualiza el archivo `src/app/features/auth/pages/login/login.css`:
   ```css
   .bg-1 {
     background-image: url('/pc_keyboard_cover.png');
   }
   
   .bg-2 {
     background-image: url('/pc_mouse_cover.png');
   }
   
   .bg-3 {
     background-image: url('/pc_headphones_cover.png');
   }
   ```

## Sitios para Descargar Imágenes Libres

- [Unsplash](https://unsplash.com) - Búsqueda: "gaming keyboard", "gaming mouse", "gaming headphones"
- [Pexels](https://www.pexels.com) - Banco de imágenes gratuitas
- [Pixabay](https://pixabay.com) - Imágenes libres de derechos

¡Disfruta tu tienda de PC Store! 🎮
