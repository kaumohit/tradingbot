require('dotenv').config();
const axios = require('axios');
const schedule = require("node-schedule");
const Record = require("./models/record");
const Coss = require("./exchanges/coss");
const dbETH = require("./config/level").ETH_COSS_DB;
const dbBTC = require("./config/level").BTC_COSS_DB;

/* 18:29 is in UTC ---> 23:59 in IST */
let job = schedule.scheduleJob({ hour: 18, minute: 29 }, function () {

  const coss1 = new Coss(
    process.env.API1,
    process.env.S1
  );
  const coss2 = new Coss(
    process.env.API2,
    process.env.S2
  );

  let Eth1 = 0;
  let Btc1 = 0;
  let Coss1 = 0;
  let Eth2 = 0;
  let Btc2 = 0;
  let Coss2 = 0;
  let EthUsd = 0;
  let EthUsdHigh = 0;
  let EthUsdLow = 0;
  let BtcUsd = 0;
  let BtcUsdHigh = 0;
  let BtcUsdLow = 0;

  (async () => {
    Promise.all([coss1.fetchBalance(), coss2.fetchBalance(), axios({method: 'GET',url: `https://api.kucoin.com/api/v1/market/allTickers`}), dbETH.get("volumeCOSS"), dbBTC.get("volumeCOSS")]).then(result => {
      for (let i in result[0]) {
        switch(i){
          case 'ETH': {
            Eth1 = (result[0][i]).free;
            break;
          }
          case 'BTC': {
            Btc1 = (result[0][i]).free;
            break;
          }
          case 'COSS': {
            Coss1 = (result[0][i]).free;
            break;
          }
          default: {
            break;
          }
        }
      }
      for (let j in result[1]) {
        switch (j){
          case 'ETH': {
            Eth2 = (result[1][j]).free;
            break;
          }
          case 'BTC': {
            Btc2 = (result[1][j]).free;
            break;
          }
          case 'COSS': {
            Coss2 = (result[1][j]).free;
            break;
          }
          default: {
            break;
          }
        }
      }
      for (let i of result[2].data.data.ticker){
        if (i.symbol === 'ETH-USDT') {
          EthUsd = i.last;
          EthUsdHigh = i.high;
          EthUsdLow = i.low;
        }
        if (i.symbol === 'BTC-USDT') {
          BtcUsd = i.last;
          BtcUsdHigh = i.high;
          BtcUsdLow = i.low;
        }
      }

      let data = {
        Date: new Date().toDateString(),
        Btc1: Btc1,
        Eth1: Eth1,
        Coss1: Coss1,
        Btc2: Btc2,
        Eth2: Eth2,
        Coss2: Coss2,
        EthUsd: EthUsd,
        BtcUsd: BtcUsd,
        EthUsdHigh: EthUsdHigh,
        EthUsdLow: EthUsdLow,
        BtcUsdLow: BtcUsdLow,
        BtcUsdHigh: BtcUsdHigh,
        volumeCOSSETH24Hrs: result[3].toString(),
        volumeCOSSBTC24Hrs: result[4].toString()
        // HighCossBtc: HighCossBtc,
        // LowCossBtc: LowCossBtc,
        // HighCossEth: HighCossEth,
        // LowCossEth: LowCossEth
      };
      Record.create(data, (err, res) => {
        if (!err) {
          Promise.all([dbETH.put("volumeCOSS", 0), dbETH.put("lastReportSubmittedToDB", `${new Date().toLocaleDateString()}  ${new Date().toLocaleTimeString()}`), dbBTC.put("volumeCOSS", 0), dbBTC.put("lastReportSubmittedToDB", `${new Date().toLocaleDateString()}  ${new Date().toLocaleTimeString()}`)]).then(res => {
            console.log('volumeCOSS field reset successfully & MONGO-DB REPORT SUBMITTED SUCCESSFULLY!');
          }).catch(err => {
            console.log('Error in updating data to LEVEL_DB (dbScript)', err)
          });
        } else console.log(`Something Went Wrong While Updating LEVEL in dbscript, ${err}`);
      });
      // }).catch(err => {
      //   console.log('Error in fetching data from TRADES LEVEL_DB (dbScript)');
      //   console.log(err);
      // });
      
    }).catch((err) => {
      console.log('SOMETHING WENT WRONG IN DBSCRIPT of COSS!');
      console.log(err);
    });
})();
});
