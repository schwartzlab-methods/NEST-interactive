import { loadNetwork } from "./network.js";
import { loadHistogram } from "./histogram.js";
import { load3D } from "./3d.js";
import { svg, setSvg, data, setData } from "../globalvars.js";
export async function callBackend(nodeCount) {
  await $.ajax({
    type: "GET",
    url: "http://127.0.0.1:8000/data/json/" + nodeCount,
    success: (data) => {
      setData(data);
      loadHistogram();
      load3D("NULL");
      //loadNetwork("NULL");
      console.log("loaded " + nodeCount);
    },
  });
}
