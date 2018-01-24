import {
  DOWNLOAD_INVESTIGATION_SUCCESS,
  DELETE_INVESTIGATION
} from "./constants";
import { REHYDRATE } from 'redux-persist';

import Balloon_Pressure_Investigation from "../../../../data/investigations/Balloon_Pressure_Investigation.json";
import Classroom_Heat_and_Light_Investigation from "../../../../data/investigations/Classroom_Heat_and_Light_Investigation.json";
import Investigating_the_SensorTags from "../../../../data/investigations/Investigating_the_SensorTags.json";
import Magnetic_Mining_Investigation from "../../../../data/investigations/Magnetic_Mining_Investigation.json";
import Rocket_Acceleration_Investigation from "../../../../data/investigations/Rocket_Acceleration_Investigation.json";
import Thermal_Conductivity from "../../../../data/investigations/Thermal_Conductivity.json";

const initialLocalInvestigationsState = {
  [Balloon_Pressure_Investigation._id]: {
    ...Balloon_Pressure_Investigation,
    isLocal: true
  },
  [Classroom_Heat_and_Light_Investigation._id]: {
    ...Classroom_Heat_and_Light_Investigation,
    isLocal: true
  },
  [Investigating_the_SensorTags._id]: {
    ...Investigating_the_SensorTags,
    isLocal: true
  },
  [Magnetic_Mining_Investigation._id]: {
    ...Magnetic_Mining_Investigation,
    isLocal: true
  },
  [Rocket_Acceleration_Investigation._id]: {
    ...Rocket_Acceleration_Investigation,
    isLocal: true
  },
  [Thermal_Conductivity._id]: {
    ...Thermal_Conductivity,
    isLocal: true
  }
};

export function localInvestigationsReducer(
  initial = initialLocalInvestigationsState,
  action
) {
  const { investigation } = action;

  switch (action.type) {
    case REHYDRATE:
      // Need to manually handle the rehydration
      // As the nesting of reducers(may be) is causing issues
      // with copying of saved localInvestigations to the state
      const { payload } = action;
      return {
        ...payload.localInvestigations
      };
    case DOWNLOAD_INVESTIGATION_SUCCESS:
      initial[investigation._id] = investigation;
      return {
        ...initial
      };

    case DELETE_INVESTIGATION:
      delete initial[investigation._id];
      return {
        ...initial
      };

    default:
      return {
        ...initial
      };
  }
}
