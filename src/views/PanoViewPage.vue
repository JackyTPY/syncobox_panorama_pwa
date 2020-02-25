<template>
  <KrpanoViewer :project.sync="project" :API="API" v-if="projectLoaded" />
</template>


<script>
// @ is an alias to /src
import vue from "vue";
import KrpanoViewer from "@/components/KrpanoViewer.vue";
import { API } from "../api.js";
import { register } from "register-service-worker";

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
  async created() {
    if ("serviceWorker" in navigator) {
      await navigator.serviceWorker
        .getRegistrations()
        .then(async function(registrations) {
          for (let registration of registrations) {
            await registration.unregister();
          }
        });
      await navigator.serviceWorker.register(
        `/service-worker.js?shareCode=${encodeURIComponent(
          this.$route.params.shareCode
        )}`
      );
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
      });
  },
  updated(){
    this.define_manifest()
  },
  methods: {

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
          showsetting: false,
          enableOffline: true,
          cached: this.preCacheDone,
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
            src:
              "https://pano-dev.syncobox.com/img/icons/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src:
              "https://pano-dev.syncobox.com/img/icons/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src:
              "https://pano-dev.syncobox.com/img/icons/android-chrome-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src:
              "https://pano-dev.syncobox.com/img/icons/android-chrome-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ],
        start_url: `https://pano-dev.syncobox.com/view/${this.$route.params.shareCode}`,
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
    }
  },
  watch: {
    preCacheDone: function(done) {
      console.log("precachedone", done);
      let timeoutID = setInterval(async () => {
        console.log('try to set krpano')
        if (global.krpano) {
          // await global.krpano.set("layer[skin_btn_sync].visible", !done);
          // await global.krpano.set("layer[skin_btn_syncdone].visible", done);
          this.project.skin_settings.cached = done
          await global.krpano.set("skin_settings.cached", done);
          await global.krpano.call("arrange_custom_btn();");
          console.log('setting krpano')
          clearInterval(timeoutID);
        }
      }, 5000);
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