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
    intervalID: null,
    currentAlpha: 0
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
    Event.listen("skinOnLoad", this.setToolbarTips);
    document.addEventListener("keydown", this.controllerDetect);
  },

  mounted() {
    this.init();
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
        })
        .then(res => {
          this.initPano();
        })
        .then(res => {
          this.$forceUpdate();
        });
    },

    async initPano() {
      caches.keys().then(keys => {
        let preCacheDone = keys.includes(
          `syncobox_panorama_${this.project.scene.id}`
        );
        global.krpano.set("layer[skin_btn_sync].visible", !preCacheDone);
        global.krpano.set("layer[skin_btn_syncdone].visible", preCacheDone);
      });

      await this.loadPano();
      await this.arrangeCustomToolItems();

      if (this.project.scene.appliedMap) {
        this.loadMap(this.project.scene.appliedMap);
      } else {
        this.deleteMap();
      }

      if (this.project.scene.comparePanorama) {
        this.addCompare(this.project.scene.comparePanorama.id);
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
                showpanomap="${this.project.scene.appliedMap ? true : false}"
                showpanocompare="${
                  this.project.scene.comparePanorama ? true : false
                }"
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
                  }); onclick2();"
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
      await global.krpano.set("layer[map].alpha", 1.0);
      await global.krpano.set("layer[map].scalechildren", true);
      await global.krpano.set("layer[map].onclick", "openmap();");
      await global.krpano.set(
        "layer[map].visible",
        !this.mobileAndTabletcheck()
      );
      await global.krpano.set(
        "layer[map].onloaded",
        "skyLentern(mapOnloaded);"
      );

      if (global.krpano.get("layer[map]")) {
        this.loadMapHotspots();
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
    },

    controllerDetect(e) {
      console.log(e);

      switch (e.keyCode) {
        // 向左
        case 37:
          this.intervalID = setInterval(() => {
            this.fade("in");
          }, 10);
          break;

        // 左 到 中間
        case 81:
          clearInterval(this.intervalID);
          break;

        // 向右
        case 39:
          this.intervalID = setInterval(() => {
            this.fade("out");
          }, 10);
          break;

        // 右 到 中間
        case 67:
          clearInterval(this.intervalID);
          break;
      }
    },

    fade(direct) {
      var moveUnit = 0.01;
      var newAlpha;

      if (direct === "in") {
        newAlpha = new Number(this.currentAlpha) - new Number(moveUnit);
        this.currentAlpha = newAlpha >= 0 ? newAlpha : 0;
        krpano.call(`setblend(${this.currentAlpha};`);
      }

      if (direct === "out") {
        newAlpha = new Number(this.currentAlpha) + new Number(moveUnit);
        this.currentAlpha = newAlpha <= 1 ? newAlpha : 1;
        krpano.call(`setblend(${this.currentAlpha};`);
      }
    },

    setTooltip(id, text) {
      document.getElementById(id).classList.add('tooltip')
      document.getElementById(id).innerHTML = `<span class="tooltiptext">${text}</span>`
    },

    setToolbarTips() {
      this.setTooltip("btnPanoToolHome", this.$t('back_to_list'));
      this.setTooltip("btnPanoToolPanomap", this.$t('map'));
      this.setTooltip("btnPanoToolPanocompare", this.$t('compare_mode'));
      this.setTooltip("btnPanoToolSetting", this.$t('setting'));
      this.setTooltip("btnPanoToolFullscreen", this.$t('fullscreen'));
      this.setTooltip("btnPanoToolGyro", this.$t('gyro_mode'));
      this.setTooltip("btnPanoToolVR", this.$t('vr_mode'));
      this.setTooltip("btnPanoToolHide", this.$t('hide'));
      this.setTooltip("btnPanoToolShow", this.$t('show'));
      this.setTooltip("btnPanoToolSync", this.$t('caching'));
      this.setTooltip("btnPanoToolSyncDone", this.$t('cached'));
    },

    arrangeCustomToolItems(){
      if(!global.krpano){
        global.krpano.call('arrange_custom_btn();')
      }
    },

    mobileAndTabletcheck() {
      var check = false;
      (function(a) {
        if (
          /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
            a
          ) ||
          /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
            a.substr(0, 4)
          )
        )
          check = true;
      })(navigator.userAgent || navigator.vendor || window.opera);
      return check;
    }
  }
};
</script>

<style lang="scss">
.tooltip {
  position: relative;
  display: inline-block;
  border-bottom: 1px dotted black;
}

.tooltip .tooltiptext {
  visibility: hidden;
  background-color: black;
  color: #fff;
  text-align: center;
  padding: 6px 0;
  border-radius: 6px;
  width: 80px;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  text-transform: capitalize;

  position: absolute;
  z-index: 1;
}

.tooltip .tooltiptext::after {
    content: " ";
    position: absolute;
    top: 100%; /* 提示工具底部 */
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: black transparent transparent transparent;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
}
</style>
