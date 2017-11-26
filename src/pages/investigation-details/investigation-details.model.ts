export interface Investigation {
  _id: string;
  serialNumber: number;
  lastUpdatedAt: Date;
  videoPrefix: string;
  dataStorageAllowed: boolean;
  dataStoragePrefix: string;
  graphAutoStart: boolean;
  labTitle: string;
  sampleInterval: string;
  description: string;
  isPublished: boolean;
  sensorTags: any;
  downloaded?: boolean;
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
  display: String;
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
