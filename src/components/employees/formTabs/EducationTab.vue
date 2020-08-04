<template>
  <div>
    <p>Degree:</p>
    <v-autocomplete></v-autocomplete>
    <br />
    <p>Major:</p>
    <v-autocomplete></v-autocomplete>
    <!-- Plus button  -->
    <v-icon>add</v-icon>
    <br />
    <p>Minor:</p>
    <v-autocomplete></v-autocomplete>
    <!-- Plus button  -->
    <v-icon>add</v-icon>
    <br />

    <!-- Concentration -->
    <div>Concentration:</div>
    <v-row class="px-3" align="center">
      <!-- <p class="pr-5 mb-0" align-center text-center style="display: inline-block;">Concentration:</p> -->
      <v-autocomplete>
        <!-- Plus button  -->
        <template v-slot:append-outer>
          <v-slide-x-reverse-transition mode="out-in">
            <v-icon>delete</v-icon>
          </v-slide-x-reverse-transition>
        </template>
      </v-autocomplete>
    </v-row>
    <!-- End Concentration -->

    <!-- Completion year -->
  </div>
</template>
<script>
export default {
  data() {
    return {
      props: ['model']
    };
  }
};
</script>
