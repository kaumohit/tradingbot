let delay = require("delay");
class VolumeBot {
  constructor(id1, id2, params) {
    this.averageFactor = params.averageFactor;
    this.tradeCount = params.tradeCount;
    this.spreadUpperLimit = params.spreadUpperLimit;
    this.spreadLowerLimit = params.spreadLowerLimit;
    this.id1 = id1;
    this.id2 = id2;
    this.ordersByID1 = [];
    this.ordersByID2 = [];
    this.averageFactorApplied = false;
    this.tradesAmountPercentage = params.tradesAmountPercentage;
    this.tradeNotHappenBefore = params.tradeNotHappenBefore;
    this.amountRandomOffset = params.amountRandomOffset;
    this.volumeUpperLimit = params.volumeUpperLimit;
    this.volumeLowerLimit = params.volumeLowerLimit;
    this.status = "Running";
    this.tradeAvg = null;
    this.running = 0;
  }

  async start() {
    this.botInterval = setInterval(async () => {
      console.log("starting");
      let data = await this.id1.fetchTrades(2);
      if (data[0] == undefined) {
        data = await this.id1.fetchTrades(2);
      }
      if (this.running == 0) {
        if (
          data[0].timestamp <
          Date.now() - this.tradeNotHappenBefore * 60 * 1000
        ) {
          this.running = 1;
          await this.runner();
        } else {
          console.log(
            `Some Trade happened within past ${
              this.tradeNotHappenBefore
            } minutes.`
          );
        }
      }
    }, 30 * 1000);
  }

  async runner() {
    let i = 0;
    let tradesAmount = null;
    this.tradeAvg = await this.getAvg();
    // console.log('TRADE AVG: ');
    // console.log(this.tradeAvg);
    // console.log('AVG FACTOR: ', this.averageFactor);
    // console.log(this.averageFactorApplied);
    if (this.volumeUpperLimit == "" || this.volumeUpperLimit == "") {
      console.log("here");
    
    if (!this.averageFactorApplied) {
      
        this.tradeAvg = this.averageFactor * this.tradeAvg;
        this.averageFactorApplied = true;
      }
    }
    console.log("runner");
    while (i < this.tradeCount) {
      console.log("trades");
      let tradesPrice = await this.getPrice();
      if (this.volumeUpperLimit == "" || this.volumeUpperLimit == "") {
        console.log("GET AMOUNT ENTERED!");
        tradesAmount = await this.getAmount();
      } else {
        console.log("i was here");
        tradesAmount = await this.getRandomVolume();
      }
      // const tradesAmountWithFeesSELL = tradesAmount + tradesAmount * 0.001; /* 0.1% Fee added for Kucoin */
      // const tradesAmountWithFeesBUY1 = tradesAmount - (tradesAmount * 0.001); /* 0.1% Fee added for Kucoin */
      console.log("////////////////////FIRST ROUND/////////////////////////\n");
      console.log({ tradesPrice, tradesAmount:tradesAmount.toFixed(4)});/* , tradesAmountWithFeesBUY1: tradesAmountWithFeesBUY1.toFixed(7) }); */

      console.log("*****************************");
      let sellOrder1 = null;
       try {
         sellOrder1 = await this.id1.createOrder(
           "limit",
           "sell",
           tradesAmount.toFixed(4),
           tradesPrice.toFixed(7)
         );
       } catch (error) {
         console.log(error);
         this.status = error.message;
       }
      this.ordersByID1.push(sellOrder1.id);
      console.log("sell Order posted from id1: ", sellOrder1.id);
      console.log(sellOrder1);
      console.log("*****************************");
      
      let buyOrder1;
      try {
        buyOrder1 = await this.id2.createOrder(
          "limit",
          "buy",
          tradesAmount.toFixed(4),
          tradesPrice.toFixed(7),
        );
      } catch (err) {
        console.log(err);
        this.status = err.message;
      }
      this.ordersByID2.push(buyOrder1.id);
      console.log("buy Order posted from id2.");
      console.log(buyOrder1);
      console.log("*****************************\n");
      i++;
      let randomTime = Math.random() * 29 + 1;
      console.log("first random time : ", randomTime);
      await delay(5 * 1000);
      this.id1.fetchOrderStatus(sellOrder1.id, 'LALA/ETH').then(async res1 =>{
        if (res1 === 'open') {
          const stat = await Promise.all([this.id1.cancelOrder(sellOrder1.id), this.id2.cancelOrder(buyOrder1.id)]);
          const orderStat = await Promise.all([this.id1.fetchOrderStatus(sellOrder1.id, 'LALA/ETH'), this.id2.fetchOrderStatus(buyOrder1.id, 'LALA/ETH')]);
          if (orderStat[0] === 'open' || orderStat[1] === 'open') {
            console.log(`ORDER IS STILL OPEN IN FIRST ROUND FOR ID1: ${sellOrder1.id} & ID2: ${buyOrder1.id}`);
          } else {
            console.log(`ALL ORDERS CLOSED!`);
          }
        } else console.log(`ALL ORDERS COMPLETED!`);
      });
      await delay(randomTime * 1000);
        
      tradesPrice = await this.getPrice();
      if (this.volumeUpperLimit == "" || this.volumeUpperLimit == "") {
        tradesAmount = await this.getAmount();
      } else {
        tradesAmount = await this.getRandomVolume();
      }
      console.log("////////////////////SECOND ROUND/////////////////////////\n");
      // const tradesAmountWithFeesBUY2 = tradesAmount - (tradesAmount * 0.001); /* 0.1% Fee added for Kucoin */
      console.log({ tradesPrice, tradesAmount:tradesAmount.toFixed(4)/* , tradesAmountWithFeesBUY2: tradesAmountWithFeesBUY2.toFixed(7) */ });

      let sellOrder2;
      try {
        sellOrder2 = await this.id2.createOrder(
          "limit",
          "sell",
          tradesAmount.toFixed(4),
          tradesPrice.toFixed(7)
        );
      } catch (err) {
        console.log(err);
        this.status = err.message;
      }
      this.ordersByID2.push(sellOrder2.id);
      console.log("sell Order posted from id2: ", sellOrder2.id);
      console.log(sellOrder2);
      console.log("*****************************");

      let buyOrder2;
      try {
        buyOrder2 = await this.id1.createOrder(
          "limit",
          "buy",
          tradesAmount.toFixed(4),
          tradesPrice.toFixed(7),
        );
      } catch (err) {
        console.log(err);
        this.status = err.message;
      }
      this.ordersByID1.push(buyOrder2.id);
      console.log("buy Order posted from id2: ", buyOrder2.id);
      console.log(buyOrder2);
      console.log("*****************************\n");

      i++;
      randomTime = Math.random() * 29 + 1;
      console.log("Second random time : ", randomTime);
      await delay(5 * 1000);
      this.id2.fetchOrderStatus(sellOrder2.id, 'LALA/ETH').then(async res2 =>{
        if (res2 === 'open') {
          const stat = await Promise.all([this.id2.cancelOrder(sellOrder2.id), this.id1.cancelOrder(buyOrder2.id)]);
          const orderStat = await Promise.all([this.id2.fetchOrderStatus(sellOrder2.id, 'LALA/ETH'), this.id1.fetchOrderStatus(buyOrder2.id, 'LALA/ETH')]);
          if (orderStat[0] === 'open' || orderStat[1] === 'open') {
            console.log(`ORDER IS STILL OPEN IN SECOND ROUND FOR ID1: ${sellOrder2.id} & ID2: ${buyOrder2.id}`);
          } else {
            console.log(`ALL ORDERS CLOSED!`);
          }
        } else console.log(`ALL ORDERS COMPLETED!`);
      });
      await delay(randomTime * 1000);
    }
    await delay(this.tradeNotHappenBefore * 60 * 1000);
    this.running = 0;
  }

  async getAvg() {
    let trades = await this.id1.fetchTrades(11);
    let sum = 0;
    if (trades == null) {
      this.runner();
      return;
    }
    trades.forEach(trade => {
      sum += trade.amount;
    });
    let average = sum / 10;
    return average;
  }

  async getAmount() {
    const amountUpper = this.tradeAvg * (1 + this.amountRandomOffset / 100);
    const amountLower = this.tradeAvg * (1 - this.amountRandomOffset / 100);
    console.log("GET AMOUNT");
    console.log(amountUpper, amountLower);
    const amount = Math.floor(
      Math.random() * (amountUpper - amountLower) + amountLower
    );
    return amount;
  }

  async getRandomVolume() {
    let random = Math.random();
    console.log("rad", random);
    let diff = this.volumeUpperLimit - this.volumeLowerLimit;
    console.log(diff);
    const amount = Math.floor(random * diff + Number(this.volumeLowerLimit));
    console.log("amount", amount);
    return amount;
  }

  async getPrice() {
    let tickerData = await this.id1.fetchTicker();

    let spread = Number(tickerData.lowAsk) - Number(tickerData.highBid);
    console.log("Spread:");
    console.log(spread);
    let randomValue = Math.floor(
      Math.random() * Number(this.spreadUpperLimit - this.spreadLowerLimit) +
        Number(this.spreadLowerLimit) +
        1
    );
    let tradesPrice =
      Number(tickerData.highBid) + Number((randomValue / 100) * spread);
    console.log("VALUES:");
    console.log(tradesPrice);
    return tradesPrice;
  }

  async deleteUnsuccessfulOrders() {
    if (this.ordersByID1.length != 0) {
      for (let i = 0; i < this.ordersByID1.length; i++) {
        let status = this.id1.fetchOrderStatus(this.ordersByID1[i]);
        if (status !== "closed") {
          await this.id1.cancelOrder(this.ordersByID1[i]);
          console.log("cancelled order: ", this.ordersByID1[i]);
        }
      }
    }
    if (this.ordersByID2.length != 0) {
      for (let j = 0; j < this.ordersByID2.length; j++) {
        let status = this.id2.fetchOrderStatus(this.ordersByID2[j]);
        if (status !== "closed") {
          await this.id2.cancelOrder(this.ordersByID2[j]);
          console.log("cancelled order: ", this.ordersByID2[j]);
        }
      }
    }
  }

  async stop() {
    clearInterval(this.botInterval);
    await this.deleteUnsuccessfulOrders();
    this.ordersByID1 = [];
    this.ordersByID2 = [];
    this.status = "stopped";
  }
}

module.exports = VolumeBot;
