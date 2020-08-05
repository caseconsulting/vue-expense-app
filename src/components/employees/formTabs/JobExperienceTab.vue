<template>
  <div>
    Experience in IC:
    <div class="yearsBox">
      <input type="text" oninput="this.value = this.value.replace(/[^0-9]/g, '');" maxlength="2" />
      years
    </div>
    <div class="pb-7">
      <p>Case:</p>
      <!-- Start date -->
      <v-menu
        :close-on-content-click="true"
        :nudge-right="40"
        transition="scale-transition"
        offset-y
        max-width="290px"
        min-width="290px"
        style="padding-right: 20px; padding-bottom: 20px;"
      >
        <template v-slot:activator="{ on }">
          <v-text-field
            label="Start Date"
            hint="MM/DD/YYYY format"
            persistent-hint
            prepend-icon="event"
            v-on="on"
          ></v-text-field>
        </template>
        <v-date-picker no-title></v-date-picker>
      </v-menu>
    </div>
    <!-- Plus button  -->
    <!-- If user adds another -->
    <div class="py-2">
      <!-- company  -->
      <p class="pr-3" style="display: inline-block;">Company:</p>
      <v-autocomplete style="display: inline-block; width: 80%;"></v-autocomplete>
      <br />
      <!-- start date -->
      <v-menu
        :close-on-content-click="true"
        :nudge-right="40"
        transition="scale-transition"
        offset-y
        max-width="290px"
        min-width="290px"
        style="padding-right: 20px; padding-bottom: 20px;"
      >
        <template v-slot:activator="{ on }">
          <v-text-field
            label="Start Date"
            hint="MM/DD/YYYY format"
            persistent-hint
            prepend-icon="event"
            v-on="on"
          ></v-text-field>
        </template>
        <v-date-picker no-title></v-date-picker>
      </v-menu>
      <!-- end date -->
      <v-menu
        :close-on-content-click="true"
        :nudge-right="40"
        transition="scale-transition"
        offset-y
        max-width="290px"
        min-width="290px"
        style="padding-right: 20px; padding-bottom: 20px;"
      >
        <template v-slot:activator="{ on }">
          <v-text-field
            label="End Date"
            hint="MM/DD/YYYY format"
            persistent-hint
            prepend-icon="event"
            v-on="on"
          ></v-text-field>
        </template>
        <v-date-picker no-title></v-date-picker>
      </v-menu>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      value: 0
    };
  }
};
</script>
<style>
.yearsBox {
  border: solid 1px gray;
  width: 46px;
  height: 34px;
  border-radius: 2px;
  font-size: 14px;
  display: flex;
}
</style>
