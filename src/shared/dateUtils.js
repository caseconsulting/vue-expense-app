import moment from 'moment';

function formatDate(date) {
  if (!date) return null;
  else {
    const [year, month, day] = date.split('-');
    if (moment(`${month}/${day}/${year}`, 'MM/DD/YYYY', true).isValid()) {
      return `${month}/${day}/${year}`;
    } else {
      return null;
    }
  }
}

function parseDate(date) {
  if (!date) return null;
  else {
    const [month, day, year] = date.split('/');
    if (month != undefined && day != undefined && year != undefined) {
      if (year <= 40) {
        return `${year.padStart(4, '20')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      } else {
        return `${year.padStart(4, '19')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    } else {
      return date;
    }
  }
}

export default {
  formatDate,
  parseDate
};
