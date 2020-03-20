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
          class="mb-12"
          contain
          height="256"
          src="/img/logo.png"
        />
        <h1 class="display-4 font-weight-bold mb-6">
          Oops! 404
        </h1>

        <p class="mb-12 display-1 grey--text text--darken-2">
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