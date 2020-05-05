const ccxt = require("ccxt");

class Coss {
  constructor(apiKey, secret, pair) {
    try {
      this.pair = pair;
      this.exchange = new ccxt.coss({
        apiKey,
        secret
      });
    } catch (error) {
      return error;
    }
  }

  async fetchBalance() {
    let balance = null;
    try {
      balance = await this.exchange.fetchBalance();
    } catch (error) {
      return error;
    }
    return balance;
  }

  async fetchOpenOrders() {
    let data = [];
    try {
      const orders = await this.exchange.fetchOpenOrders(this.pair);
      for (let o of orders) {
        data.push(o.info);
      }
    } catch (error) {
      return error;
    }
    return data;
  }

  async fetchTicker(a = this.pair) {
    let tickerData = null;
    try {
      tickerData = await this.exchange.fetchTicker(a);
    } catch (error) {
      return error;
    }
    const data = {
      timestamp: tickerData.timestamp,
      highBid: tickerData.info.Bid,
      lowAsk: tickerData.info.Ask,
      volume: tickerData.info.Volume,
      lastTradedPrice: tickerData.info.Last,
    };
    return data;
  }

  async fetchTrades(count) {
    let trades = null;
    if (count < 1) {
      return new Error("Count should be more than 0");
    }
    try {
      trades = await this.exchange.fetchTrades(this.pair);
    } catch (error) {
      return error;
    }
    let result = [];
    for (let i = 0; i < count; i++) {
      const data = {
        id: trades[i].id,
        timestamp: trades[i].timestamp,
        pair: trades[i].symbol,
        side: trades[i].side,
        price: trades[i].price,
        amount: trades[i].amount
      };
      result.push(data);
    }
    return result;
  }

  async createOrder(obj) {
    let createOrderData = null;
    try {
      createOrderData = await this.exchange.createOrder(
        this.pair,
        obj.type,
        obj.side,
        obj.amount,
        obj.price
      );
    } catch (error) {
      throw error;
    }
    const data = {
      id: createOrderData.id,
      amount: createOrderData.amount,
      price: createOrderData.price,
      side: createOrderData.side,
      status: createOrderData.status
    };
    return data;
  }

  async timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async cancelOrder(id) {
    const record = {};
    try {
      const orderData = await this.exchange.cancelOrder(id, this.pair);
      record.id = orderData.id;
      await this.timeout(3000);
      const status  = await this.exchange.fetchOrderStatus(id, this.pair);
      record.status = status;
      return record;
    } catch (error) {
      throw error;
    }
  }

  async fetchOrderStatus(id) {
    let status = null;
    try {
      status = await this.exchange.fetchOrderStatus(id, this.pair);
    } catch (error) {
      throw error;
    }
    return status;
  }
}

module.exports = Coss;
