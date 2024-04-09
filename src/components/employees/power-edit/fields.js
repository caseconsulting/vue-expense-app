//const v = require('@/shared/validationUtils.js');
const groupWidth = { width: '300', minWidth: '300', maxWidth: '300' };
const nonGroupWidth = { width: '180', minWidth: '180', maxWidth: '180' };

// prettier-ignore
export const TYPES = { DEFAULT: '0', DATE_MMYYYY: '1', DATE_MMDDYYYY: '2', CUSTOM: '3' };
// prettier-ignore
export let fields = [
  // non-grouped fields
  { title: 'Name', fixed: true, key: 'name', selected: true, infoType: TYPES.DEFAULT, ...nonGroupWidth },
  { title: 'Employee Number', key: 'employeeNumber', selected: true, editType: TYPES.DEFAULT, infoType: TYPES.DEFAULT, ...nonGroupWidth },
  { title: 'AIN', key: 'agencyIdentificationNumber', selected: false, editType: TYPES.DEFAULT, infoType: TYPES.DEFAULT, ...nonGroupWidth },
  { title: 'Work Status', key: 'workStatus', selected: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM, ...nonGroupWidth },
  { title: 'Hire Date', key: 'hireDate', selected: true, editType: TYPES.DATE_MMDDYYYY, infoType: TYPES.DATE_MMDDYYYY, ...nonGroupWidth },
  { title: 'Departure Date', key: 'deptDate', selected: false, editType: TYPES.DATE_MMDDYYYY, infoType: TYPES.DATE_MMDDYYYY, ...nonGroupWidth },
  { title: 'Birthday', key: 'birthday', selected: false, editType: TYPES.DATE_MMDDYYYY, infoType: TYPES.DATE_MMDDYYYY, ...nonGroupWidth },
  { title: 'Job Role', key: 'jobRole', selected: true, editType: TYPES.CUSTOM, infoType: TYPES.DEFAULT, ...nonGroupWidth },
  { title: 'Employee Role', key: 'employeeRole', selected: false, editType: TYPES.CUSTOM, infoType: TYPES.DEFAULT, ...nonGroupWidth },
  // grouped fields (will fill an expanded row in the data table for editing purposes)
  { title: 'Awards', key: 'awards', selected: false, group: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM, ...groupWidth },
  { title: 'Certifications', key: 'certifications', selected: false, group: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM, ...groupWidth },
  { title: 'Clearances', key: 'clearances', selected: false, group: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM, ...groupWidth },
  { title: 'Companies', key: 'companies', selected: false, group: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM, ...groupWidth },
  { title: 'Contracts', key: 'contracts', selected: false, group: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM, ...groupWidth },
  { title: 'Customer Org Exp', key: 'customerOrgExp', selected: false, group: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM, ...groupWidth },
  { title: 'Education', key: 'educations', selected: false, group: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM, ...groupWidth },
  { title: 'IC Time Frames', key: 'icTimeFrames', selected: false, group: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM, ...groupWidth },
  { title: 'Languages', key: 'languages', selected: false, group: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM, ...groupWidth },
  { title: 'Technologies', key: 'technologies', selected: false, group: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM, ...groupWidth },
  { title: 'Social', key:'social', selected: false, group: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM, ...groupWidth },
  { title: 'Place of Birth', key: 'placeOfBirth', selected: false, group: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM, ...groupWidth },
  { title: 'Address', key: 'address', selected: false, group: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM, ...groupWidth },
  { title: 'Phone Numbers', key: 'phoneNumbers', selected: false, group: true, editType: TYPES.CUSTOM, infoType: TYPES.CUSTOM, ...groupWidth },
  // blank item to fill the rest of the data table, helps keep the table compact
  { title: '', key: '', width: '100%', selected: true }
];
