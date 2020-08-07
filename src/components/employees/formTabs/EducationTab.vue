<template>
  <div>
    <div
      class="pt-3 px-5"
      style="border: 1px solid grey;"
      v-for="(degree, index) in model.degrees"
      :key="'degree: ' + degree.name + index"
    >
      <p class="bold">Degree:</p>
      <v-combobox v-model="degree.name">
        <!-- Delete button  -->
        <template v-slot:append-outer>
          <v-slide-x-reverse-transition mode="out-in">
            <v-icon @click="deleteDegree(index)">delete</v-icon>
          </v-slide-x-reverse-transition>
        </template>
      </v-combobox>
      <v-row
        ><v-icon class="pb-5" @click="addItem(degree.majors)">add</v-icon>
        <p>Majors:</p>
      </v-row>
      <v-row v-for="(major, index) in degree.majors" :key="'major: ' + major + index">
        <v-combobox v-model="degree.majors[index]">
          <!-- Delete button  -->
          <template v-slot:append-outer>
            <v-slide-x-reverse-transition mode="out-in">
              <v-icon @click="deleteItem(degree.majors, index)">delete</v-icon>
            </v-slide-x-reverse-transition>
          </template>
        </v-combobox>
      </v-row>
      <v-row
        ><v-icon class="pb-5" @click="addItem(degree.minors)">add</v-icon>
        <p>Minors:</p>
      </v-row>
      <v-row v-for="(minor, index) in degree.minors" :key="'minor: ' + minor + index">
        <v-combobox v-model="degree.minors[index]">
          <!-- Delete button  -->
          <template v-slot:append-outer>
            <v-slide-x-reverse-transition mode="out-in">
              <v-icon @click="deleteItem(degree.minors, index)">delete</v-icon>
            </v-slide-x-reverse-transition>
          </template>
        </v-combobox>
      </v-row>

      <!-- Concentration -->
      <v-row
        ><v-icon class="pb-5" @click="addItem(degree.concentrations)">add</v-icon>
        <p>Concentrations:</p></v-row
      >
      <v-row v-for="(concentration, index) in degree.concentrations" :key="'conc: ' + concentration + index">
        <v-row class="px-3" align="center">
          <!-- <p class="pr-5 mb-0" align-center text-center style="display: inline-block;">Concentration:</p> -->
          <v-combobox v-model="degree.concentrations[index]">
            <!-- Delete button  -->
            <template v-slot:append-outer>
              <v-slide-x-reverse-transition mode="out-in">
                <v-icon @click="deleteItem(degree.concentrations, index)">delete</v-icon>
              </v-slide-x-reverse-transition>
            </template>
          </v-combobox>
        </v-row>
      </v-row>
      <!-- End Concentration -->

      <!-- Completion year -->
    </div>
    <v-row class="pt-4" align="center" justify="center">
      <v-btn @click="addDegree()">Add a Degree<v-icon class="pl-2">add</v-icon></v-btn>
    </v-row>
  </div>
</template>
<script>
// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function addDegree() {
  this.model.degrees.push({
    name: '',
    majors: [],
    minors: [],
    concentrations: []
  });
}

function addItem(array) {
  array.push('');
}

function deleteItem(array, index) {
  array.splice(index, 1);
}

function deleteDegree(index) {
  this.model.degrees.splice(index, 1);
}

export default {
  methods: {
    addDegree,
    addItem,
    deleteDegree,
    deleteItem
  },
  props: ['model']
};
</script>
