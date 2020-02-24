import axios from "axios";

const dev = false;

const api_base = dev ?
    `https://api-dev.syncobox.com` :
    "https://api.syncobox.com";

const api_base_pano = `${api_base}/Panorama`;
const api_base_map = `${api_base}/PanoramaMap`;
const api_base_pwa = `${api_base}/PanoramaPWA`;


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
    getImage: `${api_base_pano}/GetImage`,
};

const PanoAPI = {
    get: id => panoRequest.get(`${id}`),
    getImage: (id, name) =>
        panoRequest.get(`/GetImage/${id}/${name}`),
};

const MapAPIURL = {
    get: `${api_base_map}`,
    getImage: `${api_base_map}/GetImage`,
    getThumb: `${api_base_map}/GetThumbnail`,
};

// Map 相關的 api
const MapAPI = {
    get: id => mapRequest.get(`${id}`),
    getImage: id => mapRequest.get(`/GetImage/${id}`),
    getThumb: id => mapRequest.get(`/GetThumbnail/${id}`)
};

const PwaAPI = {
    get: id => pwaRequest.get(`${id}`)
}

export const API = {
    base: api_base,
    pano: PanoAPI,
    pano_url: PanoAPIURL,
    map: MapAPI,
    map_url: MapAPIURL,
    pwa: PwaAPI
};