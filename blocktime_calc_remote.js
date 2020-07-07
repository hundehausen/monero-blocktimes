const fetch = require("node-fetch");
const ObjectsToCsv = require("objects-to-csv");

// Monero Mainnet Block Explorer
let url = "https://moneroblocks.info/api/";

const LAST_N_BLOCKS = 10;

async function getBlockheight() {
  let response = await fetch(url + "get_stats/");
  let data = await response.json();
  return data.height;
}

async function getBlockHeaders(start, end) {
  async function getBlockHeader(index) {
    let response = await fetch(url + "get_block_header/" + index);
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

async function exportCsv(blocktimes) {
  const csv = new ObjectsToCsv(blocktimes);
  // Save to file:
  await csv.toDisk("./blocktimes.csv");
  // Return the CSV file as string:
  console.log(await csv.toString());
}

getBlockheight()
  .then((height) => getBlockHeaders(height - LAST_N_BLOCKS, height))
  .then(getTimestamps)
  .then(getTimedeltas)
  .then(calcDeviation)
  .then(exportCsv);
