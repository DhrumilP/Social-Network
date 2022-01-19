import { REGISTER_FAIL, REGISTER_SUCCESS } from './types';
import { setAlert } from './alert';

import axios from 'axios';

//Register User

export const register =
  ({ name, email, password }) =>
  async dispatch => {
    const newUser = { name: name, email: email, password: password };
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const body = JSON.stringify(newUser);

    try {
      const res = await axios.post('api/users', body, config);
      dispatch({
        type: REGISTER_SUCCESS,
        payload: res.data,
      });
    } catch (err) {
      const errors = err.response.data.errors;
      if (errors) {
        errors.forEach(error => dispatch(setAlert(error.msg), 'danger'));
      }
      dispatch({
        type: REGISTER_FAIL,
      });
    }
  };
