import axios from "axios";
import store from "@/store/index"

const dev = false;

const TOKEN = store.getters.oidcAccessToken

const api_base = dev ?
    `https://api-dev.syncobox.com` :
    "https://api.syncobox.com";

const api_base_pano = `${api_base}/Panorama`;
const api_base_map = `${api_base}/PanoramaMap`;
const api_base_panoVer = `${api_base}/PanoramaVersion`;
const api_base_identity = 'https://identity.syncobox.com'

// axios.defaults.baseURL = api_base;
// axios.defaults.headers.common['Authorization'] = `bearer ${TOKEN}`;

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

// Panorama Version base api
const panoVersionRequest = axios.create({
    baseURL: `${api_base_panoVer}`
});

const identityRequest = axios.create({
    baseURL: `${api_base_identity}`
})

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

const Identity = {
    refreshToken: pkg => identityRequest.post('/connect/token', pkg)
}

export const API = {
    base: api_base,
    pano: PanoAPI,
    pano_url: PanoAPIURL,
    identity: Identity
};