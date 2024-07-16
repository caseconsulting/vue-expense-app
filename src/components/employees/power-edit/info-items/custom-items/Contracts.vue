<template>
  <div>
    <span v-if="getCurrentContractInfo">
      {{ getCurrentContractInfo.contractName }}, {{ getCurrentContractInfo.primeName }},
      {{ getCurrentProjectInfo.projectName }}
    </span>
  </div>
</template>

<script setup>
// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

import _ from 'lodash';
import { computed, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { updateStoreContracts } from '../../../../../utils/storeUtils';

const props = defineProps(['field', 'item']);
const store = useStore();

onBeforeMount(async () => {
  !store.getters.contracts ? await updateStoreContracts() : _;
});

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const getCurrentContractInfo = computed(() => {
  let contractInfo = _.find(store.getters.contracts, (c) => c.id === getEmployeeCurrentContract.value?.contractId);
  return contractInfo;
});

const getCurrentProjectInfo = computed(() => {
  let projectInfo = _.find(
    getCurrentContractInfo.value?.projects,
    (p) => p.id === getEmployeeCurrentProject.value?.projectId
  );
  return projectInfo;
});

const getEmployeeCurrentContract = computed(() => {
  let currentContract = _.find(props.item.contracts, (c) => _.find(c.projects, (p) => !p.endDate));
  return currentContract;
});

const getEmployeeCurrentProject = computed(() => {
  let currentContract = _.find(props.item.contracts, (c) => _.find(c.projects, (p) => !p.endDate));
  let currentProject = _.find(currentContract?.projects, (p) => !p.endDate);
  return currentProject;
});
</script>
