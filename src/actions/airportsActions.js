import {
  SET_AIRPORTS,
} from '../constants/actionTypes';

export function setAirports (airports) {
  return {
    type: SET_AIRPORTS,
    payload: airports
  }
}
