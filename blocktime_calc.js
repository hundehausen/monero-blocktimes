const fetch = require("node-fetch");

/*
    Dieses Script holt sich von einem Monero Node mit aktiviertem JSON RPC
    die letzten n Blöcke und berechnet deren Zeitdifferenz.
    Der Timestamp wird in jedem Block vom Miner selbst festgelegt. Hierbei
    kommt es zu Abweichungen, da die Miner keine gemeinsame synchronisierte
    Systemzeit nutzen.
    Das Monero Netzwerk lehnt den Block ab, wenn der Timestamp größer als
    die Median Blockdauer der letzten 60 Blöcke ist.
    siehe: https://github.com/monero-project/monero/blob/master/src/cryptonote_core/blockchain.cpp#L1691
    und https://github.com/monero-project/monero/blob/master/src/cryptonote_core/blockchain.cpp#L3611
    Aufgrundessen kommt es unvermeidlich zu unkorrekten Ergebnissen bei diesem
    Programm, allerdings kann die Abweichung nicht größer als die Median Blockzeit
    der letzten 60 Blöcke sein. Die Werte dienen somit nur als Richtwerte.

    Autor: Grischa Daum
*/

// Monero Mainnet RPC
let url = "http://192.168.0.119:18081/json_rpc";
// Anzahl der letzten Blöcke, die untersucht werden sollen
const LAST_N_BLOCKS = 1000;

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
  return await response_json.result.block_header.height;
}

// Gibt ein Array von Blockheadern eines bestimmten Bereichs zurück
async function getBlockHeaders(start, end) {
  let data = {
    jsonrpc: "2.0",
    method: "get_block_headers_range",
    params: {
      start_height: start,
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
  let timestamps = [];
  blockheaders.map((x, index, arr) => {
    timestamps.push(x.timestamp);
  });
  return timestamps; // Array
}

async function getTimedeltas(timestamps) {
  let timedeltas = [];
  timestamps.map((x, index, arr) => {
    // Zeitdiffrenzen zwischen allen Blöcken n berechnen (n-1)
    if (index != arr.length - 1) {
      timedeltas.push(arr[index + 1] - x);
    }
  });
  return timedeltas; // Array
}

// Asynchrone Funktionsaufrufe
getBlockheight().then(async (height) => {
  start_height = height - LAST_N_BLOCKS;
  console.log("First block:", start_height, "Last block:", height);

  let blockheaders = getBlockHeaders(start_height, height).then(
    async (blockheaders) => {
      getTimestamps(blockheaders).then(async (timestamps) => {
        getTimedeltas(timestamps).then(async (timedeltas) => {
          let min = Math.min(...timedeltas); // kuerzeste Blockzeit
          let max = Math.max(...timedeltas); // laengste Blockzeit
          let sum = 0;
          timedeltas.forEach((delta) => {
            sum += delta;
          });
          let average = sum / timedeltas.length;
          console.log(
            "Average blocktime of last",
            height - start_height,
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
        });
      });
    }
  );
});
