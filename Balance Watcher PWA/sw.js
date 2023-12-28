const staticCacheName = 'site-static-v8';
const dynamicCacheName = 'site-dynamic-v4';
const assets = [
    '/',
    '/index.html',
    '/pages/balance_screen.html',
    '/pages/fallback.html',
    '/js/app.js',
    '/js/ui.js',
    '/css/styles.css',
    '/img/settings_button.png',
    '/img/man_1.png',
    '/img/man_2.png',
    '/img/man_3.png',
    '/img/man_4.png',
    '/img/man_5.png',
    '/img/man_6.png',
    '/img/man_7.png',
    '/img/woman_1.png',
    '/img/woman_2.png',
    '/img/woman_3.png',
    '/img/woman_4.png',
    '/img/woman_5.png',
    '/img/woman_6.png',
    '/img/woman_7.png',
    '/img/woman_8.png'
];


// install service worker
self.addEventListener('install', evt => {
    console.log('service worker has been installed');
    evt.waitUntil(
        caches.open(staticCacheName).then(cache => {
            console.log('caching shell assets now...');
            cache.addAll(assets);        
        })
    );
});

// activate event 
self.addEventListener('activate', evt => {
    console.log('service worker has been activated');
    evt.waitUntil(
        caches.keys().then(keys => {
            // removes all caches that don't have the current name
            return Promise.all(keys
                .filter(key => key !== staticCacheName && key !== dynamicCacheName)
                .map(key => caches.delete(key))
            )
        })
    );
});

// fetch event
self.addEventListener('fetch', evt => {
    evt.respondWith(
        fetch(evt.request).catch(() => {
            if (evt.request.url.indexOf('.html') > -1) {
                return caches.match('/pages/fallback.html');
            }
        })
    );
});

