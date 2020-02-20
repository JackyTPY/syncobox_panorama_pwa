self.__precacheManifest = [].concat(self.__precacheManifest || []);

var cacheName = 'syncobox_panorama'
var projectId = null
var access_token = null
var resources = null
var config = null
var promises = []
const api_base = "https://api.syncobox.com";


self.addEventListener('fetch', function (event) {
  if (!navigator.onLine) {
    event.respondWith(
      caches.match(event.request.url).then(res => {
        return res
      })
    );
  }
});

self.addEventListener('install', event => {
  self.skipWaiting()
})

self.addEventListener('activate', function (event) {

  event.waitUntil(self.clients.claim());

});

self.addEventListener('message', function (event) {

  if (event.data && event.data.type === 'SET_CONFIG') {
    console.log('set config')
    cacheName = 'syncobox_panorama_' + event.data.id
    projectId = event.data.id
    access_token = event.data.access_token
    resources = event.data.resources
    config = {
      headers: {
        Authorization: `bearer ${access_token}`,
        "Access-Control-Allow-Origin": "*"
      }
    }
  }

  if (event.data && event.data.type === 'CLEAN_CACHE') {
    caches.delete(cacheName)
  }

  if (event.data && event.data.type === 'PRECACHE') {
    console.log('precache')

    event.waitUntil(
      caches.open(cacheName).then(function (cache) {

        // static files
        self.__precacheManifest.forEach(e => {
          promises.push(cache.add(e.url))
        })

        // this page
        promises.push(cache.add(`/view/${projectId}`))

        // all information about panorama
        resources.panoramaIds.forEach(id => {
          promises.push(
            fetch(`${api_base}/Panorama/${id}`, config)
              .then(json => {
                cache.put(`${api_base}/Panorama/${id}`, json)
                cache.add(`${api_base}/Panorama/GetImage/${id}/pano_l.jpg`)
                cache.add(`${api_base}/Panorama/GetImage/${id}/pano_r.jpg`)
                cache.add(`${api_base}/Panorama/GetImage/${id}/pano_u.jpg`)
                cache.add(`${api_base}/Panorama/GetImage/${id}/pano_d.jpg`)
                cache.add(`${api_base}/Panorama/GetImage/${id}/pano_f.jpg`)
                cache.add(`${api_base}/Panorama/GetImage/${id}/pano_b.jpg`)
                cache.add(`${api_base}/Panorama/GetImage/${id}/preview.jpg`)
                cache.add(`${api_base}/Panorama/GetImage/${id}/thumb.jpg`)
                cache.add(`${api_base}/Panorama/GetImage/${id}/border_thumb_128.png`)
              })
              .catch((err) => {
                console.log('錯誤:', err);
              })
          )
        })

        // map images
        resources.mapIds.forEach(id => {
          promises.push(
            fetch(`${api_base}/PanoramaMap/GetImage/${id}`, config)
              .then(res => {
                cache.put(`${api_base}/PanoramaMap/GetImage/${id}`, res)
              })
          )
        })


        Promise.all(promises).then(e => self.clients.matchAll().then(all => all.map(client => client.postMessage({ type: 'PRECACHE_DONE' }))))
      })
    )
    self.skipWaiting();

  }
});
