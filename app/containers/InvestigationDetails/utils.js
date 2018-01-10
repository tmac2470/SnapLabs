import * as _ from "lodash";

export function _getSensorTags(sensorTags) {
  let tags = [];
  for (let id in sensorTags) {
    const sensorTag = sensorTags[id];

    // Fetch the sensor tags which have been switched "on"
    if (!!sensorTag.connect) {
      const sensors = sensorTag.sensors;

      // Fetch each sensor from the sensor tags config
      for (let iSensor in sensors) {
        const sensor = sensors[iSensor];
        // Fetch only the sensors which have been switched "on"
        if (
          sensor.data.display ||
          sensor.graph.display ||
          sensor.graph.graphdisplay ||
          sensor.grid.griddisplay
        ) {
          let parameters = [];
          _.map(_.keys(sensor.parameters), key => {
            const value = sensor.parameters[key];
            parameters.push({
              key: key,
              value: !!value
            });
          });
          tags.push({
            name: iSensor,
            config: sensor,
            parameters
          });
        }
      }
    }
  }
  return tags;
}
