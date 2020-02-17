export default {
    origin: process.env,
    isLocalDev: process.env.NODE_ENV === "development",
    isDev: process.env.VUE_APP_BUILD_MODE === "development"
}
//VUE_APP_BUILD_MODE as custom variable