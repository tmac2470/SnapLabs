import * as _ from 'lodash';
import * as json2csv from 'papaparse';
import moment from 'moment';
import randomColor from 'randomcolor';

import getStore from '../../store';
import { saveFile } from '../FileHandling/actions';

const _getLegend = (label, color) => {
  return {
    name: label,
    symbol: { fill: color },
    labels: { fill: color }
  };
};

const _getDataset = (label, color) => {
  return {
    label: label,
    data: [0, 0],
    style: {
      data: {
        stroke: color,
        strokeWidth: 2,
        strokeLinecap: 'round'
      }
    }
  };
};

const _getGraphConfig = (sensor, devices) => {
  let color = randomColor();
  let color1 = randomColor();
  let color2 = randomColor();
  let color3 = randomColor();

  let config = {
    legends: []
  };
  const sensorParams = sensor.parameters;

  const xLabel = 'X';
  const yLabel = 'Y';
  const zLabel = 'Z';
  const scalarLabel = 'Scalar Value';

  return Object.keys(devices).map(deviceId => {
    switch (sensor.name.toLowerCase()) {
      case 'barometer':
        const hpaLabel = 'hPa';
        config[deviceId] = {
          type: {
            hPa: _getDataset(hpaLabel, color)
          },
          rawValues: []
        };
        config.legends = [_getLegend(hpaLabel, color)];
        return config;
      case 'humidity':
        const humTEMPLabel = '°C';
        const humRHLabel = '% RH';

        config[deviceId] = {
          type: {
            temp: _getDataset(humTEMPLabel, color),
            rh: _getDataset(humRHLabel, color1)
          },
          rawValues: []
        };
        config.legends = [
          _getLegend(humTEMPLabel, color),
          _getLegend(humRHLabel, color1)
        ];

        return config;

      case 'luxometer':
        const luxLabel = 'lux';
        config[deviceId] = {
          type: {
            lux: _getDataset(luxLabel, color)
          },
          rawValues: []
        };
        config.legends = [_getLegend(luxLabel, color)];
        return config;
      case 'temperature':
        const ambLabel = 'Ambient Temperature (°C)';
        const irLabel = 'Target (IR) Temperature (°C)';

        config[deviceId] = {
          type: {},
          rawValues: []
        };
        config.legends = [];

        if (sensorParams.ambient) {
          config[deviceId].type['amb'] = _getDataset(ambLabel, color);
          config.legends.push(_getLegend(ambLabel, color));
        }

        if (sensorParams.IR) {
          config[deviceId].type['ir'] = _getDataset(irLabel, color1);
          config.legends.push(_getLegend(irLabel, color1));
        }

        return config;

      case 'magnetometer':
        config[deviceId] = {
          type: {},
          rawValues: []
        };
        config.legends = [];

        if (sensorParams.xyz) {
          config[deviceId].type['magx'] = _getDataset(xLabel, color);
          config[deviceId].type['magy'] = _getDataset(yLabel, color1);
          config[deviceId].type['magz'] = _getDataset(zLabel, color2);
          config.legends.push(
            _getLegend(xLabel, color),
            _getLegend(yLabel, color1),
            _getLegend(zLabel, color2)
          );
        }

        if (sensorParams.scalar) {
          config[deviceId].type['accscalar'] = _getDataset(scalarLabel, color2);
          config.legends.push(_getLegend(scalarLabel, color3));
        }

        return config;
      case 'accelerometer':
        config[deviceId] = {
          type: {},
          rawValues: []
        };
        config.legends = [];
        if (sensorParams.xyz) {
          config[deviceId].type['accx'] = _getDataset(xLabel, color);
          config[deviceId].type['accy'] = _getDataset(yLabel, color1);
          config[deviceId].type['accz'] = _getDataset(zLabel, color2);
          config.legends.push(
            _getLegend(xLabel, color),
            _getLegend(yLabel, color1),
            _getLegend(zLabel, color2)
          );
        }

        if (sensorParams.scalar) {
          config[deviceId].type['accscalar'] = _getDataset(scalarLabel, color2);
          config.legends.push(_getLegend(scalarLabel, color3));
        }

        return config;
      case 'gyroscope':
        config[deviceId] = {
          type: {},
          rawValues: []
        };
        config.legends = [];
        config[deviceId].type['gyrox'] = _getDataset(xLabel, color);
        config[deviceId].type['gyroy'] = _getDataset(yLabel, color1);
        config[deviceId].type['gyroz'] = _getDataset(zLabel, color2);
        config.legends.push(
          _getLegend(xLabel, color),
          _getLegend(yLabel, color1),
          _getLegend(zLabel, color2)
        );

        return config;
    }
  });
};

export function _getSensorTags(sensorTags, connectedDevices) {
  let tags = [];
  for (let id in sensorTags) {
    const sensorTag = sensorTags[id];

    // Fetch the sensor tags which have been switched "on"
    if (!!sensorTag.connect) {
      const sensors = sensorTag.sensors;

      // Fetch each sensor from the sensor tags config
      for (let iSensor in sensors) {
        const sensor = sensors[iSensor];
        sensor.name = iSensor;
        // Fetch only the sensors which have been switched "on"
        if (
          sensor.data.display ||
          sensor.graph.display ||
          sensor.graph.graphdisplay ||
          sensor.grid.griddisplay
        ) {
          const graphData = _getGraphConfig(sensor, connectedDevices)[0];

          let parameters = [];
          _.map(_.keys(sensor.parameters), key => {
            const value = sensor.parameters[key];
            parameters.push({
              key: key,
              value: !!value
            });
          });
          tags.push({
            name: sensor.name,
            config: sensor,
            value: {},
            rawValue: {},
            graph: graphData,
            parameters
          });
        }
      }
    }
  }
  return tags;
}

// Save Grid data Pick data from the sensor.rawValues
export function _saveGridData(
  connectedDevices,
  sensors,
  sampleIntervalTime,
  investigation,
  user
) {
  const fields = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const gridData = [];

  gridData.push({ A: 'Sample Interval(ms)', B: sampleIntervalTime });

  Object.keys(connectedDevices).map(deviceId => {
    const device = connectedDevices[deviceId];

    gridData.push({ A: '', B: '' });
    gridData.push({ A: '', B: '' });
    gridData.push({ A: `Sensor Identifier ${device.id}`, B: '' });

    sensors.map(sensor => {
      gridData.push({ A: '', B: '' });
      gridData.push({ A: '', B: '' });
      gridData.push({ A: `Type: ${sensor.name}`, B: '' });
      gridData.push({ A: '', B: '' });

      /**
       * First collect all the units used
       * Assign a header/field value to each unit
       * Use the field value of the unit to push data into it
       */
      let unitMap = {};
      let fieldMap = {};
      sensor.config.grids.map((grid, i) => {
        if (!!grid.rawValue && !!grid.rawValue[device.id]) {
          const rawValueMap = grid.rawValue[device.id];

          _.keys(rawValueMap).map((rawValueKey, i) => {
            if (!unitMap[rawValueKey]) {
              unitMap[rawValueKey] = {};
            }

            unitMap[rawValueKey] = fields[i];
            fieldMap[fields[i]] = rawValueKey;
          });
        }
      });

      gridData.push(fieldMap);

      sensor.config.grids.map((grid, i) => {
        if (!!grid.rawValue && !!grid.rawValue[device.id]) {
          const rawValueMap = grid.rawValue[device.id];
          let modifiedRawValueMap = {};

          _.keys(rawValueMap).map(rawValueKey => {
            if (!modifiedRawValueMap[unitMap[rawValueKey]]) {
              modifiedRawValueMap[unitMap[rawValueKey]] = {};
            }
            modifiedRawValueMap[unitMap[rawValueKey]] =
              rawValueMap[rawValueKey];
          });

          gridData.push(modifiedRawValueMap);
        }
      });
    });
  });
  return saveDataToFile(fields, gridData, investigation, user);
}

// Pick data from the sensor.rawValues
export function _saveGraphData(
  connectedDevices,
  sensors,
  sampleIntervalTime,
  investigation,
  user
) {
  const fields = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const graphData = [];

  graphData.push({ A: 'Sample Interval(ms)', B: sampleIntervalTime });

  Object.keys(connectedDevices).map(deviceId => {
    const device = connectedDevices[deviceId];

    graphData.push({ A: '', B: '' });
    graphData.push({ A: '', B: '' });
    graphData.push({ A: `Sensor Identifier ${device.id}`, B: '' });

    sensors.map(sensor => {
      graphData.push({ A: '', B: '' });
      graphData.push({ A: '', B: '' });
      graphData.push({ A: `Type: ${sensor.name}`, B: '' });
      graphData.push({ A: '', B: '' });

      const graph = sensor.graph[deviceId];

      const headers = {};
      graph.rawValues.map(rawValue => {
        Object.keys(rawValue).map((key, i) => {
          headers[fields[i]] = key;
        });
      });
      graphData.push(headers);

      graph.rawValues.map(rawValue => {
        const values = {};
        Object.keys(rawValue).map((key, i) => {
          values[fields[i]] = rawValue[key];
        });

        graphData.push(values);
      });

      graphData.push({ A: '', B: '' });
    });
  });

  return saveDataToFile(fields, graphData, investigation, user);
}

function _convertArrayToCSV(fields, data) {
  const csv = json2csv.unparse({ data: data, fields: fields });
  return csv;
}

function _getFileExtension(experimentTitle, user) {
  experimentTitle = experimentTitle.split(' ');
  experimentTitle = experimentTitle.join('_');

  let userExt = user.email;
  if (user.username) {
    userExt = `${user.username}_${userExt}`;
  }

  const timestamp = moment().format('DD_MM_YYYY_HH_mm_ss');
  const fileName = `${timestamp}_${experimentTitle}_${userExt}.csv`;

  return fileName;
}

function saveDataToFile(fields, data, investigation, user) {
  const csvData = _convertArrayToCSV(fields, data);
  const fileName = _getFileExtension(investigation.labTitle, user);
  const { store } = getStore();

  return store.dispatch(saveFile(fileName, csvData, user));
}
