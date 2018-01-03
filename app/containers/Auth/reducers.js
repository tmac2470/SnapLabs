import { UNSET_USER, SET_USER } from "./constants";

const initialUserState = {
  email: "",
  username: "",
  isLoggedIn: false
};

export function userReducer(user = initialUserState, action) {
  switch (action.type) {
    case SET_USER:
      user = action.user;
      user.isLoggedIn = true;
      return user;

    default:
      return user;
  }
}
