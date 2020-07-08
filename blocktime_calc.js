const fetch = require("node-fetch");
const ObjectsToCsv = require("objects-to-csv");

// Monero Mainnet RPC
let url = "http://192.168.0.119:18081/json_rpc";

// Anzahl der letzten Blöcke, die untersucht werden sollen
const LAST_N_BLOCKS = 100;

async function getBlockheight() {
  let data = {
    jsonrpc: "2.0",
    method: "get_last_block_header",
  };
  let response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(data),
  });
  let response_json = await response.json();
  console.log("Blockheight:", response_json.result.block_header.height);
  return await response_json.result.block_header.height;
}

// Gibt ein Array von Blockheadern eines bestimmten Bereichs zurück
async function getBlockHeaders(start, end) {
  let data = {
    jsonrpc: "2.0",
    method: "get_block_headers_range",
    params: {
      start_height: start - 1,
      end_height: end,
    },
  };
  let response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(data),
  });
  let response_json = await response.json();
  return await response_json.result.headers; // Array
}

async function getTimestamps(blockheaders) {
  return blockheaders.map(({ height, timestamp }) => {
    return { height: height, timestamp: timestamp };
  });
}

async function getTimedeltas(timestamps) {
  let timedeltas = [];
  timestamps.map((x, index, arr) => {
    // Calculate time difference of selected n blocks - (n-1) results
    if (index != arr.length - 1) {
      timedeltas.push({
        height: x.height + 1,
        blocktime: arr[index + 1].timestamp - x.timestamp,
      });
    }
  });
  return timedeltas;
}

async function calcDeviation(blocktimes) {
  blocktimes.map((block) => {
    // deviation from the target value of 120 seconds per block
    block.deviation = Math.abs(120 - block.blocktime);
  });
  return blocktimes;
}

async function calcStats(blocktimes) {
  let min = Math.min.apply(
    Math,
    blocktimes.map((block) => {
      return block.blocktime;
    })
  ); // shortest blocktime - can be negative
  let max = Math.max.apply(
    Math,
    blocktimes.map((block) => {
      return block.blocktime;
    })
  ); // longest blocktime
  let sum = 0;
  blocktimes.forEach((block) => {
    sum += block.blocktime;
  });
  let average = sum / blocktimes.length;
  console.log(
    "First block:",
    blocktimes[0].height,
    "Last block:",
    blocktimes[blocktimes.length - 1].height
  );
  console.log(
    "Average blocktime of last",
    blocktimes.length,
    "blocks:",
    Math.round((average + Number.EPSILON) * 100) / 100,
    "seconds or",
    Math.round((average / 60.0 + Number.EPSILON) * 100) / 100,
    "minutes"
  );
  console.log("Minimum time:", min, "seconds");
  console.log(
    "Maximum time:",
    max,
    "seconds or",
    Math.round((max / 60.0 + Number.EPSILON) * 100) / 100,
    "minutes"
  );
  return blocktimes;
}

async function exportCsv(blocktimes) {
  const csv = new ObjectsToCsv(blocktimes);
  // Save to file:
  await csv.toDisk("./blocktimes.csv");
}

getBlockheight()
  .then((height) => getBlockHeaders(height - LAST_N_BLOCKS, height))
  .then(getTimestamps)
  .then(getTimedeltas)
  .then(calcDeviation)
  .then(calcStats)
  .then(exportCsv);
