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
      'Prime contractor': contract.primeName || '',
      'Contract name': contract.contractName || '',
      'Project name': '',
      Directorate: contract.directorate || '',
      Status: contract.status || '',
      'PoP-Start date': contract.popStartDate || '',
      'PoP-End date': contract.popEndDate || '',
      Description: contract.description || '',
      'Active Employees': '',
      'Past Employees': ''
    });
    _forEach(contract.projects, (project) => {
      tempContracts.push({
        'Prime contractor': '',
        'Contract name': '',
        'Project name': project.projectName || '',
        Directorate: project.directorate || '',
        Status: project.status || '',
        'PoP-Start date': project.popStartDate || '',
        'PoP-End date': project.popEndDate || '',
        Description: project.description || '',
        'Active Employees': getCurrentProjectEmployees(contract, project, employees),
        'Past Employees': getPassedProjectEmployees(contract, project, employees)
      });
    });
    tempContracts.push({
      'Prime contractor': '',
      'Contract name': '',
      'Project name': '',
      Directorate: '',
      Status: '',
      'PoP-Start date': '',
      'PoP-End date': '',
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
