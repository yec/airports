import { combineReducers } from 'redux';
import airports from './airportsReducer';

const rootReducer = combineReducers({
  airports,
});

export default rootReducer;
