import axios from "axios";

const dev = false;

const TOKEN = dev ?
    "eyJhbGciOiJSUzI1NiIsImtpZCI6Ik1EQ2FWNUZSU2tXb3hEdC1qRnZ0UFEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE1ODEzOTEyMzQsImV4cCI6MTU4MTM5NDgzNCwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS1kZXYuc3luY29ib3guY29tIiwiYXVkIjoicGFubzphbGwiLCJjbGllbnRfaWQiOiJwb3J0YWwtc3BhIiwic3ViIjoiMTBmYzg1OTUtMDU5NC00YjM2LWIxZmQtNTVkYTVhN2FkZjQ1IiwiYXV0aF90aW1lIjoxNTgxMDU4NzcxLCJpZHAiOiJsb2NhbCIsInByZWZlcnJlZF91c2VybmFtZSI6InRlc3R1c2VyIiwidW5pcXVlX25hbWUiOiJ0ZXN0dXNlciIsImVtYWlsIjoidGVzdHVzZXJAd2ViaW0uY29tLnR3IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInNjb3BlIjpbInByb2ZpbGUiLCJvcGVuaWQiLCJwYW5vOmFsbCIsIm9mZmxpbmVfYWNjZXNzIl0sImFtciI6WyJwd2QiXX0.YrRLCXtwSz-TPSOUS1ilY_HRybcViJJm5jmoDkq_7SFB5b9EkOfSU6y4ehqRIEAv9307NtTmJG3xhy0A6HtlqTgQ8uqfpfa_v8LC9jPPfhqUO-yD1Me-4iB0S3qvgHPS4VzSLeISKxwbYqOgcE0s269fDMLLqeVxR5Gm9oR_V6iZSfIQ_JAYCMjrVsSHqr8icetTgtE9C14bgO9gwXWwsKZHHtgaJkWOnJRFm_tYMd5M3jz91wLxsJEEw3NQyMWZFYYO5QmMHYJZB-uv6K5oo9i_1GQPO19kPN2kwfGaIFP-ZjoNJBnwvw6H15cUMHbA-Of_TIdqP9azDRMNvkpwRA" :
    "eyJhbGciOiJSUzI1NiIsImtpZCI6Il9QSm5NVVNxZ3hWSDJXN2I5VElES2ciLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE1ODE5MzExNTcsImV4cCI6MTU4MTkzNDc1NywiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS5zeW5jb2JveC5jb20iLCJhdWQiOiJwYW5vOmFsbCIsImNsaWVudF9pZCI6InBvcnRhbC1zcGEiLCJzdWIiOiI4ZmUzODAxNy1hZmExLTQzOWItOGI3OS1kNmIxMTM0ZGIzNDkiLCJhdXRoX3RpbWUiOjE1ODE5MjcxMjksImlkcCI6ImxvY2FsIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiamFja3l0c2VuZ0B3ZWJpbS5jb20udHciLCJ1bmlxdWVfbmFtZSI6ImphY2t5dHNlbmdAd2ViaW0uY29tLnR3IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiI4ZmUzODAxNy1hZmExLTQzOWItOGI3OS1kNmIxMTM0ZGIzNDkiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiamFja3l0c2VuZ0B3ZWJpbS5jb20udHciLCJlbWFpbCI6ImphY2t5dHNlbmdAd2ViaW0uY29tLnR3IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2VtYWlsYWRkcmVzcyI6ImphY2t5dHNlbmdAd2ViaW0uY29tLnR3Iiwic2NvcGUiOlsicHJvZmlsZSIsIm9wZW5pZCIsInBhbm86YWxsIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.eDlBvLBZ-P-rMzS8QAYwoy3j7Z5VPrTlcyqoT7je2kDEq0irYB2e8ulLm52K9FdhZVRJejGDB6DIZaD9WyZ8YZVoUv00RkF5LMjYY4-CQHA6OsjMzI7qz_WCJTEHQwrw_aIyOU2BLprUz23YofeBbHDSa-X0l6UmVS6rCddwJsQs2WfSplQoragBdzFjBOeEfX3E2l7DGucikRvqR54YuYoiSmSDlkzeHWAypdfdfYLPCPoRRNx-s7iW1qR5BfOhCdV3K2OtTrB4ctD-67rA3GmzZk5v2VYnNd27IVbSmFhDqEGNvRGkNWZs-OLctgVbKlcCLnHfCEAXSV8v_L74Lw"

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