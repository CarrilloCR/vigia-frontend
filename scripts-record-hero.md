# Re-grabar el video del login hero

El login usa `public/preview-dashboard.{mp4,webm}` — screencast REAL del dashboard.
Para regrabar (cuando cambie el dashboard):

1. Levantar back+front, loguear una clínica con datos (o activar alertas temporalmente).
2. Guardar el auth state de zustand en /tmp/authstate.json (localStorage 'vigia-auth').
3. Script puppeteer-core: goto '/', set localStorage, goto '/dashboard', screencast ~7s (incluye click en KPIs), page.screencast({path:'/tmp/hero.webm'}).
   Chrome flags: --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader
4. Encode: ffmpeg -i hero.webm -vf scale=1000:-2 -c:v libx264 -crf 25 -pix_fmt yuv420p -movflags +faststart -an public/preview-dashboard.mp4
   ffmpeg -i hero.webm -vf scale=1000:-2 -c:v libvpx-vp9 -crf 36 -b:v 0 -an public/preview-dashboard.webm
