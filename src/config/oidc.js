import nodeVariable from "./nodeEnvVariables";

const identityServer = {
    localDev: "https://identity-dev.syncobox.com/",
    dev: "https://identity-dev.syncobox.com/",
    prd: "https://identity.syncobox.com/"
};

const deployServer = {
    localDev: "http://localhost:9002/",
    dev: "https://pano-dev.syncobox.com/",
    prd: "https://portal.syncobox.com/"
};

//default as production mode
// let redirect_uri = deployServer["prd"],
let redirect_uri = deployServer["localDev"], 
    authority_uri = identityServer["prd"];

// if (nodeVariable.isLocalDev) {
//     redirect_uri = deployServer["localDev"];
//     authority_uri = identityServer["prd"];
// } else if (nodeVariable.isDev) {
//     redirect_uri = deployServer["dev"];
//     authority_uri = identityServer["dev"];
// }

export const oidcSettings = {
    authority: authority_uri,
    clientId: "portal-spa",
    redirectUri: redirect_uri + "callback",
    post_logout_redirect_uri: redirect_uri + "signout-callback",
    responseType: "code",
    scope: "openid profile pano:all offline_access",
    silentRedirectUri: redirect_uri + "silent-renew",
    automaticSilentRenew: true // If true oidc-client will try to renew your token when it is about to expire
};