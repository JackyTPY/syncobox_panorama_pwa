import axios from "axios";

const dev = false;

const TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6Il9QSm5NVVNxZ3hWSDJXN2I5VElES2ciLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE1ODI1Mjc3NjIsImV4cCI6MTU4MjUzMTM2MiwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS5zeW5jb2JveC5jb20iLCJhdWQiOiJwYW5vOmFsbCIsImNsaWVudF9pZCI6InBvcnRhbC1zcGEiLCJzdWIiOiI4ZmUzODAxNy1hZmExLTQzOWItOGI3OS1kNmIxMTM0ZGIzNDkiLCJhdXRoX3RpbWUiOjE1ODI1MTE4MDQsImlkcCI6ImxvY2FsIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiamFja3l0c2VuZ0B3ZWJpbS5jb20udHciLCJ1bmlxdWVfbmFtZSI6ImphY2t5dHNlbmdAd2ViaW0uY29tLnR3IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiI4ZmUzODAxNy1hZmExLTQzOWItOGI3OS1kNmIxMTM0ZGIzNDkiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiamFja3l0c2VuZ0B3ZWJpbS5jb20udHciLCJlbWFpbCI6ImphY2t5dHNlbmdAd2ViaW0uY29tLnR3IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2VtYWlsYWRkcmVzcyI6ImphY2t5dHNlbmdAd2ViaW0uY29tLnR3Iiwic2NvcGUiOlsicHJvZmlsZSIsIm9wZW5pZCIsInBhbm86YWxsIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.Kc8DY1WR2mGbu7QmSexUprATCzcPHLfYM_qEMM3C7dCROmq9OVXE-AUhKerA8vn7NMAoFxvf8vNPRZtEq0SVFE96G8lv6r_fFtuzwnmNW0w4Dyo-7QMvGdb-njxfuJkHg6KKbM6QFGkI2gA-8HBdsSgboDMaGgTsk7c6f9nbU6Z8hVGbZwknNi2i1snud6STAHBPLRGydEz_LbLFiNS1iY3xQoVVN5WyzMbgpQvAeNV0wF4J1faafT9aJW0Tctvu3ZTQQ2o10oEG7z1dNRYYp__RYBs5GTluvbCTU0qGAp3a6-EByuTpcxiS-vBKMOeqgHGlOOocyWDIls_1BxWP5A'

const api_base = dev ?
    `https://api-dev.syncobox.com` :
    "https://api.syncobox.com";

const api_base_pano = `${api_base}/Panorama`;
const api_base_map = `${api_base}/PanoramaMap`;
const api_base_pwa = `${api_base}/PanoramaPWA`;

const CONFIG = {
    headers: {
        Authorization: `bearer ${TOKEN}`,
        "Access-Control-Allow-Origin": "*"
    }
};

const BLOBCONFIG = {
    headers: {
        Authorization: `bearer ${TOKEN}`
    },
    responseType: "blob"
};

// Panorama base api
const panoRequest = axios.create({
    baseURL: `${api_base_pano}`
});

// Map base api
const mapRequest = axios.create({
    baseURL: `${api_base_map}`
});

// Pwa base api
const pwaRequest = axios.create({
    baseURL: `${api_base_pwa}`
});

const PanoAPIURL = {
    get: `${api_base_pano}`,
    updatePano: `${api_base_pano}`,
    delete: `${api_base_pano}`,
    getByProject: `${api_base_pano}/GetByProject`,
    getByUser: `${api_base_pano}/GetByUser`,
    getPanoFiles: `${api_base_pano}/GetPanoFiles`,
    getImage: `${api_base_pano}/GetImage`,
    updateVer: `${api_base_pano}/ApplyVersion`,
    add: `${api_base_pano}`,
    updateHotspots: `${api_base_pano}/UpdateHotspots/`
};

const PanoAPI = {
    get: id => panoRequest.get(`${id}`, CONFIG),
    updatePano: (id, data) => panoRequest.put(`${id}`, data, CONFIG),
    delete: id => panoRequest.delete(`${id}`, CONFIG),
    getByProject: (id, data, config) =>
        panoRequest.post(`/GetByProject/${id}`, data, {
            ...CONFIG,
            ...config
        }),
    getByUser: id => panoRequest.get(`/GetByUser/${id}`, CONFIG),
    getPanoFiles: id => panoRequest.get(`/GetPanoFiles/${id}`, CONFIG),
    getImage: (id, name) =>
        panoRequest.get(`/GetImage/${id}/${name}`, BLOBCONFIG),
    updateVersion: data => panoRequest.put(`/ApplyVersion`, data, CONFIG),
    add: (data, config, callback) => {
        if (callback) callback(CONFIG);
        return panoRequest.post("", data, {
            ...config,
            ...CONFIG
        });
    },
    updateHotspots: (id, data) =>
        panoRequest.post(`/UpdateHotspots/${id}`, data, CONFIG)
};

const MapAPIURL = {
    get: `${api_base_map}`,
    updateInfo: `${api_base_map}`,
    delete: `${api_base_map}`,
    getImage: `${api_base_map}/GetImage`,
    getThumb: `${api_base_map}/GetThumbnail`,
    getByProject: `${api_base_map}/GetByProject`,
    add: `${api_base_map}`,
    updateHotspots: `${api_base_map}/UpdateHotspots`,
    updateImage: `${api_base_map}/UpdateImage`
};

// Map 相關的 api
const MapAPI = {
    get: id => mapRequest.get(`${id}`, CONFIG),
    updateInfo: (id, data) => mapRequest.put(`${id}`, data, CONFIG),
    delete: id => mapRequest.delete(`${id}`, CONFIG),
    getImage: id => mapRequest.get(`/GetImage/${id}`, CONFIG),
    getThumb: id => mapRequest.get(`/GetThumbnail/${id}`, CONFIG),
    getByProject: (id, data) =>
        mapRequest.post(`/GetByProject/${id}`, data, CONFIG),
    add: (data, config) =>
        mapRequest.post(``, data, {
            ...config,
            ...CONFIG
        }),
    updateHotspots: (id, data) =>
        mapRequest.post(`/UpdateHotspots/${id}`, data, CONFIG),
    updateImage: (data, config) =>
        mapRequest.put(`/UpdateImage`, data, {
            ...config,
            ...CONFIG
        })
};

const PwaAPI = {
    get: id => pwaRequest.get(`${id}`, CONFIG)
}

export const API = {
    base: api_base,
    pano: PanoAPI,
    pano_url: PanoAPIURL,
    map: MapAPI,
    map_url: MapAPIURL,
    pwa: PwaAPI
};