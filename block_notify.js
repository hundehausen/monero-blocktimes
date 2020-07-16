const fs = require("fs");
const fetch = require("node-fetch");

let currentTime = Math.round(new Date().getTime() / 1000);

// Monero Mainnet RPC
let url = "http://192.168.0.119:18081/json_rpc";

async function getLastBlockHeader() {
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

async function getBlockHeaderByHash(hash) {
  let data = {
    jsonrpc: "2.0",
    method: "get_block_header_by_hash",
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

async function appedToCsv(blockheight, time) {
  let newBlock = String((await blockheight) + "," + time + "\n");
  fs.appendFile("blocklogger.csv", newBlock, function (err) {
    if (err) throw err;
  });
}

appedToCsv(getBlockHeaderByHash(process.argv[2]), currentTime);
