import { SET_AIRPORTS } from '../constants/actionTypes';

const initialState = {
  all: {},
  range: {},
  visible: {},
};

export default function airportsReducer(state = initialState, action) {

  switch (action.type) {
    case SET_AIRPORTS:
      var range = {};
      Object.values(action.payload).forEach((airport) => {
        range["" + airport.delta] = airport;
      });
      return { all : { ...state.all, ...action.payload }, range : { ...state.range, ...range}, visible: action.payload};

    default:
      return state;
  }
}
