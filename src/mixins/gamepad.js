var rAF = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.requestAnimationFrame

export default {

  data: () => ({
    controllers: {},
    controllersNumber: 0,
    threshold: 0.9,
    axes: [],
    btns: [],
    scangamepadsinterval: null,
  }),

  mounted() {
    if ('GamepadEvent' in window) {
      console.log('GamepadEvent exist')
      window.addEventListener("gamepadconnected", this.connecthandler);
      window.addEventListener("gamepaddisconnected", this.disconnecthandler);
    } else if ('WebKitGamepadEvent' in window) {
      console.log('WebKitGamepadEvent exist')
      window.addEventListener("webkitgamepadconnected", this.connecthandler);
      window.addEventListener("webkitgamepaddisconnected", this.disconnecthandler);
    } else {
      setInterval(this.scangamepads, 500);
    }
  },

  methods: {
    connecthandler(e) {
      console.log('gamepad connceted: ', e.gamepad)
      this.addgamepad(e.gamepad);
    },
    addgamepad(gamepad) {
      console.log('add gamepad: ', gamepad);
      ++this.controllersNumber;
      this.controllers[gamepad.index] = gamepad;
      rAF(this.updateStatus);
    },
    disconnecthandler(e) {
      console.log('gamepad disconnceted: ', e.gamepad)
      this.removegamepad(e.gamepad);
    },
    removegamepad(gamepad) {
      console.log('remove gamepad: ', gamepad)
      --this.controllersNumber;
      delete this.controllers[gamepad.index];
    },
    updateStatus() {
      this.scangamepads();

      
      for (var j in this.controllers) {
        var controller = this.controllers[j];

        this.btns = new Array(controller.buttons.length).fill(false);
        for (var i = 0; i < controller.buttons.length; i++) {
          var val = controller.buttons[i];
          var pressed = val == 1.0;
          if (typeof (val) == "object") {
            pressed = val.pressed;
            val = val.value;
          }
          if (pressed) {
            this.$set(this.btns, i, true)
            console.log(`button ${i} pressed`)
          }
        }

        this.axes = new Array(controller.axes.length).fill(0)
        for (var i = 0; i < controller.axes.length; i++) {
          if(Math.abs(controller.axes[i]) > this.threshold){
            this.$set(this.axes, i, controller.axes[i])
            console.log(`axis ${i} actived: ${controller.axes[i]}`)
          }
        }
      }
      rAF(this.updateStatus);
    },
    scangamepads() {
      // console.log('scan')
      var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
      for (var i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
          if (!(gamepads[i].index in this.controllers)) {
            this.addgamepad(gamepads[i]);
          } else {
            this.controllers[gamepads[i].index] = gamepads[i];
          }
        }
      }
    }
  }
}