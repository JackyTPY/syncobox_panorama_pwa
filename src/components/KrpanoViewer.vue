<template>
  <div :id="id ? 'pano_' + id : 'pano'"></div>
</template>

<script>
import Vue from "vue";
import { API } from "../api.js";

export default {
  name: "viewer",
  ref: "viewer",

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
    isPreview: {
      type: Boolean,
      default: () => false
    }
  },
  data: () => ({
    changeSceneTimes: 0
  }),
  beforeCreate() {
    window.Event = new (class {
      constructor() {
        this.vue = new Vue();
      }
      fire(event, data = null) {
        this.vue.$emit(event, data);
      }
      listen(event, callback) {
        this.vue.$on(event, callback);
      }
    })();
  },
  created() {
    Event.listen("compareBtnClick", this.showCompareTool);
    Event.listen("mapBtnClick", this.showMap);
    Event.listen("mapOnloaded", this.loadMapHotspots);
    Event.listen("nextScene", this.fetchPano);
    Event.listen("goHome", () => {
      this.isPreview ? "" : this.$router.go(-1);
    });
  },

  mounted() {
    this.init();
    this.$forceUpdate();
  },

  methods: {
    init() {
      embedpano({
        swf: null, // path to flash viewer (use null if no flash fallback will be requiered)
        id: "krpanoSWFObject",
        xml: null,
        target: this.id ? "pano_" + this.id : "pano",
        html5: "prefer+preserveDrawingBuffer",
        webglsettings: {
          preserveDrawingBuffer: true
        },
        mobilescale: 1.0,
        passQueryParameters: true, // pass query parameters of the url to krpano
        onready: this.krpano_onready_callback
      });
    },

    async krpano_onready_callback(krpano_interface) {
      global.krpano = krpano_interface;

      await this.initPano();
    },

    fetchPano(id) {
      this.API.pano
        .get(id)
        .then(res => {
          return {
            ...res.data,
            view: {
              hlookat: res.data.defaultH,
              vlookat: res.data.defaultV,
              fovtype: "MFOV",
              fov: res.data.defaultFOV,
              maxpixelzoom: 2,
              fovmin: 70,
              fovmax: 140,
              limitview: "auto"
            },
            hotspotsVisible: true
          };
        })
        .then(res => {
          this.project.scene = res;
          ++this.changeSceneTimes
        })
        .then(res => {
          this.initPano();
        })
        .then(res => {
          this.$forceUpdate();
        });
    },

    async initPano() {
      await this.loadPano();

      if (this.project.scene.appliedMap) {
        await this.loadMap(this.project.scene.appliedMap);
      } else {
        await this.deleteMap();
      }

      if (this.project.scene.comparePanorama) {
        await this.addCompare(this.project.scene.comparePanorama.id);
      }
    },

    async loadPano() {
      if (!global.krpano) {
        return;
      } else {
        var xmlstring = `<krpano>
              <include url="/krpano/plugins/skyLentern.xml" />
              ${
                this.project.plugins.contextmenu
                  ? '<include url="/krpano/plugins/contextmenu.xml" />'
                  : ""
              }
              ${
                this.project.plugins.comparemode
                  ? '<include url="/krpano/plugins/comparemode.xml" /> '
                  : ""
              }
              ${
                this.project.plugins.circle_hotspots
                  ? '<include url="/krpano/plugins/circle_hotspots.xml" />'
                  : ""
              }
              ${
                this.project.plugins.webim
                  ? '<include url="/krpano/plugins/webim.xml" />'
                  : ""
              }
              ${
                this.project.plugins.dragablehotspots
                  ? '<include url="/krpano/plugins/dragablehotspots.xml" />'
                  : ""
              }
              ${
                this.project.plugins.vtourskin
                  ? '<include url="/krpano/skin/vtourskin.xml" />'
                  : ""
              }
              ${
                this.project.plugins.map
                  ? '<include url="/krpano/plugins/map.xml" />'
                  : ""
              }
              ${
                this.project.plugins.gyro
                  ? '<include url="/krpano/plugins/gyro.xml" />'
                  : ""
              }
              ${
                this.project.plugins.scope
                  ? '<layer name="target" url="/krpano/plugins/scope.png" align="center" enabled="false" zorder="100" />'
                  : ""
              }
              <skin_settings 
                layout_maxwidth="${this.project.skin_settings.layout_maxwidth}"
                showpanomap="${this.project.skin_settings.showpanomap}"
                showpanocompare="${this.project.skin_settings.showpanocompare}"
                webvr="${this.project.skin_settings.webvr}"
                showsetting="${this.project.skin_settings.showsetting}"
                showhome="${false}"
              />
              <events name="viewListener" keep="true" onviewchange="skyLentern(viewChange)" />
              <scene 
                name="scene-${this.project.scene.id}" 
                title="${this.project.scene.name}" autoload="true" >
                ${this.loadScene(this.project.scene)}
                ${this.loadHotspots(this.project.scene.insideHotspots)}
              </scene>
              
            </krpano>`;

        global.krpano.call(
          "loadxml(" +
            escape(xmlstring) +
            ", null, MERGE, get(skin_settings.loadscene_blend));"
        );
      }
    },

    loadScene(scene) {
      if (!scene) {
        return "";
      }

      var xml = ` 
          <view hlookat="${scene.view.hlookat}" vlookat="${scene.view.vlookat}" fovtype="${scene.view.fovtype}" fov="${scene.view.fov}" maxpixelzoom="${scene.view.maxpixelzoom}" fovmin="${scene.view.fovmin}" fovmax="${scene.view.fovmax}" limitview="${scene.view.limitview}" />
          <preview url="${this.API.pano_url.getImage}/${scene.id}/preview.jpg" />
          <image>
              <cube url="${this.API.pano_url.getImage}/${scene.id}/pano_%s.jpg" />
          </image>
        `;

      return xml;
    },

    loadHotspots(hotspots) {
      if (!hotspots || hotspots.length === 0) {
        return "";
      }

      var xml = "";

      hotspots.forEach(h => {
        xml += `<hotspot 
                  name="panohotspot-${h.panoramaId}"
                  url="${this.API.pano_url.getImage}/${
          h.panoramaId
        }/border_thumb_128.png"
                  width="${h.width || 128}"
                  height="${h.height || 128}"
                  ath="${h.atH}" 
                  atv="${h.atV}" 
                  scale="${h.scale}"
                  tag="${h.name}"
                  zoom="${h.zoom || false}"
                  tooltip="${h.name}"
                  style="tooltip"
                  ondown="${this.edit ? "draghotspot();" : ""}"
                  onup="skyLentern(hotspotDrag,${h.panoramaId});"
                  onclick="looktohotspot(panohotspot-${
                    h.panoramaId
                  },get(view.fovmin),smooth(100,-100,120),true); onclick2();"
                  onclick2="skyLentern(nextScene, ${h.panoramaId})"
                  />`;
      });

      return xml;
    },

    addCompare(id, controller = false) {
      let url = `${this.API.pano_url.getImage}/${id}/pano_%s.jpg`;
      let formatedURL = url.split("_%s")[0];

      global.krpano.call("removecube(comparePano);");
      global.krpano.call(`addcube("comparePano", ${formatedURL});`);
      global.krpano.set("plugin[slider_bg].visible", controller);
      global.krpano.set("plugin[slider_grip].visible", controller);
      global.krpano.call("startcomapre();");
    },

    stopCompare() {
      global.krpano.call(`removecube("comparePano");`);
      global.krpano.set("plugin[slider_bg].visible", false);
      global.krpano.set("plugin[slider_grip].visible", false);
      global.krpano.get("plugin[slider_grip]").x = 0;
    },

    showCompareTool() {
      let isVisible = global.krpano.get("plugin[slider_bg].visible");
      global.krpano.set("plugin[slider_bg].visible", !isVisible);
      global.krpano.set("plugin[slider_grip].visible", !isVisible);
    },

    deleteMap() {
      global.krpano.call("removelayer(map, true)");
    },

    async loadMap(map) {
      if (!map) {
        return;
      }
      await global.krpano.call("addlayer(map)");
      await global.krpano.set(
        "layer[map].url",
        `${this.API.map_url.getImage}/${map.id}`
      );
      await global.krpano.set("layer[map].keep", true);
      await global.krpano.set("layer[map].handcursor", false);
      await global.krpano.set("layer[map].capture", false);
      await global.krpano.set("layer[map].align", "leftbottom");
      await global.krpano.set("layer[map].scale", 0.25);
      await global.krpano.set("layer[map].scalechildren", true);
      await global.krpano.set("layer[map].onclick", "openmap();");
      await global.krpano.set("layer[map].visible", true);
      await global.krpano.set("layer[map].onloaded", "skyLentern(mapOnloaded);");
      if(global.krpano.get('layer[map]')){
        this.loadMapHotspots()
      }
      
    },

    async loadMapHotspots() {
      let map = this.project.scene.appliedMap;

      await this.addMapLoc(map);
      await this.addMapHotspot(map);
    },

    addMapLoc(map) {
      let thisScene = map.hotspots.filter(
        x => x.linkPanorama.id === this.project.scene.id
      )[0];
      let width = global.krpano.get("layer[map]").width;
      let height = global.krpano.get("layer[map]").height;

      // now location point
      global.krpano.call("addlayer(mapactivespot);");
      global.krpano.set("layer[mapactivespot].parent", "map");
      global.krpano.set(
        "layer[mapactivespot].url",
        "/krpano/plugins/mappointactive.png"
      );
      global.krpano.set("layer[mapactivespot].align", "lefttop");
      global.krpano.set("layer[mapactivespot].edge", "center");
      global.krpano.set("layer[mapactivespot].zorder", 3);
      global.krpano.set("layer[mapactivespot].keep", true);
      global.krpano.set("layer[mapactivespot].x", thisScene.x * width);
      global.krpano.set("layer[mapactivespot].y", thisScene.y * height);

      // radar
      global.krpano.call("addlayer(mapradar);");
      global.krpano.set("layer[mapradar].parent", "map");
      global.krpano.set("layer[mapradar].url", "/krpano/plugins/radar.js");
      global.krpano.set("layer[mapradar].align", "lefttop");
      global.krpano.set("layer[mapradar].edge", "center");
      global.krpano.set("layer[mapradar].zorder", 2);
      global.krpano.set("layer[mapradar].fillalpha", 0.5);
      global.krpano.set("layer[mapradar].fillcolor", 0x6fa8dc);
      global.krpano.set("layer[mapradar].linewidth", 1.0);
      global.krpano.set("layer[mapradar].linecolor", 0xffffff);
      global.krpano.set("layer[mapradar].linealpha", 0.5);
      global.krpano.set("layer[mapradar].keep", true);
      global.krpano.set("layer[mapradar].x", thisScene.x * width);
      global.krpano.set("layer[mapradar].y", thisScene.y * height);
      global.krpano.set("layer[mapradar].heading", thisScene.heading);
    },

    addMapHotspot(map) {
      let width = global.krpano.get("layer[map]").width;
      let height = global.krpano.get("layer[map]").height;

      map.hotspots.forEach(h => {
        let name = `maphotspot-${h.linkPanorama.id}`;

        global.krpano.call(`addlayer(${name});`);
        global.krpano.set(
          `layer[${name}].url`,
          `${this.API.pano_url.getImage}/${h.linkPanorama.id}/border_thumb_128.png`
        );
        // global.krpano.set(`layer[${name}].width`, h.width);
        // global.krpano.set(`layer[${name}].height`, h.height);
        global.krpano.set(`layer[${name}].parent`, "map");
        global.krpano.set(`layer[${name}].scale.mobile`, 2);
        global.krpano.set(`layer[${name}].align`, "lefttop");
        global.krpano.set(`layer[${name}].edge`, "center");
        global.krpano.set(`layer[${name}].zorder`, 1);
        global.krpano.set(`layer[${name}].visible`, true);
        global.krpano.set(`layer[${name}].keep`, true);
        global.krpano.set(`layer[${name}].tooltip`, h.linkPanorama.name);
        global.krpano.call(`layer[${name}].loadstyle(mapTooltip));`);
        global.krpano.set(`layer[${name}].x`, h.x * width);
        global.krpano.set(`layer[${name}].y`, h.y * height);
        global.krpano.set(
          `layer[${name}].onclick`,
          `mapspot_loadscene(); skyLentern(nextScene, ${h.linkPanorama.id});`
        );
      });

      // for radar
      global.krpano.set(
        `layer[maphotspot-${this.project.scene.id}].visible`,
        false
      );
    },

    showMap() {
      let isVisible = global.krpano.get("layer[map].visible");
      global.krpano.set("layer[map].visible", !isVisible);
      global.krpano.set("layer[map].visible", !isVisible);
    }
  }
};
</script>
