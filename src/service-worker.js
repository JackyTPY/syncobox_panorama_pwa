self.__precacheManifest = [].concat(self.__precacheManifest || []);


var shareCode = new URL(location).searchParams.get('shareCode');
var cacheName = 'syncobox_panorama_' + shareCode
var promises = []
const api_base = "https://api.syncobox.com";


self.addEventListener('install',event => {

  shareCode = new URL(location).searchParams.get('shareCode');
  cacheName = 'syncobox_panorama_' + shareCode
  console.log('service worker: ', shareCode)

  fetch(`${api_base}/PanoramaPWA/${shareCode}`)
    .then(async res => {
      await caches.open(cacheName)
        .then(async cache => await cache.put(`${api_base}/PanoramaPWA/${shareCode}`, res.clone()))
      return res
    })
    .then(res => res.json())
    .then(data => preCache(data))
})

self.addEventListener('activate', function (event) {
  console.log('service worker activated')
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', function (event) {
  console.log('service worker on message')
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    caches.delete(cacheName)
  }
});



self.addEventListener('fetch', function (event) {
  // console.log('service worker on fetch')
  // console.log('fetch: ' + event.request.url)
  event.respondWith(
    caches.open(cacheName).then(function (cache) {
      return cache.match(event.request.url).then(function (response) {
        return response || fetch(event.request).then(function (response) {
          cache.put(event.request.url, response.clone());
          return response;
        });
      });
    })
  )
})

function preCache(resources) {
  caches.open(cacheName)
    .then(async cache => {

      // this page
      await promises.push(cache.add(`/view/${shareCode}`))
      console.log('page done')

      // static files
      await self.__precacheManifest.forEach(async e => {
        await promises.push(cache.add(e.url))
      })
      console.log('static files done')

      // all information about panorama
      await resources.panoramaIds.forEach(async id => {
        await promises.push(
          fetch(`${api_base}/Panorama/${id}`)
            .then(async json => {
              await cache.put(`${api_base}/Panorama/${id}`, json)
              await cache.add(`${api_base}/Panorama/GetImage/${id}/pano_l.jpg`)
              await cache.add(`${api_base}/Panorama/GetImage/${id}/pano_r.jpg`)
              await cache.add(`${api_base}/Panorama/GetImage/${id}/pano_u.jpg`)
              await cache.add(`${api_base}/Panorama/GetImage/${id}/pano_d.jpg`)
              await cache.add(`${api_base}/Panorama/GetImage/${id}/pano_f.jpg`)
              await cache.add(`${api_base}/Panorama/GetImage/${id}/pano_b.jpg`)
              await cache.add(`${api_base}/Panorama/GetImage/${id}/preview.jpg`)
              await cache.add(`${api_base}/Panorama/GetImage/${id}/thumb.jpg`)
              await cache.add(`${api_base}/Panorama/GetImage/${id}/border_thumb_128.png`)
            })
            .catch((err) => {
              console.log('錯誤:', err);
            })
        )
      })
      console.log('pano done')

      // map images
      await resources.mapIds.forEach(async id => {
        await promises.push(
          fetch(`${api_base}/PanoramaMap/GetImage/${id}`)
            .then(async res => {
              await cache.put(`${api_base}/PanoramaMap/GetImage/${id}`, res)
            })
        )
      })
      console.log('map done')

      console.log(self.clients.matchAll().then(all => console.log(all)))
      Promise.all(promises).then(e => self.clients.matchAll().then(all => all.map(client => client.postMessage({ type: 'PRECACHE_DONE' }))))
    })
}