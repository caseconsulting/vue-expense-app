<template>
  <div>
    <!-- Modal Card -->
    <v-card>
      <!-- Modal Title -->
      <v-card-title class="text-h5 header_style d-flex align-center">Training Hours Calculator</v-card-title>
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
            <p class="mt-6">
              Hours:
              <span class="font-weight-bold">{{ formatNumber(getHours()) || '...' }}</span>
            </p>
          </v-col>
        </v-row>
      </v-card-text>
      <!-- Action Button -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey-darken-3"
          variant="text"
          @click.native="
            emit('close-exchange-training-hours-calculator-reverse');
            activate = false;
          "
        >
          Close
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
 * Calculates the $ amount for the number of cost requested.
 * @returns Number - The $ amount
 */
function getHours() {
  let salary = this.parseNumber(this.salary);
  let cost = this.parseNumber(this.cost);
  let factor = 2080; // exchange factor
  return ((cost * factor) / salary).toFixed(2);
} // getHours

/**
 * Formats a number with commas.
 *
 * @param number - the number to format
 * @returns Number - the formatted number
 */
function formatNumber(number) {
  if (isNaN(parseInt(this.salary))) return undefined;
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
  return number ? `${number}`.replace(/[,\s]/g, '') : number;
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
      salary: null
    };
  },
  methods: {
    emit,
    getHours,
    formatNumber,
    parseNumber
  },
  props: ['cost'],
  mounted
};
</script>
