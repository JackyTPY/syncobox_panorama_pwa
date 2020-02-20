<template>
  <KrpanoViewer :project="project" :API="API" v-if="projectLoaded" />
</template>


<script>
// @ is an alias to /src
import vue from "vue";
import store from "@/store";
import KrpanoViewer from "@/components/KrpanoViewer.vue";
import { API } from "../api.js";
import { register } from "register-service-worker";

function sendMessage(message) {
  return new Promise(function(resolve, reject) {
    var messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = function(event) {
      if (event.data.error) {
        reject(event.data.error);
      } else {
        resolve(event.data);
      }
    };
    navigator.serviceWorker.controller.postMessage(message, [
      messageChannel.port2
    ]);
  });
}

export default {
  name: "viewer",
  components: {
    KrpanoViewer
  },
  props: {
    API: {
      type: Object,
      default: () => API
    }
  },
  data() {
    return {
      project: null,
      projectLoaded: false,
      preCacheDone: false
    };
  },
  beforeCreate() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js");
    }
    navigator.serviceWorker.addEventListener("message", m => {
      console.log(m);
      if (m.data.type === "PRECACHE_DONE") {
        this.preCacheDone = true;
      }
    });
  },
  mounted() {
    if (!this.$route.params.id) {
      return;
    }

    this.API.pano
      .get(this.$route.params.id)
      .then(res => {
        this.project = this.extendProjectData(res.data);
      })
      .then(res => {
        this.projectLoaded = true;
      })
      .then(() => this.cleanLocalStorage())
      .then(() => this.define_manifest())
      .catch(err => {
        console.log(err);
      });

    var timeoutID = window.setInterval(e => {
      if (navigator.serviceWorker.controller && navigator.onLine) {
        this.preparePWA();
        window.clearInterval(timeoutID);
      }
    }, 500);
  },
  methods: {
    preparePWA() {
      this.API.pwa
        .get(this.$route.params.id)
        .then(res => {
          this.sendMessage({
            type: "SET_CONFIG",
            id: this.$route.params.id,
            access_token: store.getters.oidcAccessToken,
            resources: res.data
          });
          console.log({
            type: "SET_CONFIG",
            id: this.$route.params.id,
            access_token: store.getters.oidcAccessToken,
            resources: res.data
          })
        })
        .then(e => this.sendMessage({ type: "PRECACHE" }));
    },

    cleanLocalStorage() {
      Object.entries(localStorage).forEach(e => {
        let id = e[0];
        if (!id.startsWith("oidc.user")) {
          localStorage.removeItem(id);
        }
      });
    },

    sendMessage(message) {
      return new Promise(function(resolve, reject) {
        var messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = function(event) {
          if (event.data.error) {
            reject(event.data.error);
          } else {
            resolve(event.data);
          }
        };
        navigator.serviceWorker.controller.postMessage(message, [
          messageChannel.port2
        ]);
      });
    },

    extendProjectData(pano) {
      let formated = {
        plugins: {
          contextmenu: true,
          comparemode: true,
          circle_hotspots: false,
          webim: true,
          dragablehotspots: false,
          vtourskin: true,
          map: true,
          gyro: true,
          scope: false
        },
        skin_settings: {
          layout_maxwidth: 600,
          showpanomap: true,
          showpanocompare: true,
          webvr: true,
          showsetting: false
        },
        scene: {
          ...pano,
          view: {
            hlookat: pano.defaultH,
            vlookat: pano.defaultV,
            fovtype: "MFOV",
            fov: pano.defaultFOV,
            maxpixelzoom: 2,
            fovmin: 70,
            fovmax: 140,
            limitview: "auto"
          },
          hotspotsVisible: true
        }
      };

      return formated;
    },

    define_manifest() {
      let manifest = {
        name: this.project.scene.name,
        short_name: this.project.scene.name,
        theme_color: "#4DBA87",
        icons: [
          {
            src: "http://localhost:9002/img/icons/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "http://localhost:9002/img/icons/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src:
              "http://localhost:9002/img/icons/android-chrome-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src:
              "http://localhost:9002/img/icons/android-chrome-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ],
        start_url: `http://localhost:9002/#/Panorama/view/${this.project.scene.id}/`,
        display: "standalone",
        background_color: "#000000"
      };
      this.set_manifest(manifest);
    },

    // set manifest dynamically
    set_manifest(json) {
      const stringManifest = JSON.stringify(json);
      const blob = new Blob([stringManifest], {
        type: "application/json"
      });
      const manifestURL = URL.createObjectURL(blob);
      document.head
        .querySelector("[rel~=manifest]")
        .setAttribute("href", manifestURL);

      document.head.querySelector(
        "[name~=apple-mobile-web-app-title]"
      ).content = json.name;
      document.head.querySelector(
        "[name~=apple-mobile-web-app-status-bar-style]"
      ).content = json.background_color;
      document.head.querySelector(
        "[name~=apple-mobile-web-app-capable]"
      ).content = "yes";
      document.head.querySelector("[rel~=apple-touch-icon]").href =
        json.icons[0].src;
      document.head.querySelector("[rel~=apple-touch-icon]").size =
        json.icons[0].size;
    }
  },
  watch: {
    preCacheDone: function(done) {
      console.log("precachedone", done);
      global.krpano.set("layer[skin_btn_sync].visible", !done);
      global.krpano.set("layer[skin_btn_syncdone].visible", done);
    }
  }
};
</script>

<style lang="scss">
html,
body,
#pano {
  width: 100%;
  height: 100%;
  overflow: auto;
  margin: 0;
  padding: 0;
}
</style>