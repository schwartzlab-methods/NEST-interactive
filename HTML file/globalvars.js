export var svg;
export var data;
export var nodeCount;
export var graph3D;
export var curGraphData;
export var graphData;
export var element3D;
export var lastFilter;
export var colourType;
export var componentCnt;
export var vertexTypes;
export function setSvg(val) {
  svg = val;
}
export function setData(val) {
  data = val;
}
export function setNodeCount(val) {
  nodeCount = val;
}
export function setGraph3D(val) {
  graph3D = val;
}
export function setCurGraphData(val) {
  curGraphData = val;
}
export function setGraphData(val) {
  graphData = val;
}
export function setElement3D(val) {
  element3D = val;
}
export function setLastFilter(val) {
  lastFilter = val;
}
export function setColourType(val) {
  colourType = val;
}
export function setComponentCnt(val) {
  componentCnt = val;
}
export function setVertexTypes(val) {
  vertexTypes = val;
}
export var ThreeDObjs = [
  new THREE.SphereGeometry(8),
  new THREE.BoxGeometry(16, 16, 16),
  new THREE.CapsuleGeometry(8, 16),
  new THREE.CylinderGeometry(8, 8, 16),
  new THREE.IcosahedronGeometry(8),
  new THREE.OctahedronGeometry(8),
  new THREE.DodecahedronGeometry(16),
  new THREE.ConeGeometry(8, 16),
  new THREE.TorusGeometry(8, 2),
  new THREE.TorusKnotGeometry(8, 2),
];
