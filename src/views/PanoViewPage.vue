<template>
  <v-krpano-viewer :project.sync="project" :API="API" v-if="projectLoaded" pwa />
</template>


<script>
// @ is an alias to /src
import vue from "vue";
import { API } from "../api.js";
import { register } from "register-service-worker";

export default {
  name: "viewer",
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
      preCacheDone: false,
      installPromptEvent: null,
      installPromptDelay: 3000
    };
  },
  async created() {
    this.manageInstallPrompt();

    if ("serviceWorker" in navigator) {
      await navigator.serviceWorker
        .register(
          `/service-worker.js?shareCode=${encodeURIComponent(
            this.$route.params.shareCode
          )}`
        )
        .then(reg => {
          reg.update();
        });
    }

    caches
      .has(`syncobox_panorama_${this.$route.params.shareCode}`)
      .then(has => {
        if (has) {
          this.preCacheDone = true;
          console.log("has cached");
        } else {
          navigator.serviceWorker.addEventListener("message", m => {
            console.log(m);
            if (m.data.type === "PRECACHE_DONE") {
              this.preCacheDone = true;
            }
          });
        }
      });
  },
  mounted() {
    if (!this.$route.params.shareCode) {
      return;
    }

    this.API.pwa
      .get(this.$route.params.shareCode)
      .then(res => {
        this.project = this.extendProjectData(res.data.initialPanorama);
      })
      .then(res => {
        this.projectLoaded = true;
      })
      .then(() => this.define_manifest())
      .catch(err => {
        console.log(err);
        this.$router.push({ name: "404" });
      });
  },
  updated() {
    this.define_manifest();
  },
  methods: {
    extendProjectData(pano) {
      let formated = {
        cached: this.preCacheDone,
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
          // {
          //   src: `${this.API.pano_url.getImage}/${this.project.scene.id}/pwa_thumb_512.png`,
          //   sizes: "192x192",
          //   type: "image/png"
          // },
          {
            src: `${this.API.pano_url.getImage}/${this.project.scene.id}/pwa_thumb_512.png`,
            sizes: "512x512",
            type: "image/png"
          },
          // {
          //   src: `${this.API.pano_url.getImage}/${this.project.scene.id}/pwa_thumb_512_mask.png`,
          //   sizes: "192x192",
          //   type: "image/png",
          //   purpose: "maskable"
          // },
          {
            src: `${this.API.pano_url.getImage}/${this.project.scene.id}/pwa_thumb_512_mask.png`,
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ],
        start_url: `${window.location.origin}/${this.$route.params.shareCode}`,
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

      // for apple
      document.head.querySelector(
        "[name~=apple-mobile-web-app-title]"
      ).content = json.name;
      document.head.querySelector(
        "[rel~=apple-touch-icon]"
      ).href = `${this.API.pano_url.getImage}/${this.project.scene.id}/thumb.jpg`;

      // for ms
      document.head.querySelector(
        "[name~=msapplication-TileImage]"
      ).content = `${this.API.pano_url.getImage}/${this.project.scene.id}/thumb.jpg`;
    },

    manageInstallPrompt() {
      window.addEventListener("beforeinstallprompt", function(e) {
        e.preventDefault();
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
    }
  },
  watch: {
    preCacheDone: function(done) {
      console.log("precachedone", done);
      let timeoutID = setInterval(async () => {
        console.log("try to set krpano");
        if (global.krpano) {
          // await global.krpano.set("layer[skin_btn_sync].visible", !done);
          // await global.krpano.set("layer[skin_btn_syncdone].visible", done);
          this.project.cached = done;
          await global.krpano.set("skin_settings.cached", done);
          await global.krpano.call("arrange_custom_btn();");
          console.log("setting krpano");
          clearInterval(timeoutID);
        }
      }, 5000);
    }
  }
};
</script>

<style lang="scss" scope>
html,
body,
#pano {
  width: 100%;
  height: 100%;
}
</style>