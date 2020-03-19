import mixin_device from "./device"
import mixin_gamepad from "./gamepad"

export default {
  mixins: [mixin_device, mixin_gamepad],
  data: () => ({
    intervalID: null,
    currentAlpha: 0
  }),
  created(){
    if (this.mobileAndTabletcheck())
      document.addEventListener("keydown", this.controllerDetect);
  },
  methods: {
    decodeController(axes){
      console.log(this.device.supporter)
      switch(this.device.supporter){
        case 'chrome': 
          if(axes[0] === 1){
            this.fade("out");
          }
          if(axes[0] === -1){
            this.fade("in");
          }
          break;
        case 'safari':
          if(axes[2] === 1){
            this.fade("out");
          }
          if(axes[2] === -1){
            this.fade("in");
          }
          break;
      }
    },
    controllerDetect(e) {
      switch (e.keyCode) {
        // to left
        case 37:
          this.controllerEventIntervalID = setInterval(() => {
            this.fade("in");
          }, 10);
          break;

        // left to mid
        case 81:
          clearInterval(this.controllerEventIntervalID);
          break;

        // to right
        case 39:
          this.controllerEventIntervalID = setInterval(() => {
            this.fade("out");
          }, 10);
          break;

        // right to mid
        case 67:
          clearInterval(this.controllerEventIntervalID);
          break;
      }
    },

    fade(direct) {
      var moveUnit = 0.01;
      var newAlpha;

      if (direct === "in") {
        newAlpha = new Number(this.panoramaAlpha) - new Number(moveUnit);
        this.panoramaAlpha = newAlpha >= 0 ? newAlpha : 0;
        krpano.call(`setblend(${this.panoramaAlpha};`);
      }

      if (direct === "out") {
        newAlpha = new Number(this.panoramaAlpha) + new Number(moveUnit);
        this.panoramaAlpha = newAlpha <= 1 ? newAlpha : 1;
        krpano.call(`setblend(${this.panoramaAlpha};`);
      }
    },
  },
  watch: {
    'axes': {
      handler(newvalue){
        if(newvalue && newvalue.length > 0){
          this.decodeController(newvalue);
        }
      },
      deep: true
    },
    'controllersNumber': function(num){
      if(num > 0){
        document.removeEventListener("keydown", this.controllerDetect);
      }
    }
  }
}