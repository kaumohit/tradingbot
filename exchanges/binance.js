const ccxt = require("ccxt");

class Binance {
  constructor(apiKey, secret, pair) {
    try {
      this.pair = pair;
      this.exchange = new ccxt.binance({
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
      balance = await this.exchange.fetchBalance(this.pair);
    } catch (error) {
      return error;
    }
    return balance;
  }

  async fetchTicker() {
    let tickerData = null;
    try {
      tickerData = await this.exchange.fetchTicker(this.pair);
    } catch (error) {
      return error;
    }
    const data = {
      timestamp: Date.now(),
      highBid: tickerData.bid,
      lowAsk: tickerData.ask,
      volume: tickerData.info.volume,
      lastTradedPrice: tickerData.info.lastPrice,
      lastTradedQuantity: tickerData.info.lastQty
    };
    return tickerData;
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

  async createOrder(type, side, amount, price) {
    let createOrderData = null;
    try {
      createOrderData = await this.exchange.createOrder(
        this.pair,
        type,
        side,
        amount,
        price
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

  async cancelOrder(id) {
    let orderData = null;
    let record = null;
    try {
      orderData = await this.exchange.cancelOrder(id, this.pair);
      record = {
        id: data.id,
        status: data.status
      };
    } catch (error) {
      throw error;
    }
    return record;
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

module.exports = Binance;
