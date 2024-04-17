import v from '@/shared/validationUtils.js';
const groupWidth = { width: '300', minWidth: '300', maxWidth: '300' };
const nonGroupWidth = { width: '180', minWidth: '180', maxWidth: '180' };
import { TYPES } from './fieldTypes.js';

// |--------------------------------------------------|
// |                                                  |
// |               NON-GROUPED FIELDS                 |
// |                                                  |
// |--------------------------------------------------|

export const NAME = {
  title: 'Name',
  key: 'name',
  fixed: true,
  infoType: TYPES.DEFAULT,
  ...nonGroupWidth
};

export const EMPLOYEE_NUMBER = {
  title: 'Employee Number',
  key: 'employeeNumber',
  selected: true,
  editType: TYPES.DEFAULT,
  infoType: TYPES.DEFAULT,
  rules: [v.getRequiredRules(), v.getNumberRules(), v.duplicateEmployeeNumberRule()].flat(),
  ...nonGroupWidth
};

export const AIN = {
  title: 'AIN',
  key: 'agencyIdentificationNumber',
  selected: false,
  editType: TYPES.DEFAULT,
  infoType: TYPES.DEFAULT,
  ...nonGroupWidth
};

export const WORK_STATUS = {
  title: 'Work Status',
  key: 'workStatus',
  selected: true,
  editType: TYPES.CUSTOM,
  infoType: TYPES.CUSTOM,
  ...nonGroupWidth
};

export const HIRE_DATE = {
  title: 'Hire Date',
  key: 'hireDate',
  selected: true,
  editType: TYPES.DATE_MMDDYYYY,
  infoType: TYPES.DATE_MMDDYYYY,
  rules: [v.getDateRules()].flat(),
  ...nonGroupWidth
};

export const DEPARTURE_DATE = {
  title: 'Departure Date',
  key: 'deptDate',
  selected: false,
  editType: TYPES.DATE_MMDDYYYY,
  infoType: TYPES.DATE_MMDDYYYY,
  ...nonGroupWidth
};

export const BIRTHDAY = {
  title: 'Birthday',
  key: 'birthday',
  selected: false,
  editType: TYPES.DATE_MMDDYYYY,
  infoType: TYPES.DATE_MMDDYYYY,
  ...nonGroupWidth
};

export const JOB_ROLE = {
  title: 'Job Role',
  key: 'jobRole',
  selected: true,
  editType: TYPES.CUSTOM,
  infoType: TYPES.DEFAULT,
  ...nonGroupWidth
};

export const EMPLOYEE_ROLE = {
  title: 'Employee Role',
  key: 'employeeRole',
  selected: false,
  editType: TYPES.CUSTOM,
  infoType: TYPES.DEFAULT,
  ...nonGroupWidth
};

// |--------------------------------------------------|
// |                                                  |
// |                  GROUPED FIELDS                  |
// |                                                  |
// |--------------------------------------------------|

export const AWARDS = {
  title: 'Awards',
  key: 'awards',
  selected: false,
  group: true,
  editType: TYPES.CUSTOM,
  infoType: TYPES.CUSTOM,
  ...groupWidth
};

export const CERTIFICATIONS = {
  title: 'Certifications',
  key: 'certifications',
  selected: false,
  group: true,
  editType: TYPES.CUSTOM,
  infoType: TYPES.CUSTOM,
  ...groupWidth
};

export const CLEARANCES = {
  title: 'Clearances',
  key: 'clearances',
  selected: false,
  group: true,
  editType: TYPES.CUSTOM,
  infoType: TYPES.CUSTOM,
  ...groupWidth
};

export const COMPANIES = {
  title: 'Companies',
  key: 'companies',
  selected: false,
  group: true,
  editType: TYPES.CUSTOM,
  infoType: TYPES.CUSTOM,
  ...groupWidth
};

export const CONTRACTS = {
  title: 'Contracts',
  key: 'contracts',
  selected: false,
  group: true,
  editType: TYPES.CUSTOM,
  infoType: TYPES.CUSTOM,
  ...groupWidth
};

export const CUSTOMER_ORG_EXP = {
  title: 'Customer Org Exp',
  key: 'customerOrgExp',
  selected: false,
  group: true,
  editType: TYPES.CUSTOM,
  infoType: TYPES.CUSTOM,
  ...groupWidth
};

export const EDUCATION = {
  title: 'Education',
  key: 'educations',
  selected: false,
  group: true,
  editType: TYPES.CUSTOM,
  infoType: TYPES.CUSTOM,
  ...groupWidth
};

export const IC_TIME_FRAMES = {
  title: 'IC Time Frames',
  key: 'icTimeFrames',
  selected: false,
  group: true,
  editType: TYPES.CUSTOM,
  infoType: TYPES.CUSTOM,
  ...groupWidth
};

export const LANGUAGES = {
  title: 'Languages',
  key: 'languages',
  selected: false,
  group: true,
  editType: TYPES.CUSTOM,
  infoType: TYPES.CUSTOM,
  ...groupWidth
};

export const TECHNOLOGIES = {
  title: 'Technologies',
  key: 'technologies',
  selected: false,
  group: true,
  editType: TYPES.CUSTOM,
  infoType: TYPES.CUSTOM,
  ...groupWidth
};

export const SOCIAL = {
  title: 'Social',
  key: 'social',
  selected: false,
  group: true,
  editType: TYPES.CUSTOM,
  infoType: TYPES.CUSTOM,
  subkeys: ['twitter', 'linkedIn', 'github'],
  ...groupWidth
};

export const PLACE_OF_BIRTH = {
  title: 'Place of Birth',
  key: 'placeOfBirth',
  selected: false,
  group: true,
  editType: TYPES.CUSTOM,
  infoType: TYPES.CUSTOM,
  subkeys: ['city', 'country', 'st'],
  ...groupWidth
};

export const ADDRESS = {
  title: 'Address',
  key: 'address',
  selected: false,
  group: true,
  editType: TYPES.CUSTOM,
  infoType: TYPES.CUSTOM,
  subkeys: ['currentStreet', 'currentStreet2', 'currentCity', 'currentState', 'currentZIP'],
  ...groupWidth
};

export const PHONE_NUMBERS = {
  title: 'Phone Numbers',
  key: 'phoneNumbers',
  selected: false,
  group: true,
  editType: TYPES.CUSTOM,
  infoType: TYPES.CUSTOM,
  ...groupWidth
};

// |--------------------------------------------------|
// |                                                  |
// |                      EXTRA                       |
// |                                                  |
// |--------------------------------------------------|

export const BLANK = { title: '', key: '', width: '100%' };

export default {
  NAME,
  EMPLOYEE_NUMBER,
  AIN,
  WORK_STATUS,
  HIRE_DATE,
  DEPARTURE_DATE,
  BIRTHDAY,
  JOB_ROLE,
  EMPLOYEE_ROLE,
  AWARDS,
  CERTIFICATIONS,
  CLEARANCES,
  COMPANIES,
  CONTRACTS,
  CUSTOMER_ORG_EXP,
  EDUCATION,
  IC_TIME_FRAMES,
  LANGUAGES,
  TECHNOLOGIES,
  SOCIAL,
  PLACE_OF_BIRTH,
  ADDRESS,
  PHONE_NUMBERS,
  BLANK
};
