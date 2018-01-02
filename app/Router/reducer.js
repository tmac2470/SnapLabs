// Reducer for the react navigation
import React, { Component } from "react";
import AppNavigator from "./routes";

const navReducer = (state, action) => {
  const newState = AppNavigator.router.getStateForAction(action, state);
  return newState || state;
};

export default navReducer;
