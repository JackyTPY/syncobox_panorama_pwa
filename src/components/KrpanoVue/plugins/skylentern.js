import Vue from 'vue';

export default {
  init: function() {
    window.Event = new (class {
      constructor() {
        this.vue = new Vue();
      }
      fire(event, arg1 = null, arg2 = null, arg3 = null) {
        this.vue.$emit(event, arg1, arg2, arg3);
      }
      listen(event, callback) {
        this.vue.$on(event, callback);
      }
    })();
  }
}