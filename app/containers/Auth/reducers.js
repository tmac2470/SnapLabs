import { UNSET_USER, SET_USER } from "./constants";

const initialUserState = {
  username: "",
  email: "",
  isLoggedIn: false
};

export function userReducer(user = initialUserState, action) {
  switch (action.type) {
    case SET_USER:
      user = action.user;
      return {
        ...user,
        isLoggedIn: true
      };

    case UNSET_USER:
      return {
        ...user,
        isLoggedIn: false
      };

    default:
      return user;
  }
}
