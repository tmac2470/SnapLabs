import React, { Component } from "react";
import { SET_USER, UNSET_USER } from "./constants";

export function setUser(user) {
  return {
    type: SET_USER,
    user
  };
}

export function unsetUser(user) {
  return {
    type: UNSET_USER,
    user
  };
}
