self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open("static-cache").then((cache) => {
            return cache.addAll([
                "/",
                "/index.html",
                "/style.css", // Cambia por tus archivos CSS
                "/script.js",  // Cambia por tus archivos JavaScript
                "/manifest.json",
                "/gus-logo.png",
            ]);
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
