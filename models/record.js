require("dotenv").config();
const mongoose = require("mongoose");

var recordSchema = new mongoose.Schema({
  Date: String,
  Btc1: Number,
  Eth1: Number,
  Got1: Number,
  Btc2: Number,
  Eth2: Number,
  Got2: Number,
  EthUsd: Number,
  BtcUsd: Number,
  EthUsdHigh: Number,
  EthUsdLow: Number,
  BtcUsdLow: Number,
  BtcUsdHigh: Number,
  BtcUsdHigh: Number,
  volumeGOTETH24Hrs: String,
  volumeGOTBTC24Hrs: String
  // HighLalaBtc: Number,
  // LowLalaBtc: Number,
  // HighLalaEth: Number,
  // LowLalaEth: Number,
  // CobinLalaEthVol: Number,
  // CobinLalaBtcVol: Number,
  // LiquidLalaEthVol: Number,
  // LiquidLalaBtcVol: Number,
  // KucoinLalaEthVol: Number,
  // KucoinLalaBtcVol: Number
});

mongoose.connect(
  process.env.DBURL,
  { useNewUrlParser: true },
  err => {
    if (err) {
      console.log(err);
    } else {
      console.log("db connected");
    }
  }
);

module.exports = mongoose.model("Record_LATOKEN", recordSchema);
