<template>
  <div>
    <!-- Modal Card -->
    <v-card>
      <!-- Modal Title -->
      <v-card-title class="text-h5 header_style d-flex align-center">Exchange Training Hours Calculator</v-card-title>
      <!-- Modal Content -->
      <v-card-text class="mt-4">
        <v-row>
          <v-col cols="6">
            <v-text-field
              label="Salary"
              v-model="salary"
              @update:model-value="salary = formatNumber(salary)"
              variant="underlined"
              prefix="$"
              maxlength="7"
            ></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field label="Hours" v-model="hours" prefix="#" variant="underlined" maxlength="3"></v-text-field>
          </v-col>
        </v-row>
        <p>
          Cost:
          <span v-if="!isNaN(parseInt(salary)) && !isNaN(parseFloat(hours))" class="font-weight-bold"
            >${{ formatNumber(getCost()) }}</span
          >
          <span v-else class="font-weight-bold">Both Fields must be valid</span>
        </p>
      </v-card-text>
      <!-- Action Button -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey-darken-3"
          variant="text"
          @click.native="
            emit('close-exchange-training-hours-calculator');
            activate = false;
          "
        >
          Close
        </v-btn>
        <v-btn
          color="green "
          variant="text"
          :disabled="isNaN(parseInt(salary)) || isNaN(parseFloat(hours))"
          @click.native="
            emit('insert-training-hours', getCost());
            activate = false;
          "
        >
          Insert Into Cost Field
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
/**
 * Mounted life cycle hook
 */
function mounted() {} // mounted

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits a message and data if it exists.
 *
 * @param msg - Message to emit
 * @param data - Data to emit
 */
function emit(msg, data) {
  if (data) {
    // data exists
    this.emitter.emit(msg, data);
  } else {
    // data does not exist
    this.emitter.emit(msg);
  }
} // emit

/**
 * Calculates the $ amount for the number of hours requested.
 * @returns Number - The $ amount
 */
function getCost() {
  return ((parseNumber(this.salary) / 52 / 5 / 8) * parseNumber(this.hours)).toFixed(2);
} // getCost

/**
 * Formats a number with commas.
 *
 * @param number - the number to format
 * @returns Number - the formatted number
 */
function formatNumber(number) {
  let num = parseNumber(number);
  return Number(num).toLocaleString().toString();
} // formatNumber

/**
 * Parses a number with commas.
 *
 * @param number - the number to parse
 * @returns Number - the parsed number
 */
function parseNumber(number) {
  return number ? number.replace(/[,\s]/g, '') : number;
} // parseNumber

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  data() {
    return {
      activate: false, // dialog activator
      hours: null,
      salary: null
    };
  },
  methods: {
    emit,
    getCost,
    formatNumber,
    parseNumber
  },
  mounted
};
</script>
