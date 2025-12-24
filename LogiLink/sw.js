self.addEventListener('install', (e) => {
 console.log('LogiLink App Installed');
});

self.addEventListener('fetch', (e) => {
 // This allows the app to load from the cloud
 e.respondWith(fetch(e.request));
});