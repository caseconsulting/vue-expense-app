import _find from 'lodash/find';
import _forEach from 'lodash/forEach';
import _map from 'lodash/map';
import store from '../../store/index';

/**
 * Custom filter for employee table/dropdown searching
 *
 * @param __ - unused value (in theory the current item of employee to search)
 * @param search - The search value in the search bar
 * @param item - The item in the table
 * @returns Boolean - True if the item matches the search criteria
 */
export function employeeFilter(__, search, item) {
  item = item?.raw || item;
  item.id = item.id || item.value;
  item = _find(store.getters.employees, (e) => e.id === item.id);

  if (!item) return false;

  /**
   * Bounce conditions:
   *  - nothing is being searched
   *  - the search is only one character and one term
   *  - searching something that's not the employee object
   *  - the employee has been searched before
   */
  let terms = search.split(','); // used for searching later, search is split by comma
  if (search === null || (terms.length === 1 && terms[0].length < 2)) return true;

  // different items from the employee to look through
  let [frst, midl, last, nick, email, F, M, N, L] = [
    item.firstName?.trim(),
    item.middleName?.trim(),
    item.lastName?.trim(),
    item.nickname?.trim(),
    item.email ? item.email.trim()?.split('@')?.[0] : '',
    item.firstName ? item.firstName.trim()[0] : '',
    item.middleName ? item.middleName.trim()[0] : '',
    item.nickname ? item.nickname.trim()[0] : '',
    item.lastName ? item.lastName.trim()[0] : ''
  ];
  let searchableTerms = [
    `${item.employeeNumber}`,
    `${email}`,
    `${frst} ${last}`,
    `${last} ${frst}`,
    `${frst} ${midl} ${last}`,
    `${frst} ${nick} ${last}`,
    `${frst} ${nick} ${midl} ${last}`,
    `${frst} ${midl} ${nick} ${last}`,
    `${F}${M}${L}`,
    `${F}${N}${L}`,
    `${F}${M}${N}${L}`,
    `${F}${N}${M}${L}`,
    `${F} ${L}`,
    `${L} ${F}`,
    `${F} ${N} ${last}`,
    `${F} ${M} ${last}`,
    `${F} ${N} ${M} ${last}`,
    `${F} ${M} ${N} ${last}`,
    `${frst} ${M} ${last}`,
    `${frst} ${N} ${last}`,
    `${frst} ${N} ${M} ${last}`,
    `${frst} ${M} ${N} ${last}`
  ];

  // search through all searchable terms with all search terms
  for (let t of terms) {
    t = t.toLowerCase().trim();
    if (t.length < 2) continue;
    for (let s of searchableTerms) {
      s = s.toLowerCase();
      if (s && s.includes(t)) {
        return true;
      }
    }
  }

  return false;
} // employeeFilter

export function contractFilter(__, search, item) {
  item = item?.raw || item;
  item.id = item.id || item.value;
  item = _find(store.getters.contracts, (e) => e.id === item.id);

  if (!item) return false;

  /**
   * Bounce conditions:
   *  - nothing is being searched
   *  - the search is only one character and one term
   *  - searching something that's not the employee object
   *  - the employee has been searched before
   */
  let terms = search.split(','); // used for searching later, search is split by comma
  if (search === null || (terms.length === 1 && terms[0].length < 2)) return true;
  let employees = [];
  _forEach(store.getters.employees, (e) => {
    if (_find(e.contracts, (c) => c.contractId === item.id)) {
      employees.push(`${e.firstName} ${e.lastName}`);
      if (e.nickname) employees.push(`${e.nickname} ${e.lastName}`);
    }
  });
  let searchableTerms = [
    `${item.primeName}`,
    `${item.contractName}`,
    `${item.primeName} ${item.contractName}`,
    `${item.contractName} ${item.primeName}`,
    `${item.directorate}`,
    `${item.org2}`,
    `${item.org3}`,
    `${item.description}`,
    `${_map(item.projects, (p) => p.projectName)?.join('')}`,
    `${_map(item.projects, (p) => p.directorate)?.join('')}`,
    `${_map(item.projects, (p) => p.org2)?.join('')}`,
    `${_map(item.projects, (p) => p.org3)?.join('')}`,
    `${_map(item.projects, (p) => p.location)?.join('')}`,
    `${_map(item.projects, (p) => p.workType)?.join('')}`,
    `${_map(item.projects, (p) => p.description)?.join('')}`,
    `${employees.join('')}`
  ];
  // search through all searchable terms with all search terms
  for (let t of terms) {
    t = t.toLowerCase().trim();
    if (t.length < 2) continue;
    for (let s of searchableTerms) {
      s = s.toLowerCase();
      if (s && s.includes(t)) {
        return true;
      }
    }
  }

  return false;
}

export default {
  employeeFilter,
  contractFilter
};
