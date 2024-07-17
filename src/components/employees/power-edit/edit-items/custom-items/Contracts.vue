<template>
  <div>
    <!-- Name of Contract -->
    <v-select
      ref="formFields"
      v-model="contract.contractName"
      :rules="[...getRequiredRules(), duplicateContractPrimeCombo(index)]"
      :items="getContractsDropdownItems(contract)"
      @update:model-value="
        editedContracts.push(0); // force re-render for the items prop
        editedContracts.pop(0);
      "
      label="Contract"
      variant="underlined"
      data-vv-name="Contract"
      clearable
    >
    </v-select>
    <!-- Name of Prime -->
    <v-select
      ref="formFields"
      v-model="contract.primeName"
      :rules="getRequiredRules()"
      :items="getPrimesDropdownItems(contract)"
      @update:model-value="
        editedContracts.push(0); // force re-render for the items prop
        editedContracts.pop(0);
      "
      label="Prime"
      variant="underlined"
      data-vv-name="Prime"
      clearable
    >
    </v-select>
    <!-- Current Address: City -->
    <v-text-field
      v-model.trim="cityModel"
      hide-details
      label="City"
      variant="underlined"
      class="d-inline-block field mr-4"
    ></v-text-field>
    <!-- Current Address: State -->
    <v-autocomplete
      v-model="stateModel"
      :items="Object.values(STATES)"
      hide-details
      label="State"
      variant="underlined"
      class="d-inline-block field mr-4"
    ></v-autocomplete>
    <!-- Current Address: ZIP -->
    <v-text-field
      v-model.trim="ZIPModel"
      hide-details
      v-mask="'#####'"
      label="ZIP"
      variant="underlined"
      class="d-inline-block small-field"
    ></v-text-field>
  </div>
</template>

<script setup>
import _ from 'lodash';
import { inject, ref, watch } from 'vue';
import { getRequiredRules } from '@/shared/validationUtils';
import { getContractsDropdownItems } from '@/shared/contractUtils';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['field', 'item']);
const emitter = inject('emitter');

const contracts = ref(_.cloneDeep(props.item[props.field.key]));
const model = ref(
  props.item[props.field.key]?.[0] || {
    contractId: null,
    projects: [
      {
        projectId: null,
        endDate: null,
        presentDate: false,
        startDate: null
      }
    ]
  }
);

// |--------------------------------------------------|
// |                                                  |
// |                      WATCH                       |
// |                                                  |
// |--------------------------------------------------|

watch(
  () => [model.value],
  () => {
    emitter.emit('update-item', {
      field: props.field,
      item: {
        ...props.item,
        [`${props.field.key}`]: contracts.value
      }
    });
  }
);

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|
</script>

<style scoped>
.field {
  width: 200px !important;
  min-width: 200px !important;
  max-width: 200px !important;
}
.small-field {
  width: 150px !important;
  min-width: 150px !important;
  max-width: 150px !important;
}
</style>
