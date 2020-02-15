import axios from "axios";

const dev = false;

const TOKEN = dev ?
    "eyJhbGciOiJSUzI1NiIsImtpZCI6Ik1EQ2FWNUZSU2tXb3hEdC1qRnZ0UFEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE1ODEzOTEyMzQsImV4cCI6MTU4MTM5NDgzNCwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS1kZXYuc3luY29ib3guY29tIiwiYXVkIjoicGFubzphbGwiLCJjbGllbnRfaWQiOiJwb3J0YWwtc3BhIiwic3ViIjoiMTBmYzg1OTUtMDU5NC00YjM2LWIxZmQtNTVkYTVhN2FkZjQ1IiwiYXV0aF90aW1lIjoxNTgxMDU4NzcxLCJpZHAiOiJsb2NhbCIsInByZWZlcnJlZF91c2VybmFtZSI6InRlc3R1c2VyIiwidW5pcXVlX25hbWUiOiJ0ZXN0dXNlciIsImVtYWlsIjoidGVzdHVzZXJAd2ViaW0uY29tLnR3IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInNjb3BlIjpbInByb2ZpbGUiLCJvcGVuaWQiLCJwYW5vOmFsbCIsIm9mZmxpbmVfYWNjZXNzIl0sImFtciI6WyJwd2QiXX0.YrRLCXtwSz-TPSOUS1ilY_HRybcViJJm5jmoDkq_7SFB5b9EkOfSU6y4ehqRIEAv9307NtTmJG3xhy0A6HtlqTgQ8uqfpfa_v8LC9jPPfhqUO-yD1Me-4iB0S3qvgHPS4VzSLeISKxwbYqOgcE0s269fDMLLqeVxR5Gm9oR_V6iZSfIQ_JAYCMjrVsSHqr8icetTgtE9C14bgO9gwXWwsKZHHtgaJkWOnJRFm_tYMd5M3jz91wLxsJEEw3NQyMWZFYYO5QmMHYJZB-uv6K5oo9i_1GQPO19kPN2kwfGaIFP-ZjoNJBnwvw6H15cUMHbA-Of_TIdqP9azDRMNvkpwRA" :
    "eyJhbGciOiJSUzI1NiIsImtpZCI6Il9QSm5NVVNxZ3hWSDJXN2I5VElES2ciLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE1ODE3NDQ5MzgsImV4cCI6MTU4MTc0ODUzOCwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS5zeW5jb2JveC5jb20iLCJhdWQiOiJwYW5vOmFsbCIsImNsaWVudF9pZCI6InBvcnRhbC1zcGEiLCJzdWIiOiI2NjlkZDBhZi02ZWIxLTRmYzgtOGVmYi05NjczOGRjNzA2ZGYiLCJhdXRoX3RpbWUiOjE1ODE3Mzg0NjMsImlkcCI6ImxvY2FsIiwicHJlZmVycmVkX3VzZXJuYW1lIjoidGVzdHVzZXIiLCJ1bmlxdWVfbmFtZSI6InRlc3R1c2VyIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiI2NjlkZDBhZi02ZWIxLTRmYzgtOGVmYi05NjczOGRjNzA2ZGYiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoidGVzdHVzZXIiLCJlbWFpbCI6InRlc3R1c2VyQHdlYmltLmNvbS50dyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJ0ZXN0dXNlckB3ZWJpbS5jb20udHciLCJzY29wZSI6WyJwcm9maWxlIiwib3BlbmlkIiwicGFubzphbGwiLCJvZmZsaW5lX2FjY2VzcyJdLCJhbXIiOlsicHdkIl19.RdQuQkj4KyWV4Be796MD0XuCgCJJdpzN8wGLu70kdGLhVvDrCHsxWFdID78kBWMFG5Ihp2QKg3euw5fO4fypdqgeNAU0t1RwtQw99AfGEAH2zOIPVQRWcMxG298avOZmnKRnDLqNmkdFXkK52HcN9Hg3Xctz3re1GFffo54eYA7hYba2tIjBI7wKuNkts8i4RGCV-vYcw5lEp5kmbKTAS-zRWD_OaiGkvfMozsho-lVH3k0E-qEG05e0SseIfFHWS04F1UWYBs20-VRI7r1HpXr-1Us0SqNUNrQ8Nwxbr9P9tKNFXDK3r8jRQD-K0n-pE9iVpQpcrsMb2hqyYQ3XWw"

const api_base = dev ?
    `https://api-dev.syncobox.com` :
    "https://api.syncobox.com";
const api_base_pano = `${api_base}/Panorama`;
const api_base_map = `${api_base}/PanoramaMap`;
const api_base_panoVer = `${api_base}/PanoramaVersion`;

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

const VersionAPI = {
    get: id => panoVersionRequest.get(`${id}`, CONFIG),
    delete: id => panoVersionRequest.delete(`${id}`, CONFIG),
    getList: (id, data) =>
        panoVersionRequest.post(`/GetByPano/${id}`, data, CONFIG),
    add: (data, config) =>
        panoVersionRequest.post("", data, {
            ...config,
            ...CONFIG
        })
};

export const API = {
    base: api_base,
    pano: PanoAPI,
    pano_url: PanoAPIURL,
    map: MapAPI,
    map_url: MapAPIURL,
    version: VersionAPI
};