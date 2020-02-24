self.__precacheManifest = [].concat(self.__precacheManifest || []);

var cacheName = 'syncobox_panorama'
var projectId = null
var access_token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6Il9QSm5NVVNxZ3hWSDJXN2I5VElES2ciLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE1ODI1MTE4MjksImV4cCI6MTU4MjUxNTQyOSwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS5zeW5jb2JveC5jb20iLCJhdWQiOiJwYW5vOmFsbCIsImNsaWVudF9pZCI6InBvcnRhbC1zcGEiLCJzdWIiOiI4ZmUzODAxNy1hZmExLTQzOWItOGI3OS1kNmIxMTM0ZGIzNDkiLCJhdXRoX3RpbWUiOjE1ODI1MTE4MDQsImlkcCI6ImxvY2FsIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiamFja3l0c2VuZ0B3ZWJpbS5jb20udHciLCJ1bmlxdWVfbmFtZSI6ImphY2t5dHNlbmdAd2ViaW0uY29tLnR3IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiI4ZmUzODAxNy1hZmExLTQzOWItOGI3OS1kNmIxMTM0ZGIzNDkiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiamFja3l0c2VuZ0B3ZWJpbS5jb20udHciLCJlbWFpbCI6ImphY2t5dHNlbmdAd2ViaW0uY29tLnR3IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2VtYWlsYWRkcmVzcyI6ImphY2t5dHNlbmdAd2ViaW0uY29tLnR3Iiwic2NvcGUiOlsicHJvZmlsZSIsIm9wZW5pZCIsInBhbm86YWxsIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.eaG5I1db2pNAtNMOZzm6svJRkrK51xQSGSaRDYUeE1HglLJrXyq-SlUZz4qzLbshK7lIWfN8VIhVTFfm3GTzzA_4-smO4ezOQqnydFcZKurEmujB0LXYfArxqwqEcacJZ-J80yXE-_CC0QmbWCPJ8eTSOw0EEcos8fWjpOZibCadU0kMlmOzt-0WRokhhv1ya74y7YHWTFnR0GrFx6TxraGHfayOcJWrt3AhtQeXFyCiF-oOJ3VwWWZ_eV8Asp31IvnwhCHWbmjZsSQdRkFs63tiQQqaKhlMjO_T8BqcOBDmygKBemoGroX-9bGSazLhTyXxs4RcJRdb8KkvoQtYSQ'
var resources = null
var config = {
  headers: {
    Authorization: `bearer ${access_token}`,
    "Access-Control-Allow-Origin": "*"
  }
}
var promises = []
const api_base = "https://api.syncobox.com";


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

self.addEventListener('install', event => {
  projectId = new URL(location).searchParams.get('id');

  console.log('service worker: ', projectId)
  // static files
  caches.open(cacheName).then(cache => {
    self.__precacheManifest.forEach(e => {
      promises.push(cache.add(e.url))
    })
  })

  

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
  }

  if (event.data && event.data.type === 'CLEAN_CACHE') {
    caches.delete(cacheName)
  }

  if (event.data && event.data.type === 'PRECACHE') {
    console.log('precache')

    event.waitUntil(
      caches.open(cacheName).then(function (cache) {

        // // this page
        // promises.push(cache.add(`/view/${projectId}`))

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
