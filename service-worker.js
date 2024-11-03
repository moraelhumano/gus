self.addEventListener('install', (event) => {
    console.log('Service Worker instalado');
});

self.addEventListener('fetch', (event) => {
    // Aquí puedes manejar la caché y otras funcionalidades
});
