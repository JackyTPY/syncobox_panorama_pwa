<template>
  <KrpanoViewer :project="project" :API="API" v-if="projectLoaded" />
</template>


<script>
// @ is an alias to /src
import vue from "vue";
import KrpanoViewer from "@/components/KrpanoViewer.vue";
import { API } from "../api.js";

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
      projectLoaded: false
    };
  },
  async created() {
    if (!this.$route.params.id) {
      return;
    }

    await this.API.pano
      .get(this.$route.params.id)
      .then(res => {
        this.project = this.extendProjectData(res.data);
      })
      .then(res => {
        this.define_manifest();
      })
      .then(res => {
        this.projectLoaded = true;
      })
      .catch(err => {
        console.log(err);
      });
    // this.set_manifest(project.manifest);
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
      // document.head.querySelector("[rel~=apple-touch-startup-image]").href = json.icons[0].src;
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