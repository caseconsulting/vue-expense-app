const v = require('@/shared/validationUtils.js');

// prettier-ignore
export const TYPES = { DEFAULT: '0', DATE_MMYYYY: '1', DATE_MMDDYYYY: '2', CUSTOM: '3' };
// prettier-ignore
export let fields = [
  { title: 'Name', key: 'name', selected: true, infoType: TYPES.DEFAULT, width: '250', minWidth: '250' },
  { title: 'Employee Number', key: 'employeeNumber', selected: true, editType: TYPES.DEFAULT, infoType: TYPES.DEFAULT, width: '250', minWidth: '250' },
  { title: 'AIN', key: 'agencyIdentificationNumber', selected: false, editType: TYPES.DEFAULT, infoType: TYPES.DEFAULT, width: '250', minWidth: '250' },
  { title: 'Work Status', key: 'workStatus', selected: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM, width: '250', minWidth: '250' },
  { title: 'Hire Date', key: 'hireDate', selected: true, editType: TYPES.DATE_MMDDYYYY, infoType: TYPES.DATE_MMDDYYYY, width: '250', minWidth: '250' },
  { title: 'Departure Date', key: 'deptDate', selected: false, editType: TYPES.DATE_MMDDYYYY, infoType: TYPES.DATE_MMDDYYYY, width: '250', minWidth: '250' },
  { title: 'Birthday', key: 'birthday', selected: false, editType: TYPES.DATE_MMDDYYYY, infoType: TYPES.DATE_MMDDYYYY, width: '250', minWidth: '250' },
  { title: 'Job Role', key: 'jobRole', selected: true, editType: TYPES.CUSTOM, infoType: TYPES.DEFAULT, width: '250', minWidth: '250' },
  { title: 'Employee Role', key: 'employeeRole', selected: false, editType: TYPES.CUSTOM, infoType: TYPES.DEFAULT, width: '250', minWidth: '250' },
  // grouped fields (will fill an expanded row in the data table for editing purposes)
  { title: 'Awards', key: 'awards', selected: false, group: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM },
  { title: 'Certifications', key: 'certifications', selected: false, group: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM },
  { title: 'Clearances', key: 'clearances', selected: false, group: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM },
  { title: 'Companies', key: 'companies', selected: false, group: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM },
  { title: 'Contracts', key: 'contracts', selected: false, group: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM },
  { title: 'Customer Org Exp', key: 'customerOrgExp', selected: false, group: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM },
  { title: 'Education', key: 'educations', selected: false, group: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM },
  { title: 'IC Time Frames', key: 'icTimeFrames', selected: false, group: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM },
  { title: 'Languages', key: 'languages', selected: false, group: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM },
  { title: 'Technologies', key: 'technologies', selected: false, group: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM },
  { title: 'Social', key:'social', selected: false, group: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM },
  { title: 'Place of Birth', key: 'placeOfBirth', selected: false, group: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM },
  { title: 'Address', key:'address', selected: false, group: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM },
  { title: 'Phone Numbers', key:'phoneNumbers', selected: false, group: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM }
];
