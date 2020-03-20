<template>
  <v-container class="fill-height">
    <v-row
      class="mt-n12"
      justify="center"
    >
      <v-col
        class="text-center"
        cols="auto"
      >
        <v-img
          :class="{'mb-6': $vuetify.breakpoint.smAndDown, 'mb-12': $vuetify.breakpoint.mdAndUp}"
          contain
          height="256"
          src="/img/404.png"
        />

        <h1 class="mb-6 font-weight-bold" :class="{'display-3': $vuetify.breakpoint.smAndDown, 'display-4': $vuetify.breakpoint.mdAndUp}">
          Oops! 404
        </h1>

        <p class="mb-12 grey--text text--darken-2" :class="{'headline': $vuetify.breakpoint.smAndDown, 'display-1': $vuetify.breakpoint.mdAndUp}">
          There is no panorama here
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "404 Page"
}
</script>