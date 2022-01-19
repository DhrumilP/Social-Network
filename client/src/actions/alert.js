import { SET_ALERT, REMOVE_ALERT } from './types';
import uuid from 'uuid';

export const setALert = (msg, alertType) => dispatch => {
  const id = uuid.v4();
  dispatch({
    type: SET_ALERT,
    payload: {
      id,
      alertType,
      msg,
    },
  });
};
