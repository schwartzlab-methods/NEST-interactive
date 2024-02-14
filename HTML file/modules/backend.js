import { loadHistogram } from "./histogram.js";
import { load3D } from "./3d.js";
import { svg, setSvg, data, setData, setNodeCount } from "../globalvars.js";
export async function callBackend(nodeC) {
  await $.ajax({
    type: "GET",
    url: "http://127.0.0.1:8000/data/json/" + nodeC,
    success: (data) => {
      setNodeCount(nodeC);
      setData(data);
      for (let i in data.links) {
        data.links[i]["color"] = data.nodes[data.links[i]["source"]]["color"];
      }
      loadHistogram("NULL");
      load3D("NULL");
      //loadNetwork("NULL");
      console.log("loaded " + nodeC);
    },
  });
}
