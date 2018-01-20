import * as _ from "lodash";
import * as json2csv from 'papaparse';
import moment from 'moment';

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
        if (sensor.data.display || sensor.graph.display || sensor.graph.graphdisplay || sensor.grid.griddisplay) {
          let parameters = [];
          _.map(_.keys(sensor.parameters), key => {
            const value = sensor.parameters[key];
            parameters.push({
              key: key,
              value: !!value
            });
          });
          tags.push({name: iSensor, config: sensor, value: {}, rawValue: {}, parameters});
        }
      }
    }
  }
  return tags;
}

// Save Grid data Pick data from the sensor.rawValues
export function _saveGridData(connectedDevices, sensors, sampleIntervalTime, investigation, user) {
  const fields = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H"
  ];
  const gridData = [];

  gridData.push({A: "Sample Interval(ms)", B: sampleIntervalTime});

  Object
    .keys(connectedDevices)
    .map(deviceId => {
      const device = connectedDevices[deviceId];

      gridData.push({A: "", B: ""});
      gridData.push({A: "", B: ""});
      gridData.push({A: `Sensor Identifier ${device.id}`, B: ""});

      sensors.map(sensor => {
        gridData.push({A: "", B: ""});
        gridData.push({A: "", B: ""});
        gridData.push({A: `Type: ${sensor.name}`, B: ""});
        gridData.push({A: "", B: ""});

        /**
       * First collect all the units used
       * Assign a header/field value to each unit
       * Use the field value of the unit to push data into it
       */
        let unitMap = {};
        let fieldMap = {};
        sensor
          .config
          .grids
          .map((grid, i) => {
            if (!!grid.rawValue && !!grid.rawValue[device.id]) {
              const rawValueMap = grid.rawValue[device.id];

              _
                .keys(rawValueMap)
                .map((rawValueKey, i) => {
                  if (!unitMap[rawValueKey]) {
                    unitMap[rawValueKey] = {};
                  }

                  unitMap[rawValueKey] = fields[i];
                  fieldMap[fields[i]] = rawValueKey;
                });
            }
          });

        gridData.push(fieldMap);

        sensor
          .config
          .grids
          .map((grid, i) => {
            if (!!grid.rawValue && !!grid.rawValue[device.id]) {
              const rawValueMap = grid.rawValue[device.id];
              let modifiedRawValueMap = {};

              _
                .keys(rawValueMap)
                .map(rawValueKey => {
                  if (!modifiedRawValueMap[unitMap[rawValueKey]]) {
                    modifiedRawValueMap[unitMap[rawValueKey]] = {};
                  }
                  modifiedRawValueMap[unitMap[rawValueKey]] = rawValueMap[rawValueKey];
                });

              gridData.push(modifiedRawValueMap);
            }
          });
      });
    });
  console.log(fields);
  console.log(gridData);
  saveDataToFile(fields, gridData, investigation, user);
}

// Pick data from the sensor.rawValues
export function _saveGraphData(connectedDevices, charts, sampleIntervalTime) {
  const fields = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H"
  ];
  const graphData = [];

  graphData.push({A: "Sample Interval(ms)", B: sampleIntervalTime});

  Object
    .keys(connectedDevices)
    .map(deviceId => {
      const device = connectedDevices[deviceId];

      graphData.push({A: "", B: ""});
      graphData.push({A: "", B: ""});
      graphData.push({A: `Sensor Identifier ${device.id}`, B: ""});

      _
        .keys(charts)
        .map(chartId => {
          graphData.push({A: "", B: ""});
          graphData.push({A: "", B: ""});
          graphData.push({A: `Type: ${chartId}`, B: ""});
          graphData.push({A: "", B: ""});

          /**
       * First collect all the units used
       * Assign a header/field value to each unit
       * Use the field value of the unit to push data into it
       */
          let unitMap = {};
          let fieldMap = {};

          charts[chartId]
            .data
            .labels
            .map(label => {
              if (device.id === label.deviceId) {
                _
                  .keys(label.dataValueMap)
                  .map((dataValueKey, i) => {
                    if (!unitMap[dataValueKey]) {
                      unitMap[dataValueKey] = {};
                    }
                    unitMap[dataValueKey] = fields[i];
                    fieldMap[fields[i]] = dataValueKey;
                  });
              }
            });
          graphData.push(fieldMap);

          charts[chartId]
            .data
            .labels
            .map(label => {
              if (device.id === label.deviceId) {
                let modifiedDataValueMap = {};

                _
                  .keys(label.dataValueMap)
                  .map(dataValueKey => {
                    if (!modifiedDataValueMap[unitMap[dataValueKey]]) {
                      modifiedDataValueMap[unitMap[dataValueKey]] = {};
                    }
                    modifiedDataValueMap[unitMap[dataValueKey]] = label.dataValueMap[dataValueKey];
                  });

                graphData.push(modifiedDataValueMap);
              }
            });
        });
    });
  console.log(fields);
  console.log(graphData);

  // this.saveDataToFile(fields, graphData);
}

function _convertArrayToCSV(fields, data) {
  const csv = json2csv.unparse({ data: data, fields: fields });
  return csv;
}

function _getFileExtension(experimentTitle, user) {
  experimentTitle = experimentTitle.split(" ");
  experimentTitle = experimentTitle.join("_");

  let userExt = user.email;
  if (user.username) {
    userExt = `${user.username}_${userExt}`;
  }

  const timestamp = moment().format("DD_MM_YYYY_HH_mm");
  const fileName = `${timestamp}_${experimentTitle}_${userExt}.csv`;

  return fileName;
}

function saveDataToFile(fields, data, investigation, user) {
  const csvData = _convertArrayToCSV(fields, data);
  const fileName = _getFileExtension(investigation.labTitle, user);
  console.log(fileName);
  console.log(csvData);

  // Save to storage
}