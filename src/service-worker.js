self.__precacheManifest = [].concat(self.__precacheManifest || []);

var cacheName = 'syncobox_panorama'
var shareCode = null
var promises = []
const api_base = "https://api.syncobox.com";


self.addEventListener('install', event => {

  shareCode = new URL(location).searchParams.get('shareCode');
  console.log('service worker: ', shareCode)

  
  
  fetch(`${api_base}/PanoramaPWA/${shareCode}`)
    .then(res => res.json())
    .then(data => preCache(data))
})

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    caches.delete(cacheName)
  }
});



self.addEventListener('fetch', function (event) {

  event.respondWith(
    caches.match(event.request.url).then(res => {
      return res || fetch(event.request)
        .then(r => {
          return caches.open(cacheName).then(cache => {
            cache.put(event.request.url, r.clone());
            return r;
          });
        })
    })
  );

});


function preCache(resources){
  caches.open(cacheName)
    .then(async cache => {

      // this page
      await promises.push(cache.add(`/view/${shareCode}`))

      // static files
      await self.__precacheManifest.forEach(async e => {
        await promises.push(cache.add(e.url))
      })

      // api
      await promises.push(fetch(`${api_base}/PanoramaPWA/${shareCode}`))

      // all information about panorama
      await resources.panoramaIds.forEach(async id =>{
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

      // map images
      await resources.mapIds.forEach(async id => {
        await promises.push(
          fetch(`${api_base}/PanoramaMap/GetImage/${id}`)
            .then(async res => {
              await cache.put(`${api_base}/PanoramaMap/GetImage/${id}`, res)
            })
        )
      })

      Promise.all(promises).then(e => self.clients.matchAll().then(all => all.map(client => client.postMessage({ type: 'PRECACHE_DONE' }))))
    })
}