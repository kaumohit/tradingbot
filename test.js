// let Kucoin = require("./exchanges/kucoin");
// "use strict";
// const PAIR_ID = require('./LATOKEN_PAIR_ID').PAIRS;

// let Cobinhood = require("./exchanges/cobinhood");
// let Liquid =    require("./exchanges/liquid");
// let Kucoin =    require("./exchanges/kucoin");
// let Qryptos = require("./exchanges/qryptos");
let Coss = require("./exchanges/coss");
let Binance = require("./exchanges/binance");
// let LATOKEN = require("./exchanges/latoken");
// let ccxt = require("ccxt");
let axios = require('axios');
// const liq1 = new Liquid(
//   "707257",
//   "N40HI5xVraCEYMWUWA1sRxRDQ7ZZVNk5+1A0VJQPE1eJOAXGcsliFyc2aA6wojWEjs0k+pYkAURe4XCmFd10kQ==",
//   "LALA/ETH"
// );
// const bal = liq1.fetchBalance();
// const balance = bal.free.LALA;
// document.getElementById('balanceshow').innerHTML = 'balance';

const driver = async () => {
  // const liq1 = new Liquid(
  //   "707257",
  //   "N40HI5xVraCEYMWUWA1sRxRDQ7ZZVNk5+1A0VJQPE1eJOAXGcsliFyc2aA6wojWEjs0k+pYkAURe4XCmFd10kQ==",
  //   "LALA/ETH"
  // );
  // const liq2 = new Liquid(
  //   "707222",
  //   "wVg16iMR81fTpUPv/4aNhihXdhSeY68uSu/T6WgxVPsaSJK7GaSiucen9pUKxB4V8Gd/WanqZwSsK0EgdDnsEw==",
  //   "LALA/ETH"
  // );
  // const liq3 = new Liquid(
  //   "764670",
  //   "Uv2uDSlyRtrhpUHNFStDT4elHPvIJ3cyfJ9GnusxVnOJ3Y9feiN4rY3hyhcKjGaTNeLDt8LAWcJ4dGolRXaN+g==",
  //   "LALA/ETH"
  // );

  // const kc1 = new Kucoin(
  //   "5c6d12f31cde785f0d2adb95",
  //   "48cf0864-2dcb-4910-8546-ee31704f0ced",
  //   "Rsinha31@12",
  //   "LALA/ETH"
  // );

  const b1 = new Binance(
    'fK7b09anPKnB7RAQ47HBg0UIE1EjWBAti1K3t0LGA7AyfPYPVYCqEknP12ctYjhN',
    'BNTkHGTJma0Vgl8tNoOTPihUddwPS5jYcXIIkbCkRZxuyab7dtexUz5JAGbX8xpK',
    'NEO/BTC'
  )

  const c1 = new Coss(
    'YkUra0ZmUkhDV0ZCNlBKM3A4YTlYa0ZKeVM2NnhIQUF2bDZlYVdKMnZ4eEhkaTNaNC9KZVdCck0za3p5d3V2MTlhZXhVR0Q0ci9yUWFkMFF5OWxiK1lYRk5kVzF6em9SZU5YQnQrbDErYTQ9',
    'HOWP/D8XR6EChflprazdzugsTiujhtOoKX5Laf6SKsY=',
    'COSS/BTC'
  );

  const c2 = new Coss(
    'RmZSUjNSbUJIdjRhN29YRUhLY1o5elIrMWJRMlBTOVhaMDJDMDRyajBxako3ayt4cE5WNm9UaExqSXNJc05EcENCOVY0dGFUVDZneGZrakcyb3psbG9TLzlidEcyMGJVUHd3QjIwcFBCMDg9',
    'SGeYfbtU+YJTxpc07vuV0xHSQr2abzA0sjhVPLKQ/IA=',
    'COSS/BTC'  
  );

  // const c2 = new Coss(
  //   'api-v1-7559123e991ac353bb7d22c5ab50b283',
  //   'api-v1-secret-1ccc7c1b8325f6716e3b0279ab9acf1d',
  //   'GOT/ETH'
  // );
// const a = await axios({method: 'GET',url: `https://api.kucoin.com/api/v1/market/allTickers`});
// for (let i of a.data.data.ticker){
//   if (i.symbol === 'ETH-USDT') 
//   console.log(i);
//   else if (i.symbol === 'BTC-USDT') 
//   console.log(i);
//   else {}
// }
// console.log(a.data.data.ticker);


  // Promise.all([user1.loadMarkets()]).then(result => {
  //   console.log(result[0]);
  //   // for (let i = 0; i < result[0].length; i++) {
  //     // if (result[0][i].symbol == "ETH/USDT") {
  //     //   EthUsd = result[0][i].info.lastDealPrice;
  //     //   EthUsdHigh = result[0][i].info.high;
  //     //   EthUsdLow = result[0][i].info.low;
  //     // }
  //     // console.log(result[0][i].symbol);
  //   // }
  // });  
  // const kc2 = new Kucoin(
  //   "5c6bd4571cde786a836320bb",
  //   "9b13b144-845e-4494-b114-2c2ba854da7b",
  //   "7417822",
  //   "LALA/ETH"
  // );

// const amount = '2000';
// const price = '0.00003620';

// const buy = {
//   type: "limit",
//   side: "buy",
//   amount: amount,
//   price: price
// };

// const sell = {
//   type: "limit",
//   side: "sell",
//   amount: 2000,
//   price: 0.00001200
// };


  
  // console.log("*****************************\n");
  // try {
    // buyOrder1 = await liq2.createOrder(
      // buy.type,
      // buy.side,
      // buy.amount,
      // buy.price
    // );
//  
    // console.log("*****************************\n");
    // console.log("Buy Order posted from id1.");
    // console.log(buyOrder1);
    // console.log("*****************************\n"); 
  //   sellOrder1 = await liq3.createOrder(
  //     sell.type,
  //     sell.side,
  //     sell.amount,
  //     sell.price
  //   );
  //   console.log("Sell Order posted from id1.");
  // console.log(sellOrder1);
  // } catch (err) {
  //   console.log(err);
  //   this.status = err.message;
  // }
  
  // console.log("*****************************\n");
// `
//   // try {
//   //   cancelOrder1 = await liq1.cancelOrder('644565937');
//   // } catch (err) {
//   //   console.log(err);
//   //   this.status = err.message;
//   // }
//   // // this.ordersByID2.push(buyOrder1.id);
//   // console.log("Buy Order posted from id1.");
//   // console.log(cancelOrder1);
//   // console.log("*****************************\n");`
    // const liquid1 = new Liquid(
    //   "683063",
    //   "9NHqGyCV4iS2/U8o03FPudxEnnb3QwfXkOlQlb6ZNiZ9wbQY1c9WRcZCthLN6NHLi5nY3IF9rdMx4oE20Sy1gg==",
    //   "LALA/ETH"
    // );
  
    // const cobin2 = new Liquid(
    //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfdG9rZW5faWQiOiI2MTM5YTkzMi05MzFkLTQ1MWEtODI2MC1jMDhjOThjYjczZTIiLCJzY29wZSI6WyJzY29wZV9leGNoYW5nZV90cmFkZV9yZWFkIiwic2NvcGVfZXhjaGFuZ2VfdHJhZGVfd3JpdGUiLCJzY29wZV9leGNoYW5nZV9sZWRnZXJfcmVhZCJdLCJ1c2VyX2lkIjoiMzBkZGQ0ZGItMzFjNC00YTljLWFkM2MtYzU4NDEwZmEwMmY0In0.mTtBlkVSTDWCBMKRppJWtIJyxdFJfZJeomPn007FEDQ.V2:d07277b9bf54949d6f499e99a81b55f61854f08f5c762b7509786258b826fec0",
    //   "LALA/ETH"
    // );
    
  //     const qryptos2 = new Qryptos(
  //     632924,
  //     "DQYfuAiMe3DwOCMnmvDRVt0qg7BmECaWHnW3gp/bmKE/x3yVSkWeDkbE4E/54aLfGwMNuHDOSclC9SzZqI9zgw==",
  //     "LALA/ETH"
  //   );

  // const data = await kc1.fetchOrderStatus('5c74e700c788c676916019dd', 'LALA/ETH');
  // kc1.fetchOrderStatus('5c74fd875137b902a694d60c', 'LALA/ETH').then(res =>{
  //   console.log('IN console.log 1, ', res);
  //   // console.log(res);
  // }).catch(err =>{
  //   console.log('IN console.log');
  //   console.log('Error!: ', err);
  // })
  // kc2.fetchOrderStatus('5c74eec74c06870eab9a843e', 'LALA/ETH').then(res =>{
  //   console.log('IN console.log 2, ', res);    
  // }).catch(err =>{
  //   console.log('Error!: ', err);
  // });
  // kc1.cancelOrder('5c74eebc89fc8474af231209').then(res =>{
  //   console.log(res);
  // }).catch(err =>{
  //   console.log('Error: '. err);
  // })
  // const data = await kc1.fetchOrderStatus('5c73d17c5137b902a66e2b4b', 'LALA/ETH');
  // console.log(data);  // console.log(await liq2.fetchBalance());
  // console.log(await liq1.fetchBalance());

  // console.log(await liq3.fetchBalance());
  // console.log(await liq3.fetchTrades());
  // const bal = await liq1.fetchBalance();
  // const balance = bal.free.LALA;
  // document.getElementById('balanceshow').innerHTML = 'balance';

  // console.log(balance);
// const ORDER_ID;
// 
// console.log(await la1.fetchBalance());
// console.log(await la1.fetchBalance());
// console.log(await c1.cancelOrder('50133d83-01b9-44af-b041-e10c4ad6d977'));
// console.log(await c1.fetchOrderStatus('93259fe3-03e5-4a1a-be57-33b16591a649'))
console.log(await b1.fetchTrades())
// console.log(await c1.cancelOrder('b1a608b7-65b6-453b-8a28-dfdf32269dd5'));
// console.log(await la1.cancelOrder(ORDER_ID));
/* -------------LATOKEN TESTING FUNCTIONS------------------- */
// const amount = '2000';
// const price = '0.00003620';
// // 
// const buy = {
//   type: "limit",
//   side: "buy",
//   amount: 51,
//   price: 0.00000950
// };
// // 
// const sell = {
//   type: "limit",
//   side: "sell",
//   amount: 51,
//   price: 0.00000950
// };
// console.log(await la2.createOrder(sell));
// console.log(await la1.createOrder(buy));


// const ID = ;
/* CANCEL ORDER */
// console.log(await la1.cancelOrder(ID));
// console.log(await la2.cancelOrder(ID));
  
  // console.log("*****************************\n");
  // try {
    // buyOrder1 = await liq2.createOrder(
      // buy.type,
      // buy.side,
      // buy.amount,
      // buy.price
    // );
//  
    // console.log("*****************************\n");
    // console.log("Buy Order posted from id1.");
    // console.log(buyOrder1);
    // console.log("*****************************\n"); 
  //   sellOrder1 = await liq3.createOrder(
  //     sell.type,
  //     sell.side,
  //     sell.amount,
  //     sell.price
  //   );
  //   console.log("Sell Order posted from id1.");
  // console.log(sellOrder1);
  // } catch (err) {
  //   console.log(err);
  //   this.status = err.message;
  // }
  
  // console.log(await liq2.fetchBalance());
  // console.log(await cobin2.fetchBalance());
  // console.log(await ccxt.cobinhood.fetchTrades('LALA/ETH', Date.now() - 48 * 60 * 60 * 1000));
  // console.log(await cobin1.fetchTicker());

  /* LATOKEN API TESTING */
  // axios({
  //   method: 'GET',
  //   url: `https://latoken.com/api/v1/trading/depth?tradingPairId=370`,
  //   headers: {
  //     "X-Api-Key": 'api-v1-ac416862fa3c9208485a8cb8f75a1cea',
  //     "key": 'api-v1-secret-218fb3754481c3f65a481156a0430f4e'
  //   },
  //   // data: data
  // })
  //   .then(resp => {
  //     // debug('RESPONSE: ', resp);
  //     if (resp.data) {
  //       console.log(resp.data);
  //     } else console.log(null);
  //   })
  //   .catch(err => {
  //     // debug('ERROR in LATOKEN CONSTRUCT: ', err);
  //     console.log(err);
  //   });
  // PAIR_ID.find(el => {
  //   if (el.symbol === 'XRM/ETH') console.log(el);
  //   // else console.log('NOT FOUND');
  // })
  // console.log('-------------------------------------------------------------------------------------------')
};
driver();
// const bal = liq1.fetchBalance();
// const balance = bal.free.LALA;

// setInterval(driver, 5000);

//   let params = {
//     averageFactor: 0.2,
//     tradeCount: 10,
//     spreadUpperLimit: 70,
//     spreadLowerLimit: 30
//   };
//   const vb = new VolumeBot(qryptos1, qryptos2, params);

//   vb.start();
// };

// driver();

// (async () => {
//   const qryptos1 = new Qryptos(
//     665901,
//     "QgE9zYRNX5M69C7oWzQctglj7iuIQzNuWPDczIh6sj5KpA0oDlzLBmFiOVBobNBF5o1vAIQS3SC/mwpbWdQsIA==",
//     "LALA/ETH"
//   );
//   const qryptos2 = new Qryptos(
//     632924,
//     "DQYfuAiMe3DwOCMnmvDRVt0qg7BmECaWHnW3gp/bmKE/x3yVSkWeDkbE4E/54aLfGwMNuHDOSclC9SzZqI9zgw==",
//     "LALA/ETH"
//   );

// console.log(await qryptos2.fetchTrades(10));

// console.log(await qryptos1.fetchBalance());

// console.log(await qryptos.fetchTrades(10));

// console.log(await qryptos2.createOrder('limit', 'BUY', '200', '0.00001000'));

// console.log(await qryptos.fetchOrderStatus(454273550));

// console.log(await qryptos2.cancelOrder(454308483));
// })();

// let user = new vb.VolumeBot('Qryptos',params);

// user.start();

// let callit = async () => {

//   let qryptos = require("./exchanges/qryptos");

// let qp = new qryptos.Qryptos(
//   665901,
//   "QgE9zYRNX5M69C7oWzQctglj7iuIQzNuWPDczIh6sj5KpA0oDlzLBmFiOVBobNBF5o1vAIQS3SC/mwpbWdQsIA==",
//   "LALA/ETH"
// );

//   let record = await qp.fetchTrades();
//   console.log(record);
// };

// callit();
/* (async () => {
  try {
    // return new Promise((resolve, reject) => {
    var a = 7;
    if (a % 2 == 0) return (a / 2);
    else throw (a);
    // });

  } catch (e) {
    console.log('CATCH 1: ', e);
    throw e;
  }
})().then(a => {
  console.log('RESOLVED: ', a);
}).catch(err => {
  console.log('CATCH 2: ', err);
}) */