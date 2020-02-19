import axios from "axios";
import store from "@/store/index"

const dev = false;

const TOKEN = store.getters.oidcAccessToken

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