import {
  data,
  nodeCount,
  graph3D,
  setGraph3D,
  curGraphData,
  setCurGraphData,
  graphData,
  setGraphData,
  element3D,
  lastFilter,
  colourType,
} from "../globalvars.js";
import { loadHistogram } from "./histogram.js";

export function load3D(filterObj) {
  if (filterObj != "NULL") {
    let newDataCur = jQuery.extend(true, {}, curGraphData);

    let filter = filterObj.data;
    if (filterObj.type == "colour-change") {
      if (colourType == "Component") {
        for (let i = 0; i < newDataCur.nodes.length; i++) {
          if (
            newDataCur.nodes[i]["component"] == filter[0] &&
            newDataCur.nodes[i]["color"] != "#D3D3D3"
          ) {
            newDataCur.nodes[i]["color"] = filter[1];
          }
        }
        for (let i = 0; i < newDataCur.links.length; i++) {
          if (newDataCur.links[i]["component"] == filter[0]) {
            newDataCur.links[i]["color"] = filter[1];
          }
        }

        for (let i = 0; i < graphData.nodes.length; i++) {
          if (
            graphData.nodes[i]["component"] == filter[0] &&
            graphData.nodes[i]["color"] != "#D3D3D3"
          ) {
            graphData.nodes[i]["color"] = filter[1];
          }
        }
        for (let i = 0; i < graphData.links.length; i++) {
          if (graphData.links[i]["component"] == filter[0]) {
            graphData.links[i]["color"] = filter[1];
          }
        }

        graph3D.graphData(newDataCur);
        setCurGraphData(newDataCur);
        if (lastFilter != undefined) loadHistogram(lastFilter);
        else loadHistogram("NULL");
      } else if (colourType == "Ligand-Receptor") {
        let nodeSet = new Set();
        for (let i = 0; i < newDataCur.links.length; i++) {
          if (newDataCur.links[i]["ligand-receptor"] == filter[0]) {
            newDataCur.links[i]["color"] = filter[1];
            nodeSet.add(newDataCur.links[i]["source"]["id"]);
            nodeSet.add(newDataCur.links[i]["target"]["id"]);
          }
        }
        for (let i = 0; i < newDataCur.nodes.length; i++) {
          if (nodeSet.has(newDataCur.nodes[i]["id"])) {
            newDataCur.nodes[i]["color"] = filter[1];
          }
        }
        graph3D.graphData(newDataCur);
        setCurGraphData(newDataCur);
      } else if (colourType == "Cell Type") {
        for (let i = 0; i < newDataCur.nodes.length; i++) {
          if (newDataCur.nodes[i]["shape"] == filter[0]) {
            newDataCur.nodes[i]["color"] = filter[1];
          }
        }
        for (let i = 0; i < graphData.nodes.length; i++) {
          if (graphData.nodes[i]["shape"] == filter[0]) {
            graphData.nodes[i]["color"] = filter[1];
          }
        }
        graph3D.graphData(newDataCur);
        setCurGraphData(newDataCur);
      }
    } else if (filterObj.type == "colour-generate") {
      if (colourType == "Component") {
        let comp_set = new Set();
        for (let i = 0; i < newDataCur.nodes.length; i++) {
          comp_set.add(newDataCur.nodes[i]["component"]);
        }
        let colourArr1 = ["yellow", "teal"];
        let colourArr2 = ["purple", "red"];
        let f = chroma
          .scale([
            colourArr1[Math.floor(Math.random() * colourArr1.length)],
            colourArr2[Math.floor(Math.random() * colourArr2.length)],
          ])
          .colors(comp_set.size);
        for (let i = 0; i < newDataCur.nodes.length; i++) {
          if (newDataCur.nodes[i]["component"] != 0)
            newDataCur.nodes[i]["color"] = f[newDataCur.nodes[i]["component"]];
        }
        for (let i = 0; i < newDataCur.links.length; i++) {
          newDataCur.links[i]["color"] = f[newDataCur.links[i]["component"]];
        }
        for (let i = 0; i < graphData.nodes.length; i++) {
          if (graphData.nodes[i]["component"] != 0)
            graphData.nodes[i]["color"] = f[graphData.nodes[i]["component"]];
        }
        for (let i = 0; i < graphData.links.length; i++) {
          graphData.links[i]["color"] = f[graphData.links[i]["component"]];
        }
        graph3D.graphData(newDataCur);
        setCurGraphData(newDataCur);
        if (lastFilter != undefined) loadHistogram(lastFilter);
        else loadHistogram("NULL");
      }
    } else if (filterObj.type == "nodeSel") {
      let newData = jQuery.extend(true, {}, graphData);
      let nodeSet = new Set();
      if (filter.indexOf("-") > -1) {
        for (let i = 0; i < newData.links.length; i++) {
          if (newData.links[i]["ligand-receptor"] != filter) {
            newData.links.splice(i, 1);
            i--;
          } else {
            nodeSet.add(newData.links[i]["source"]["id"]);
            nodeSet.add(newData.links[i]["target"]["id"]);
          }
        }
        for (let i = 0; i < newData.nodes.length; i++) {
          if (!nodeSet.has(newData.nodes[i]["id"])) {
            newData.nodes[i]["color"] = "#D3D3D3";
          }
        }
      } else {
        for (let i = 0; i < newData.links.length; i++) {
          if (
            newData.links[i]["ligand"] != filter &&
            newData.links[i]["receptor"] != filter
          ) {
            newData.links.splice(i, 1);
            i--;
          } else {
            nodeSet.add(newData.links[i]["source"]["id"]);
            nodeSet.add(newData.links[i]["target"]["id"]);
          }
        }
        for (let i = 0; i < newData.nodes.length; i++) {
          if (!nodeSet.has(newData.nodes[i]["id"])) {
            newData.nodes[i]["color"] = "#D3D3D3";
          }
        }
      }
      graph3D.graphData(newData);
      setCurGraphData(newData);
    }
  } else {
    let map = new Map();
    for (let i in data.links) {
      map.set(data.links[i].label, Math.random() * Math.PI * 2);
    }
    let graph = ForceGraph3D()(element3D)
      .nodeThreeObject(
        ({ shape, color }) =>
          new THREE.Mesh(
            [
              new THREE.SphereGeometry(8),
              new THREE.BoxGeometry(16, 16, 16),
              new THREE.CapsuleGeometry(8, 16),
              new THREE.CylinderGeometry(8, 8, 16),
              new THREE.IcosahedronGeometry(8),
              new THREE.LatheGeometry(8),
              new THREE.OctahedronGeometry(8),
              new THREE.DodecahedronGeometry(16),
              new THREE.ConeGeometry(8, 16),
              new THREE.TorusGeometry(8, 2),
              new THREE.TorusKnotGeometry(8, 2),
            ][shape % 11],
            new THREE.MeshLambertMaterial({
              color: color,
            })
          )
      )
      .nodeLabel("label")
      .graphData(data)
      .width(($(window).width() * 11) / 12)
      .height(($(window).height() * 11) / 12)
      .backgroundColor("#F5F5DC")
      .linkOpacity(1)
      .linkLabel("label")
      .linkDirectionalArrowLength((d) => {
        return ((nodeCount - d.value) / nodeCount) * 10;
      })
      .linkCurvature(1)
      .linkCurveRotation((d) => {
        return map.get(d.label);
      })
      .linkDirectionalArrowRelPos(1)
      .linkWidth((d) => {
        return ((nodeCount - d.value) / nodeCount) * 5;
      });
    setGraph3D(graph);
    setGraphData(graph.graphData());
    setCurGraphData(graph.graphData());
  }
}
