import EmployeeCsvUtil from '@/utils/csv/employeeCsvUtil';
import _forEach from 'lodash/forEach';
import { getEmployeeCurrentContracts } from '@/shared/employeeUtils';

class PocsCsv extends EmployeeCsvUtil {
  additionalColumns(employeeIndex, employee, rows, i) {
    let emergencyContacts = employee.emergencyContacts?.sort((a, b) => {
      return a.primaryContact ? -1 : 1;
    });
    let contractNames =
      getEmployeeCurrentContracts(employee, true).map((employeeContract) => {
        return this.contracts.find((contract) => {
          return contract.id == employeeContract.contractId;
        }).contractName;
      }) || [];

    rows[i]['Contracts'] = contractNames.join(', ');

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
