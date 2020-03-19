
export default {

  data: () => ({
    device: {
      userAgent: navigator.userAgent.toLowerCase(),
      system: 'unknown',
      systemVersion: 'unknown',
      platform: 'unknown',
      engine: 'unknown',
      engineVersion: 'unknown',
      supporter: 'unknown',
      supporterVersion: 'unknown',
      shell: 'unknown',
      shellVersion: 'unknown'
    }
  }),

  async mounted(){
    await this.checkOS();
    await this.checkOSVersion();
    await this.checkPlatform();
    await this.checkEngineAndSupporter();
    await this.checkEngineVersion();
    await this.checkEngineVersion();
    await this.checkSupporterVersion();
    await this.checkShell();
  },

  methods: {
    testUa(regexp){
      return regexp.test(this.device.userAgent)
    },
    testVs(regexp){
      return (this.device.userAgent.match(regexp) + "").replace(/[^0-9|_.]/ig, "").replace(/_/ig, ".");
    },
    checkOS() {
      if (this.testUa(/windows|win32|win64|wow32|wow64/ig)) {
        this.device.system = "windows"; // window系統
      } else if (this.testUa(/macintosh|macintel/ig)) {
        this.device.system = "macos"; // macos系統
      } else if (this.testUa(/x11/ig)) {
        this.device.system = "linux"; // linux系統
      } else if (this.testUa(/android|adr/ig)) {
        this.device.system = "android"; // android系統
      } else if (this.testUa(/ios|iphone|ipad|ipod|iwatch/ig)) {
        this.device.system = "ios"; // ios系統
      }
    },
    checkOSVersion() {
      if (this.device.system === "windows") {
        if (this.testUa(/windows nt 5.0|windows 2000/ig)) {
          this.device.systemVersion = "2000";
        } else if (this.testUa(/windows nt 5.1|windows xp/ig)) {
          this.device.systemVersion = "xp";
        } else if (this.testUa(/windows nt 5.2|windows 2003/ig)) {
          this.device.systemVersion = "2003";
        } else if (this.testUa(/windows nt 6.0|windows vista/ig)) {
          this.device.systemVersion = "vista";
        } else if (this.testUa(/windows nt 6.1|windows 7/ig)) {
          this.device.systemVersion = "7";
        } else if (this.testUa(/windows nt 6.2|windows 8/ig)) {
          this.device.systemVersion = "8";
        } else if (this.testUa(/windows nt 6.3|windows 8.1/ig)) {
          this.device.systemVersion = "8.1";
        } else if (this.testUa(/windows nt 10.0|windows 10/ig)) {
          this.device.systemVersion = "10";
        }
      } else if (this.device.system === "macos") {
        this.device.systemVersion = this.testVs(/os x [\d._]+/ig);
      } else if (this.device.system === "android") {
        this.device.systemVersion = this.testVs(/android [\d._]+/ig);
      } else if (this.device.system === "ios") {
        this.device.systemVersion = this.testVs(/os [\d._]+/ig);
      }
    },
    checkPlatform() {
      if (this.device.system === "windows" || this.device.system === "macos" || this.device.system === "linux") {
        this.device.platform = "desktop"; // 桌面端
      } else if (this.device.system === "android" || this.device.system === "ios" || this.testUa(/mobile/ig)) {
        this.device.platform = "mobile"; // 移動端
      }
    },
    checkEngineAndSupporter() {
      if (this.testUa(/applewebkit/ig) && this.testUa(/safari/ig)) {
        this.device.engine = "webkit"; // webkit核心
        if (this.testUa(/edge/ig)) {
          this.device.supporter = "edge"; // edge瀏覽器
        } else if (this.testUa(/opr/ig)) {
          this.device.supporter = "opera"; // opera瀏覽器
        } else if (this.testUa(/chrome/ig)) {
          this.device.supporter = "chrome"; // chrome瀏覽器
        } else {
          this.device.supporter = "safari"; // safari瀏覽器
        }
      } else if (this.testUa(/gecko/ig) && this.testUa(/firefox/ig)) {
        this.device.engine = "gecko"; // gecko核心
        this.device.supporter = "firefox"; // firefox瀏覽器
      } else if (this.testUa(/presto/ig)) {
        this.device.engine = "presto"; // presto核心
        this.device.supporter = "opera"; // opera瀏覽器
      } else if (this.testUa(/trident|compatible|msie/ig)) {
        this.device.engine = "trident"; // trident核心
        this.device.supporter = "iexplore"; // iexplore瀏覽器
      }
    },
    checkEngineVersion() {
      if (this.device.engine === "webkit") {
        this.device.engineVersion = this.testVs(/applewebkit\/[\d.]+/ig);
      } else if (this.device.engine === "gecko") {
        this.device.engineVersion = this.testVs(/gecko\/[\d.]+/ig);
      } else if (this.device.engine === "presto") {
        this.device.engineVersion = this.testVs(/presto\/[\d.]+/ig);
      } else if (this.device.engine === "trident") {
        this.device.engineVersion = this.testVs(/trident\/[\d.]+/ig);
      }
    },
    checkSupporterVersion() {
      if (this.device.supporter === "chrome") {
        this.device.supporterVersion = this.testVs(/chrome\/[\d.]+/ig);
      } else if (this.device.supporter === "safari") {
        this.device.supporterVersion = this.testVs(/version\/[\d.]+/ig);
      } else if (this.device.supporter === "firefox") {
        this.device.supporterVersion = this.testVs(/firefox\/[\d.]+/ig);
      } else if (this.device.supporter === "opera") {
        this.device.supporterVersion = this.testVs(/opr\/[\d.]+/ig);
      } else if (this.device.supporter === "iexplore") {
        this.device.supporterVersion = this.testVs(/(msie [\d.]+)|(rv:[\d.]+)/ig);
      } else if (this.device.supporter === "edge") {
        this.device.supporterVersion = this.testVs(/edge\/[\d.]+/ig);
      }
    },
    checkShell() {
      if (this.testUa(/micromessenger/ig)) {
        this.device.shell = "wechat"; // 微信瀏覽器
        this.device.shellVersion = this.testVs(/micromessenger\/[\d.]+/ig);
      } else if (this.testUa(/qqbrowser/ig)) {
        this.device.shell = "qq"; // QQ瀏覽器
        this.device.shellVersion = this.testVs(/qqbrowser\/[\d.]+/ig);
      } else if (this.testUa(/ubrowser/ig)) {
        this.device.shell = "uc"; // UC瀏覽器
        this.device.shellVersion = this.testVs(/ubrowser\/[\d.]+/ig);
      } else if (this.testUa(/2345explorer/ig)) {
        this.device.shell = "2345"; // 2345瀏覽器
        this.device.shellVersion = this.testVs(/2345explorer\/[\d.]+/ig);
      } else if (this.testUa(/metasr/ig)) {
        this.device.shell = "sougou"; // 搜狗瀏覽器
      } else if (this.testUa(/lbbrowser/ig)) {
        this.device.shell = "liebao"; // 獵豹瀏覽器
      } else if (this.testUa(/maxthon/ig)) {
        this.device.shell = "maxthon"; // 遨遊瀏覽器
        this.device.shellVersion = this.testVs(/maxthon\/[\d.]+/ig);
      } else if (this.testUa(/bidubrowser/ig)) {
        this.device.shell = "baidu"; // 百度瀏覽器
        this.device.shellVersion = this.testVs(/bidubrowser [\d.]+/ig);
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
    },
  }
}