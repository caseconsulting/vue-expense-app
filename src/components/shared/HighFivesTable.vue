<template>
  <p>hey</p>
</template>
<script>
import { isMobile, userRoleIsAdmin, userRoleIsManager, monthDayYearFormat, isEmpty } from '@/utils/utils';
import { getEmployeeByID, nicknameAndLastName } from '@/shared/employeeUtils';
// import api from '@/shared/api.js';
// import _ from 'lodash';
// import dateUtils from '@/shared/dateUtils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|
function created() {}

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  data() {
    return {};
  },
  methods: {
    isMobile,
    isEmpty,
    getEmployeeByID,
    monthDayYearFormat,
    nicknameAndLastName,
    userRoleIsAdmin,
    userRoleIsManager
  },
  computed: {}
};
</script>
