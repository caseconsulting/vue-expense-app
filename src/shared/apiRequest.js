import axios from 'axios';

function get(type) {
    return axios.get(`http://localhost:3000/${type}`)
    .then(response => {
      // JSON responses are automatically parsed.
      return response.data
    })
    .catch(e => {
      this.errors.push(e)
    })
}

export default {
    get
}