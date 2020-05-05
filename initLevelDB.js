const dbETH = require("./config/level").ETH_COSS_DB;
const dbBTC = require("./config/level").BTC_COSS_DB;
// const date = new Date().toLocaleDateString();
// const time = new Date().toLocaleTimeString();

// // (async () => {
  
// let get = () => {
//     Promise.all([dbETH.get('lastReportSubmittedToDB'), dbETH.get('volumeLastUpdatedAt'), dbETH.get('volumeGOT'), dbBTC.get('lastReportSubmittedToDB'), dbBTC.get('volumeLastUpdatedAt'), dbBTC.get('volumeGOT')]).then(res => {
//         console.log(`ETH lastReportSubmittedToDB: ${res[0].toString()}`);
//         console.log(`ETH volumeLastUpdatedAt: ${res[1].toString()}`);
//         console.log(`ETH volumeGOT: ${res[2].toString()}`);
//         console.log(`*******************************************************`);
//         console.log(`BTC lastReportSubmittedToDB: ${res[3].toString()}`);
//         console.log(`BTC volumeLastUpdatedAt: ${res[4].toString()}`);
//         console.log(`BTC volumeGOT: ${res[5].toString()}`);

//     }).catch(err => {
//         console.log('AN ERROR OCCURRED 1!', err);
//     });
// }

// let streamBTC = (lim) => {
//     dbBTC.createReadStream({
//         reverse: true,
//         limit: lim
//     })
//         .on("data", data => {
//             console.log("*******BTC DB********");
//             console.log(data.key.toString()+ ':\n');
//             console.log(data.value.toString());
//             console.log("*********************");
//         }) //2NDfBfgL1qcQgbBkB8cGJSawdLWh1YCyyUN
//         .on("error", err => {
//             console.log("Error Occurred in LEVELDB (LSK)!: ", err);
//             reject(err);
//         });
// }

// let streamETH = (lim) => {
//     dbETH.createReadStream({
//         reverse: true,
//         limit: lim
//     })
//         .on("data", data => {
//             console.log("*******ETH DB********");
//             console.log(data.key.toString()+ ':\n');
//             console.log(data.value.toString());
//             console.log("*********************");
//         }) //2NDfBfgL1qcQgbBkB8cGJSawdLWh1YCyyUN
//         .on("error", err => {
//             console.log("Error Occurred in LEVELDB (LSK)!: ", err);
//             reject(err);
//         });
// }
// // })();
let put = () => {
    Promise.all([dbETH.put('lastReportSubmittedToDB', `${date}  ${time}`), dbETH.put('volumeLastUpdatedAt', `${date}  ${time}`), dbETH.put("volumeCOSS", 0), dbBTC.put('lastReportSubmittedToDB', `${date}  ${time}`), dbBTC.put('volumeLastUpdatedAt', `${date}  ${time}`), dbBTC.put("volumeCOSS", 0)]).then(res => {

    }).catch(err => {
        console.log('AN ERROR OCCURRED 2!', err);
    })
}
// //streamBTC(100);
// //streamETH(100);
// get();
//put();


// // (async () => {
// //     const a = await dbETH.get('trades');
// //     console.log(JSON.parse(a.toString()));
// // })();
// require('dotenv').config();

// const mongoose = require('mongoose');
// const Orders = require("./models/filledOrder");
// const Record = require("./models/record");
// const a = [{
//     type: 'limit',
//     side: 'sell',
//     amount: 4198,
//     price: '0.00001123',
//     ID: 'ID 1',
//     lowAsk: 0.000013,
//     highBid: 0.00000869,
//     ORDER_ID: '1554967964.983996.585608@0285:2',
//     Date: '2019-4-11 @ 07:32:45'
// },
// {
//     type: 'limit',
//     side: 'buy',
//     amount: 4338,
//     price: '0.00001128',
//     ID: 'ID 1',
//     Date: '2019-4-11 @ 07:33:07',
//     ORDER_ID: '1554967987.117736.585608@0285:1',
//     lowAsk: 0.000013,
//     highBid: 0.00000869
// },
// {
//     type: 'limit',
//     side: 'buy',
//     amount: 4198,
//     price: '0.00001123',
//     ID: 'ID 2',
//     lowAsk: 0.000013,
//     highBid: 0.00000869,
//     ORDER_ID: '1554967965.373609.585610@0285:1',
//     Date: '2019-4-11 @ 07:32:45'
// },
// {
//     type: 'limit',
//     side: 'sell',
//     amount: 4338,
//     price: '0.00001128',
//     ID: 'ID 2',
//     Date: '2019-4-11 @ 07:33:06',
//     ORDER_ID: '1554967986.504583.585610@0285:2',
//     lowAsk: 0.000013,
//     highBid: 0.00000869
// }]
// const b = [{
//     type: 'limit',
//     side: 'sell',
//     amount: 5814,
//     price: '0.00001093',
//     ID: 'ID 1',
//     lowAsk: 0.000013,
//     highBid: 0.00000869,
//     ORDER_ID: '1554968007.521207.585608@0285:2',
//     Date: '2019-4-11 @ 07:33:27'
// },
// {
//     type: 'limit',
//     side: 'buy',
//     amount: 5332,
//     price: '0.00001054',
//     ID: 'ID 1',
//     Date: '2019-4-11 @ 07:33:32',
//     ORDER_ID: '1554968012.826677.585608@0285:1',
//     lowAsk: 0.000013,
//     highBid: 0.00000869
// },
// {
//     type: 'limit',
//     side: 'buy',
//     amount: 5814,
//     price: '0.00001093',
//     ID: 'ID 2',
//     lowAsk: 0.000013,
//     highBid: 0.00000869,
//     ORDER_ID: '1554968007.728995.585610@0285:1',
//     Date: '2019-4-11 @ 07:33:27'
// },
// {
//     type: 'limit',
//     side: 'sell',
//     amount: 5332,
//     price: '0.00001054',
//     ID: 'ID 2',
//     Date: '2019-4-11 @ 07:33:32',
//     ORDER_ID: '1554968012.471438.585610@0285:2',
//     lowAsk: 0.000013,
//     highBid: 0.00000869
// }]
// const c = [];

// const pairVar = 'orders.GOT_ETH';
// const b = {
//     date: new Date().toDateString(),
//     orders: {
//         GOT_ETH: [],
//         GOT_BTC: []
//     },
//     updatedAt: new Date() 
// }
// mongoose.Promise = global.Promise;

// mongoose.connect(
//     process.env.DBURL,
//     { useNewUrlParser: true },
//     async (err, res) => {
//         if (err) {
//             console.log(err);
//         } else {
//             console.log("DB Connected");
//             // const data = new Record(b);
//             // console.log(data);
//             Orders.update(
//                 { date: new Date().toDateString() },
//                 { updatedAt: new Date(), $push: { 'orders.GOT_ETH': a } }, { upsert : true }, (err, res) => {
//                     if (!err) console.log(res);
//                     else console.log(err);
//                 });

//         }
//     }
// );

