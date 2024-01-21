import {
  data,
  nodeCount,
  graph3D,
  setGraph3D,
  graphdata,
  setGraphdata,
  element3D,
} from "../globalvars.js";

export function load3D(filter) {
  if (filter != "NULL") {
    let newData = jQuery.extend(true, {}, graphdata);
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
    graph3D.graphData(newData).linkColor((d) => {
      return d.source.color;
    });
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
      .graphData(JSON.parse(JSON.stringify(data)))
      .width(($(window).width() * 11) / 12)
      .height(($(window).height() * 11) / 12)
      .backgroundColor("#F5F5DC")
      .linkOpacity(1)
      .linkLabel("label")
      .linkColor((d) => {
        return data.nodes[d.source].color;
      })
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
    setGraphdata(graph.graphData());
  }
}
