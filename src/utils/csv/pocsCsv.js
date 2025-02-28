import EmployeeCsvUtil from '@/utils/csv/employeeCsvUtil.js';
import _forEach from 'lodash/forEach';

class PocsCsv extends EmployeeCsvUtil {
  additionalColumns(index, employee, rows, i) {
    let emergencyContacts = employee.emergencyContacts?.sort((a, b) => {
      return a.primaryContact ? -1 : 1;
    });
    _forEach(emergencyContacts, (poc, index) => {
      let contactTitle = `Emergency Contact #${index + 1}`;
      if (index == 0) {
        contactTitle = 'Primary Contact';
      }
      rows[i][`${contactTitle} Name`] = poc.name;
      rows[i][`${contactTitle} Home Phone`] = poc.homePhone;
      rows[i][`${contactTitle} Mobile Phone`] = poc.mobilePhone;
      rows[i][`${contactTitle} Email`] = poc.email;
    });
  }
}

export default PocsCsv;
