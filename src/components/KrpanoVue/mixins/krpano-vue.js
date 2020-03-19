import mixin_device from './device'

export default {
  mixins: [mixin_device],
  data: () => ({
    lastView: null
  }),
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
    async initPano() {
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

    async fetchPano(id) {
      let heading = this.project.scene.heading;
      let currentHlookat = await global.krpano.get("view.hlookat");
      let currentVlookat = await global.krpano.get("view.vlookat");

      this.lastView = {
        hlookat: currentHlookat + heading,
        vlookat: currentVlookat
      };

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
              fovmin: 90,
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

    async loadPano() {
      if (!global.krpano) {
        return;
      }
      var xmlstring = `<krpano>
          <include url="/krpano/plugins/contextmenu.xml" />
          <include url="/krpano/plugins/comparemode.xml" />
          <include url="/krpano/plugins/webim.xml" />
          <include url="/krpano/plugins/map.xml" />
          <include url="/krpano/plugins/skyLentern.xml" />
          <include url="/krpano/skin/vtourskin.xml" />

          ${
            this.KrpanoEditor
              ? `<include url="/krpano/plugins/dragablehotspots.xml" />
                 <layer name="target" url="/krpano/plugins/scope.png" align="center" enabled="false" zorder="100" />`
              : '<include url="/krpano/plugins/gyro.xml" />'
          }
          
          <skin_settings 
            layout_maxwidth="${600}"
            showpanomap="${this.project.scene.appliedMap ? true : false}"
            showpanocompare="${this.project.scene.comparePanorama ? true : false}"
            webvr="${!this.KrpanoEditor}"
            showsetting="${false}"
            showhome="${false}"
            enableOffline="${false}"
            cached="${false}"
          />
          
          <events name="viewListener" keep="true" onviewchange="skyLentern(viewChange, get(view.hlookat), get(view.vlookat), get(view.fov))" />

          <scene name="scene-${this.project.scene.id}" title="${this.project.scene.name}" autoload="true" >
            ${this.loadScene(this.project.scene)}
            ${this.loadHotspots(this.project.scene.insideHotspots)}
          </scene>
          
        </krpano>
      `;

      global.krpano.call(
        "loadxml(" + escape(xmlstring) + ", null, MERGE, BLEND(0.5));"
      );
    },

    loadScene(scene) {
      if (!scene) {
        return "";
      }
      var heading = this.project.scene.heading;
      var xml = ` 
        <view 
          hlookat="${this.lastView ? this.lastView.hlookat - heading : scene.view.hlookat}" 
          vlookat="${this.lastView ? this.lastView.vlookat : scene.view.vlookat}" 
          fovtype="${scene.view.fovtype}" 
          fov="${scene.view.fov}"
          fovmin="${scene.view.fovmin}" 
          fovmax="${scene.view.fovmax}" 
          limitview="${scene.view.limitview}" 
        />  
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
                  url="${this.API.pano_url.getImage}/${h.panoramaId}/border_thumb_128.png"
                  width="${h.width || 128}"
                  height="${h.height || 128}"
                  ath="${h.atH}" 
                  atv="${h.atV}" 
                  scale="${h.scale}"
                  tag="${h.panoramaName}"
                  zoom="${h.zoom || false}"
                  tooltip="${h.panoramaName}"
                  style="tooltip"
                  ${this.KrpanoEditor 
                    ? `ondown="draghotspot();"
                       onup="skyLentern(hotspotDrag,${h.panoramaId});"
                      `
                    : `onclick="looktohotspot(panohotspot-${h.panoramaId}); onclick2();erasetooltip();"
                       onclick2="skyLentern(nextScene, ${h.panoramaId});"
                      `
                  }
                />`;
      });
      return xml;
    },

    addHotspots(hotspots) {
      if (!hotspots || hotspots.length === 0) {
        return "";
      }

      hotspots.forEach(h => {
        global.krpano.call(`addhotspot(pano-${h.panoramaId});`);
        global.krpano.set(`hotspot[pano-${h.panoramaId}].url`,`${this.API.pano_url.getImage}/${h.panoramaId}/border_thumb_128.png`);
        global.krpano.set(`hotspot[pano-${h.panoramaId}].width`, h.width || 128);
        global.krpano.set(`hotspot[pano-${h.panoramaId}].height`, h.height || 128);
        global.krpano.set(`hotspot[pano-${h.panoramaId}].ath`, h.atH);
        global.krpano.set(`hotspot[pano-${h.panoramaId}].atv`, h.atV);
        global.krpano.set(`hotspot[pano-${h.panoramaId}].scale`, h.scale);
        global.krpano.set(`hotspot[pano-${h.panoramaId}].tag`, h.name);
        global.krpano.set(`hotspot[pano-${h.panoramaId}].zoom`, h.zoom || false);
        global.krpano.set(`hotspot[pano-${h.panoramaId}].tooltip`, h.panoramaName);
        global.krpano.set(`hotspot[pano-${h.panoramaId}].style`, 'tooltip');
        if(this.KrpanoEditor){
          global.krpano.set(`hotspot[pano-${h.panoramaId}].ondown`, "draghotspot();");
          global.krpano.set(`hotspot[pano-${h.panoramaId}].onup`, `skyLentern(hotspotDrag,${h.panoramaId});`);
        }
        else{
          global.krpano.set(`hotspot[pano-${h.panoramaId}].onclick`, `looktohotspot(panohotspot-${h.panoramaId}); onclick2();erasetooltip();`);
          global.krpano.set(`hotspot[pano-${h.panoramaId}].onclick2`, `skyLentern(nextScene, ${h.panoramaId});`);
        }
      });
    },

    removeHotSpot(hotspots) {
      for (let i = 0; i < hotspots.length; i++) {
        global.krpano.call(`removehotspot(pano-${hotspots[i].panoramaId})`);
      }
    },

    updateHotspot(id) {
      this.project.scene.insideHotspots.find(x => x.panoramaId === id).atH = global.krpano.get(`hotspot[pano-${id}].ath`);
      this.project.scene.insideHotspots.find(x => x.panoramaId === id).atV = global.krpano.get(`hotspot[pano-${id}].atv`);
    },

    showHotSpot(visible) {
      this.project.scene.insideHotspots.forEach(e => {
        let name = `pano-${e.panoramaId}`;
        global.krpano.set(`hotspot[${name}].visible`, visible);
      });
    },

    addCompare(id, controller = false) {
      let url = `  ${this.API.pano_url.getImage}/${id}/pano_%s.jpg`;
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
      if (this.project.scene.comparePanorama) {
        let isVisible = global.krpano.get("plugin[slider_bg].visible");
        global.krpano.set("plugin[slider_bg].visible", !isVisible);
        global.krpano.set("plugin[slider_grip].visible", !isVisible);
      }
    },

    async loadMap(map) {
      if (!map) {
        return;
      }

      await global.krpano.call("addlayer(map)");
      global.krpano.set("layer[map].edge", "leftbottom");
      global.krpano.set("layer[map].align", "leftbottom");
      global.krpano.set("layer[map].x", 0);
      global.krpano.set("layer[map].y", 0);
      global.krpano.set("layer[map].url", `${this.API.map_url.getImage}/${map.id}`);
      global.krpano.set("layer[map].keep", true);
      global.krpano.set("layer[map].handcursor", false);
      global.krpano.set("layer[map].capture", false);
      global.krpano.set("layer[map].scalechildren", true);
      global.krpano.set("layer[map].onclick", "skyLentern(mapOnClick);");
      global.krpano.set("layer[map].visible", !this.mobileAndTabletcheck());
      global.krpano.set("layer[map].onloaded", "skyLentern(mapOnloaded);");

      
      let smallScale = 0.3
      let screenHeight = global.krpano.clientHeight
      let screenWidth = global.krpano.clientWidth
      let screenRatio = screenHeight / screenWidth;

      global.krpano.set('layer[map].width', screenRatio > 1 ? parseFloat(screenWidth) : 'prop')
      global.krpano.set('layer[map].height', screenRatio > 1 ? 'prop' : parseFloat(screenHeight))
      global.krpano.set('layer[map].scale', smallScale)

      if (global.krpano.get("layer[map]")) {
        this.loadMapHotspots();
      }
    },

    deleteMap() {
      global.krpano.call("removelayer(map, true)");
    },

    showMap() {
      let isVisible = global.krpano.get("layer[map].visible");
      global.krpano.set("layer[map].visible", !isVisible);
    },

    toggleMap() {
      let isVisible = global.krpano.get("layer[map].visible");
      global.krpano.set("layer[map].visible", !isVisible);
    },

    openMap(){
      let smallScale = 0.3
      let bigScale = 0.9

      if(global.krpano.get('layer[map].scale') === bigScale){
        global.krpano.call(`
          set(layer[map].onclick, skyLentern(mapOnClick); );
          layer[map].changeorigin(leftbottom,leftbottom);
          tween(layer[map].x, 0);
          tween(layer[map].y, 0);
          tween(layer[map].scale, ${smallScale});
        `)
      }
      else{
        global.krpano.call(`
          set(layer[map].onclick, skyLentern(mapOnClick); );
          layer[map].changeorigin(center,center);
          tween(layer[map].x, 0);
          tween(layer[map].y, 0);
          tween(layer[map].scale, ${bigScale});
        `)
      }
    },

    addMapLoc(map) {
      let thisScene = map.hotspots.find(x => x.linkPanorama.id === this.project.scene.id);
      let width = global.krpano.get("layer[map].imagewidth");
      let height = global.krpano.get("layer[map].imageheight");

      // now location point
      global.krpano.call("addlayer(mapactivespot);");
      global.krpano.set("layer[mapactivespot].parent", "map");
      global.krpano.set("layer[mapactivespot].alpha", 0);
      global.krpano.set("layer[mapactivespot].url", "/krpano/plugins/mappointactive.png");
      global.krpano.set("layer[mapactivespot].align", "lefttop");
      global.krpano.set("layer[mapactivespot].edge", "center");
      global.krpano.set("layer[mapactivespot].zorder", 3);
      global.krpano.set("layer[mapactivespot].keep", true);
      global.krpano.set("layer[mapactivespot].x", thisScene ? thisScene.x * width : null);
      global.krpano.set("layer[mapactivespot].y", thisScene ? thisScene.y * height : null);

      // radar
      global.krpano.call("addlayer(mapradar);");
      global.krpano.set("layer[mapradar].parent", "map");
      global.krpano.set("layer[mapradar].alpha", 0);
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
      global.krpano.set("layer[mapradar].x", thisScene ? thisScene.x * width : null);
      global.krpano.set("layer[mapradar].y", thisScene ? thisScene.y * height : null);
      global.krpano.set("layer[mapradar].heading", thisScene ? thisScene.heading : null);
    },

    async loadMapHotspots() {
      let map = this.project.scene.appliedMap;

      // delete previous scene's map hotspots
      let prevHotspot = global.krpano.get('layer[map]._childs')
      if(prevHotspot){
        await prevHotspot.forEach(async e => {
          if(!map.hotspots.find(h => `maphotspot-${h.linkPanorama.id}` === e.name) && e.name !== 'mapactivespot' && e.name !== 'mapradar')
            await global.krpano.call(`removelayer(${e.name});`)
        })
      }
      
      await this.addMapLoc(map);
      await this.addMapHotspot(map);
      await global.krpano.call(
        `tween(layer[map].alpha, 1.0, 0.5, default, 
            tween(layer[mapradar].alpha, 1.0, 0.25);
            tween(layer[mapactivespot].alpha, 1.0, 0.25);
            set(layer[map].enabled, true);
        );`
      );
    },

    async addMapHotspot(map) {
      let width = global.krpano.get("layer[map].imagewidth");
      let height = global.krpano.get("layer[map].imageheight");

      map.hotspots.forEach(async h => {
        let name = `maphotspot-${h.linkPanorama.id}`;

        await global.krpano.call(`addlayer(${name});`);
        global.krpano.set(`layer[${name}].url`, `${this.API.pano_url.getImage}/${h.linkPanorama.id}/border_thumb_128.png`);
        global.krpano.set(`layer[${name}].width`, Math.min(width, height)/20);
        global.krpano.set(`layer[${name}].height`, 'prop');
        global.krpano.set(`layer[${name}].parent`, "map");
        global.krpano.set(`layer[${name}].scale.mobile`, 2);
        global.krpano.set(`layer[${name}].align`, "lefttop");
        global.krpano.set(`layer[${name}].edge`, "center");
        global.krpano.set(`layer[${name}].zorder`, 1);
        global.krpano.set(`layer[${name}].visible`, true);
        global.krpano.set(`layer[${name}].alpha`, 1.0);
        global.krpano.set(`layer[${name}].keep`, true);
        global.krpano.set(`layer[${name}].tooltip`, h.linkPanorama.name);
        global.krpano.call(`layer[${name}].loadstyle(mapTooltip));`);
        global.krpano.set(`layer[${name}].x`, h.x * width);
        global.krpano.set(`layer[${name}].y`, h.y * height);
        global.krpano.set(`layer[${name}].onclick`, `skyLentern(mapHotspotOnClick, ${h.linkPanorama.id});erasetooltip();`);
      });

      // the mapHotspot of this scene should be hide for radar
      global.krpano.call(
        `tween(layer[maphotspot-${this.project.scene.id}].alpha, 0.0, 0.25, default, set(layer[maphotspot-${this.project.scene.id}].visible, false););`
      );
    },

    mapHotspotOnClick(id) {
      if(this.KrpanoEditor){
        return
      }

      if (parseFloat(global.krpano.get("layer[map].scale")) > 0.25) {
        global.krpano.call(`
          tween(layer[map].alpha, 0.0, 0.25, default, 
            set(layer[map].enabled, false);
            skyLentern(nextScene, ${id});
          );
        `);
      } else {
        Event.fire("nextScene", id);
      }
    },

    setTooltip(id, text) {
      let target = document.getElementById(id);

      if (target) {
        target.classList.add("tooltip");
        target.innerHTML += `<span class="tooltiptext">${text}</span>`;
        return true;
      }

      return false;
    },

    setToolbarTips() {
      this.setTooltip("btnPanoToolHome", this.$t("default_view"))
      this.setTooltip("btnPanoToolPanomap", this.$t("map"))
      this.setTooltip("btnPanoToolPanocompare", this.$t("compare_mode"))
      this.setTooltip("btnPanoToolSetting", this.$t("setting"))
      this.setTooltip("btnPanoToolFullscreen", this.$t("fullscreen"))
      this.setTooltip("btnPanoToolGyro", this.$t("gyro_mode"))
      this.setTooltip("btnPanoToolVR", this.$t("vr_mode"))
      this.setTooltip("btnPanoToolHide", this.$t("hide"))
      this.setTooltip("btnPanoToolShow", this.$t("show"))
      this.setTooltip("btnPanoToolSync", this.$t("caching"))
      this.setTooltip("btnPanoToolSyncDone", this.$t("cached"))
    },
    
    arrangeCustomToolItems() {
      if (global.krpano) {
        global.krpano.call("arrange_custom_btn();");
      }
    },

    screenshot(base64) {
      this.project.scene.screenshot = base64;
    },

    updateView(hlookat, vlookat, fov) {
      this.project.scene.view.hlookat = Number(hlookat);
      this.project.scene.view.vlookat = Number(vlookat);
      this.project.scene.view.fov = Number(fov);
    }
  }
}
