workbox.core.setCacheNameDetails({ prefix: "syncobox_panorama_pwa" });

var projectId = null
var token 

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'UPDATE_PROJECT_ID') {
    projectId = event.data.id
  }

  if (event.data && event.data.type === 'TEST_FETCH') {
    
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', event => {

})


self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
