const fetch = require("node-fetch");

// Monero Mainnet Block Explorer
let url = "http://moneroblocks.info/api/";

const LAST_N_BLOCKS = 10;

async function getBlockheight() {
  let response = await fetch(url + "get_stats/", {
    method: "GET",
  });
  let data = await response.json();
  return data.height;
}

async function getBlockHeaders(start, end) {
  async function getBlockHeader(index) {
    let response = await fetch(url + "get_block_header/" + index, {
      method: "GET",
    });
    let data = await response.json();
    return await data.block_header;
  }

  let blockheaders = [];
  for (let index = start; index <= end; index++) {
    blockheaders.push(await getBlockHeader(index));
  }
  return blockheaders;
}

async function getTimestamps(blockheaders) {
  let timestamps = [];
  blockheaders.map((header) => {
    timestamps.push({ height: header.height, timestamp: header.timestamp });
  });
  return timestamps; // Array
}

async function getTimedeltas(timestamps) {
  let timedeltas = [];
  timestamps.map((x, index, arr) => {
    // Zeitdiffrenzen zwischen allen Blöcken n berechnen (n-1)
    if (index != arr.length - 1) {
      timedeltas.push({
        height: x.height + 1,
        delta: arr[index + 1].timestamp - x.timestamp,
      });
    }
  });
  console.dir(timedeltas);
  return timedeltas; // Array
}

getBlockheight()
  .then((height) => getBlockHeaders(height - LAST_N_BLOCKS, height))
  .then(getTimestamps)
  .then(getTimedeltas);
