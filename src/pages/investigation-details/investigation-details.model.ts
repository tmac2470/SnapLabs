export interface Investigation {
  file: String;
  name: String;
  data: InvestigationData;
  id: number;
}

export interface InvestigationData {
  experimentConfig: InvestigationDataConfig;
}

export interface InvestigationDataConfig {
  labTitle: String;
  sampleInterval: String;
  sensorTags: any;
}

export interface ISensorTag {
  connect: String;
  sensors: any;
}

interface SensorData {
  display: String;
  label: String;
}

interface SensorGraph {
  graphdisplay: String;
  graphType: String;
  graphTitle: String;
  graphXAxis: String;
  graphYAxis: String;
}

interface SensorGrid {
  griddisplay: String;
  columns: String;
  rows: String;
}

interface SensorParameters {
  ambient: String;
  IR: String;
}

export interface ISensor {
  data: SensorData;
  graph: SensorGraph;
  captureOnClick: String;
  grid: SensorGrid;
  parameters: SensorParameters;
}

export class ColorCode {
  static RED: string = "rgba(255,0,0,1)";
  static GREEN: string = "rgba(0,255,0,1)";
  static BLUE: string = "rgba(0,0,255,1)";
  static BLACK: string = "rgba(0,0,0,1)";
  static WHITE: string = "rgba(255,255,255,1)";
}
