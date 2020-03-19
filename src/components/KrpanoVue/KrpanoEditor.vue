<i18n src="./locale/locales.json"></i18n>

<template>
  <div :id="id ? 'pano_' + id : 'pano'"></div>
</template>

<script>
import { API } from "../../api.js";
import mixin_krpano_vue from "./mixins/krpano-vue"
import skyLentern from "./plugins/skylentern"

export default {
  name: "Krpano-Vue-Editor",
  mixins: [mixin_krpano_vue],
  props: {
    API: {
      type: Object,
      default: () => API
    },
    project: Object,
    id: String
  },

  data: () => ({
    KrpanoEditor: true
  }),

  beforeCreate(){
    skyLentern.init();
  },

  created() {
    Event.listen("viewChange", this.updateView);
    Event.listen("hotspotDrag", this.updateHotspot);
    Event.listen("compareBtnClick", this.showCompareTool);
    Event.listen("mapBtnClick", this.toggleMap);
    Event.listen("mapOnloaded", this.loadMapHotspots);
    Event.listen("mapOnClick", this.openMap);
    Event.listen("screenshot", this.screenshot);
    Event.listen("skinOnLoad", this.setToolbarTips);
    Event.listen("settingBtnClick", () => {
      this.$emit("settingBtnClick");
    });
    Event.listen("goHome", () => {
      global.krpano.call(`
        lookto(${this.project.scene.defaultH},${this.project.scene.defaultV},${this.project.scene.defaultFOV},smooth());
      `);
    });
  },
  watch: {
    "project.scene.insideHotspots": {
      async handler(newHotspots, oldHotspots) {
        if (!newHotspots || !oldHotspots) {
          return;
        }
        await this.removeHotSpot(oldHotspots);
        await this.addHotspots(newHotspots);
      }
    },
    "project.scene.hotspotsVisible": {
      handler(newVisible) {
        this.showHotSpot(newVisible);
      }
    },
    "project.scene.view.hlookat": {
      handler(newHlookat) {
        if (!newHlookat) {
          return;
        }
        global.krpano.set("view.hlookat", newHlookat);
      }
    },
    "project.scene.view.vlookat": {
      handler(newvlookat) {
        if (!newvlookat) {
          return;
        }
        global.krpano.set("view.vlookat", newvlookat);
      }
    },
    "project.scene.view.fov": {
      handler(newFov) {
        if (newFov && newFov < this.project.scene.view.fovmax && newFov > this.project.scene.view.fovmin) {
          global.krpano.set("view.fov", newFov);
        }
      }
    },
    "project.scene.comparePanorama": {
      async handler(newCompare) {
        await this.stopCompare();
        await global.krpano.set(
          "skin_settings.showpanocompare",
          newCompare ? true : false
        );
        this.arrangeCustomToolItems();
        if (newCompare) {
          this.addCompare(newCompare, true);
        }
      }
    },
    "project.scene.appliedMap": {
      async handler(newMap) {
        await global.krpano.call("removelayer(map, true);");
        await global.krpano.set(
          "skin_settings.showpanomap",
          newMap ? true : false
        );
        await this.arrangeCustomToolItems();
        if (!newMap) {
          return;
        }
        this.loadMap(newMap);
      }
    },
    "project.scene.appliedMap.hotspots": {
      handler(newHotspots, oldHotspots) {
        if (!newHotspots) {
          return;
        }
        let heading = newHotspots.filter(
          x => x.linkPanorama.id === this.project.scene.id
        )[0].heading;
        global.krpano.set("layer[mapradar].heading", heading);
      },
      deep: true
    }
  }
};
</script>

<style lang="scss" scope>
@import "./scss/krpano-vue.scss";
</style>
