'use strict';

self.addEventListener('install', function () {
	return self.skipWaiting();
});

self.addEventListener('activate', function () {
	return self.clients.claim();
});

self.addEventListener('fetch', function (ev) {
	ev.respondWith(fetch(ev.request));
});