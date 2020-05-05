let process = require('process');
const BigNumber = require('bignumber.js')
let Inventory = require('../models/inventory');
let filledOrder = require('../models/filledOrder');

class SDBot {
  constructor(id1, id2, params) {
    this.id1 = id1;
    this.ordersByID1 = {};
    this.fixedVolume = params.fixedVolume;
    this.hoursFor1000Trades = params.hoursFor1000Trades;
    this.status = 'Running';
    this.checker = null;
    this.starting = false;
    this.runningCheck = false;
    this.checking = false;
    this.filledCount = null;
  }

  async start() {
    let runIt = async () => {
      if (this.starting == false && this.runningCheck == false) {
        this.starting = true;
        await this.runner();
      }
    };
    this.starter = setInterval(runIt, 3000);
  }

  async runner() {
    if (this.runningCheck == false) {
      this.filledCount = 0;
      let standardDeviation = await this.StandardDeviation();
      console.log('\n SD: ')
      let data = await this.id1.fetchTrades(2);
      let lastTradedPrice = Number(data[0].price);

      console.log('*****************************');
      console.log('Last Trade Price: ', lastTradedPrice);
      console.log('Sell Order #1 : ', lastTradedPrice + standardDeviation);
      console.log('Sell Order #2 : ', lastTradedPrice + standardDeviation / 2);
      console.log('Buy Order #1 : ', lastTradedPrice - standardDeviation);
      console.log('Buy Order #2 : ', lastTradedPrice - standardDeviation / 2);

      try {
        let price = lastTradedPrice + standardDeviation;
        price = new BigNumber(price).toFixed(6);
        await this.createOrderAndPushToDB('sell', price, lastTradedPrice);
      } catch (e) { console.log(e); }

      try {
        let price = lastTradedPrice + standardDeviation / 2;
        price = new BigNumber(price).toFixed(6);
        await this.createOrderAndPushToDB('sell', price, lastTradedPrice);
      } catch (e) { console.log(e); }

      try {
        let price = lastTradedPrice - standardDeviation;
        price = new BigNumber(price).toFixed(6);
        await this.createOrderAndPushToDB('buy', price, lastTradedPrice);
      } catch (e) { console.log(e); }

      try {
        let price = lastTradedPrice - standardDeviation / 2;
        price = new BigNumber(price).toFixed(6);
        await this.createOrderAndPushToDB('buy', price, lastTradedPrice);
      } catch (e) { console.log(e); }

      console.log('********OPEN ORDERS*******');
      console.log(this.ordersByID1);
      console.log('********OPEN ORDERS*******');

      await this.checkOrders();
      this.starting = false;
      return;
    }
  }

  async createOrderAndPushToDB(side, price, lastTradedPrice) {
    let order;
    try {
      order = await this.id1.createOrder(
        'limit',
        side,
        this.fixedVolume,
        price
      );
    } catch (e) {
      throw e;
    }
    this.ordersByID1[order.id] = false;
    console.log(`${side} Order posted from id1: ${order.id}`);
    console.log(order);
    console.log('*****************************');

    let data = {
      orderId: order.id,
      side: order.side,
      lastTradedPrice: lastTradedPrice,
      price: order.price,
      state: order.status,
      timestamp: Date.now()
    };
    Inventory.create(data, (err, res) => {
      if (!err) {
        console.log('Inventory Entry Created!');
      } else {
        console.log('Error!: ' + err);
      }
    });
  }

  async checkOrders() {
    this.runningCheck = true;
    let returnValue = null;
    this.checker = setInterval(async () => {
      if (this.checking == false) {
        this.checking = true;
        await runCheck();
        if (returnValue == true) {
          this.starting = false;
          this.runningCheck = false;
          console.log('\nCheck Interval Cleared!');
          clearInterval(this.checker);
          return;
        }
      }
    }, 15000);

    let runCheck = async () => {
      console.log('Inside Runcheck...');
      Object.keys(this.ordersByID1).forEach(async key => {
        let status = await this.id1.fetchOrderStatus(key);
        if (status == 'closed') {
          this.filledCount++;
          if (this.ordersByID1[key] == false) {
            let updatedOrder = null;
            try {
              updatedOrder = await Inventory.findOneAndUpdate(
                { orderId: key },
                { state: 'closed' },
                { new: true }
              );
              console.log('Updated Order:');
              console.log(updatedOrder);
              let data = {
                orderId: updatedOrder.orderId,
                side: updatedOrder.side,
                lastTradedPrice: updatedOrder.lastTradedPrice,
                price: updatedOrder.price,
                filledAt: Date.now()
              };
              filledOrder.create(data, (err, res) => {
                if (!err) {
                  console.log('Inserted in Filled Order!');
                  console.log(res);
                  if (this.filledCount == 2) {
                    console.log('2 orders executed');
                    returnValue = true;
                  } else {
                    returnValue = false;
                  }
                } else {
                  console.log('Error: ' + err);
                }
              });
            } catch (error) {
              console.log(error);
            }
            this.ordersByID1[key] = true;
            await delete this.ordersByID1[key];
          }
        } else {
          console.log('Order Status is Open!');
        }
      }); //here
      this.checking = false;
    };
  }

  async getTrades() {
    let tradeInventory = [];
    let trades = null;

    for (let i = 1; i <= 10; i++) {
      trades = await this.id1.exchange.fetchTrades(
        this.id1.pair,
        Date.now() - i * this.hoursFor1000Trades * 60 * 60 * 1000
      );
      tradeInventory.push(trades);
    }
    console.log('No. LAST OF TRADES: ');
    console.log(tradeInventory.length);

    return tradeInventory;
  }

  async mean() {
    let trades = await this.getTrades();
    let totalTrades = 0;
    let mean = 0;

    for (let j = 0; j < 10; j++) {
      totalTrades += trades[j].length;

      for (let i = 0; i < trades[j].length; i++) {
        mean += Number(trades[j][i].price);
      }
    }

    mean /= totalTrades;
    console.log('mean : ' + mean);
    console.log('totalTrades : ' + totalTrades);

    return { mean, trades, totalTrades };
  }

  async StandardDeviation() {
    let data = await this.mean();
    let mean = data.mean;
    let trades = data.trades;
    let totalTrades = data.totalTrades;
    let standardDeviation = 0;

    for (let j = 0; j < 10; j++) {
      for (let i = 0; i < trades[j].length; i++) {
        standardDeviation += Math.pow(trades[j][i].price - mean, 2);
      }
    }

    standardDeviation /= totalTrades;
    standardDeviation = Math.sqrt(standardDeviation);
    console.log('SD :' + standardDeviation);
    return standardDeviation;
  }

  async reset(botId) {
    clearInterval(this.checker);
    clearInterval(this.starter);
    console.log('Resetting Bot...');

    let orders = await Inventory.find({ botId: botId });

    for (let order of orders) {
      if (order.state != 'closed') {
        try {
          console.log(await this.id1.cancelOrder(order.orderId));
        } catch (err) {
          console.log(err);
        }
      }
      try {
        await Inventory.findByIdAndRemove(order.OrderId);
        console.log(`Removed from Database: ${order.OrderId}`);
      } catch (err) {
        console.log(err);
      }
    }
    return true;
  }

  async stop(id) {
    clearInterval(this.starter);
    await this.reset(id);
    this.ordersByID1 = [];
    this.status = 'stopped';
  }
}

module.exports = SDBot;
