import { SET_USER } from "./constants";

const initialState = {
  user: {}
};

export default function auth(state = initialState, action) {
  switch (action.type) {
    case SET_USER:
      state.user = action.user;
      return state;

    default:
      return state;
  }
}
