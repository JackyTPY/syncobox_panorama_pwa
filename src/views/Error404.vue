<template>
  <v-app>
    <v-container fill-height style="height: calc(100vh - 58px);">
      <v-layout align-center justify-center>
        <v-flex text-center sm10 md6>
          <v-img src="/image/error404.png"></v-img>
          <h1 class="titile-error404 primary--text mb-3">{{ $t("Whoops_404") }}</h1>
          <p>{{ $t("the_page_you_were_looking_for_does_not_exist") }}</p>
        </v-flex>
      </v-layout>
    </v-container>
  </v-app>
</template>

<script>
export default {
  name: "FourOhFour",
  props: {
    lang: {
      type: String,
      default: "en"
    }
  },
  created() {
    this.$ssrContext && this.$ssrContext.res.status(404);
  }
};
</script>

<style>
.titile-error404 {
  font-size: 48px;
}
</style>
