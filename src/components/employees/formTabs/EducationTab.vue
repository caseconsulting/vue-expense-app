<template>
  <div>
    <div v-for="degree in degrees" :key="degree.name">
      <p class="bold">Degree:</p>
      <v-combobox v-model="degree.name"></v-combobox>
      <br />
      <p>Majors:</p>
      <div v-for="(major, index) in degree.majors" :key="major">
        <v-combobox v-model="degree.majors[index]"></v-combobox>
      </div>
      <!-- Plus button  -->
      <v-icon>add</v-icon>
      <br />
      <p>Minors:</p>
      <div v-for="(minor, index) in degree.minors" :key="minor">
        <v-combobox v-model="degree.minors[index]"></v-combobox>
      </div>
      <!-- Plus button  -->
      <v-icon>add</v-icon>
      <br />

      <!-- Concentration -->
      <div v-for="(concentration, index) in degree.concentrations" :key="concentration">
        <div>Concentrations:</div>
        <v-row class="px-3" align="center">
          <!-- <p class="pr-5 mb-0" align-center text-center style="display: inline-block;">Concentration:</p> -->
          <v-combobox v-model="degree.concentrations[index]">
            <!-- Plus button  -->
            <template v-slot:append-outer>
              <v-slide-x-reverse-transition mode="out-in">
                <v-icon>delete</v-icon>
              </v-slide-x-reverse-transition>
            </template>
          </v-combobox>
        </v-row>
      </div>
      <!-- End Concentration -->

      <!-- Completion year -->
    </div>
  </div>
</template>
<script>
// /**
//  * Gets the current degrees if there are any.
//  */
// function degrees() {
//   return this.model.degrees != null ? this.model.degrees : [];
// } // degrees

async function created() {
  this.degrees = [
    {
      name: "Bachelor's of Science",
      majors: ['Math', 'Computer Science'],
      minors: ['Computer Information Systems'],
      concentrations: ['Robotics']
    },
    {
      name: "Bachelor's of Art",
      majors: ['Theater'],
      minors: [],
      concentrations: []
    }
  ];
} // created
export default {
  created,
  // computed: {
  //   degrees
  // },
  data() {
    return {
      degrees: []
    };
  },
  props: ['model']
};
</script>
