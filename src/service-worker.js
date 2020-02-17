workbox.core.setCacheNameDetails({ prefix: "syncobox_panorama_pwa" });

var projectId = null
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'UPDATE_PROJECT_ID') {
    projectId = event.data.id
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});


self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
