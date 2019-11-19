import { SET_AIRPORTS } from '../constants/actionTypes';

const initialState = {
  all: {},
  visible: {},
};

export default function airportsReducer(state = initialState, action) {

  switch (action.type) {
    case SET_AIRPORTS:
      return { all : { ...state.all, ...action.payload }, visible: action.payload};

    default:
      return state;
  }
}
