import _forEach from 'lodash/forEach';
import _orderBy from 'lodash/orderBy';
import { nicknameAndLastName } from '@/shared/employeeUtils.js';
import { getProjectCurrentEmployees, getProjectPastEmployees } from '@/shared/contractUtils.js';
import csvUtils from './baseCsv.js';

export function download(contracts, employees) {
  let filename = 'contracts.csv';
  let convertedContracts = convertContracts(contracts, employees);
  let csvFileString = csvUtils.generate(convertedContracts);
  csvUtils.download(csvFileString, filename);
}

export function convertContracts(contracts, employees) {
  let tempContracts = [];
  contracts = _orderBy(contracts, ['primeName'], ['asc']);
  _forEach(contracts, (contract) => {
    tempContracts.push({
      'Prime Contractor': contract.primeName || '',
      'Contract Name': contract.contractName || '',
      'Project Name': '',
      'Customer Org': contract.customerOrg || '',
      Directorate: contract.directorate || '',
      'Org 2': contract.org2 || '',
      'Org 3': contract.org3 || '',
      Location: contract.location || '',
      'Work Type': contract.workType || '',
      Status: contract.status || '',
      'PoP-Start Date': contract.popStartDate || '',
      'PoP-End Date': contract.popEndDate || '',
      Description: contract.description || '',
      'Active Employees': '',
      'Past Employees': ''
    });
    _forEach(contract.projects, (project) => {
      tempContracts.push({
        'Prime Contractor': '',
        'Contract Name': '',
        'Project Name': project.projectName || '',
        'Customer Org': project.customerOrg || '',
        Directorate: project.directorate || '',
        'Org 2': project.org2 || '',
        'Org 3': project.org3 || '',
        Location: project.location || '',
        'Work Type': project.workType || '',
        Status: project.status || '',
        'PoP-Start Date': project.popStartDate || '',
        'PoP-End Date': project.popEndDate || '',
        Description: project.description || '',
        'Active Employees': getCurrentProjectEmployees(contract, project, employees),
        'Past Employees': getPassedProjectEmployees(contract, project, employees)
      });
    });
    tempContracts.push({
      'Prime Contractor': '',
      'Contract Name': '',
      'Project Name': '',
      'Customer Org': '',
      Directorate: '',
      'Org 2': '',
      'Org 3': '',
      Location: '',
      'Work Type': '',
      Status: '',
      'PoP-Start Date': '',
      'PoP-End Date': '',
      Description: '',
      'Active Employees': '',
      'Past Employees': ''
    });
  });
  return tempContracts;
}

/**
 * Gets the projects current employees in the form of a comma-separated list.
 */
function getCurrentProjectEmployees(contract, project, employees) {
  let employeesList = [];
  _forEach(getProjectCurrentEmployees(contract, project, employees), (employee) => {
    employeesList.push(nicknameAndLastName(employee));
  });
  return employeesList.join(', ');
} // getCurrentProjectEmployees

/**
 * Gets the projects passed employees in the form of a comma-separated list.
 */
function getPassedProjectEmployees(contract, project, employees) {
  let employeesList = [];
  _forEach(getProjectPastEmployees(contract, project, employees), (employee) => {
    employeesList.push(nicknameAndLastName(employee));
  });
  return employeesList.join(', ');
} // getPassedProjectEmployees

export default {
  download,
  convertContracts
};
