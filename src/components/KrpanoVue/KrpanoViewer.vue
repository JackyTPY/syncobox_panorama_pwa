<i18n src="./locale/locales.json"></i18n>

<template>
  <div :id="id ? 'pano_' + id : 'pano'"></div>
</template>

<script>
import { API } from "../../api.js";
import mixin_krpano_vue from "./mixins/krpano-vue"
import mixin_controller from "./mixins/controller"
import skyLentern from "./plugins/skylentern"

export default {
  name: "Krpano-Vue-Viewer",
  mixins: [mixin_krpano_vue, mixin_controller],
  props: {
    API: {
      type: Object,
      default: () => API
    },
    project: Object,
    id: {
      type: String,
      default: () => ""
    },
    pwa: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    KrpanoEditor: false
  }),
  beforeCreate(){
    skyLentern.init();
  },
  created() {
    Event.listen("compareBtnClick", this.showCompareTool);
    Event.listen("mapBtnClick", this.toggleMap);
    Event.listen("mapOnloaded", this.loadMapHotspots);
    Event.listen("mapHotspotOnClick", this.mapHotspotOnClick);
    Event.listen("nextScene", this.fetchPano);
    Event.listen("mapOnClick", this.openMap);
    Event.listen("goHome", () => {
      global.krpano.call(`
        lookto(${this.project.scene.view.hlookat},${this.project.scene.view.vlookat},${this.project.scene.view.fov},smooth());
      `);
    });
    Event.listen("skinOnLoad", this.setToolbarTips);
  }

};
</script>

<style lang="scss" scope>
@import "./scss/krpano-vue.scss";
</style>