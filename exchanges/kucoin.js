let ccxt = require("ccxt");

class Kucoin {
  constructor(apiKey, secret, password, pair) {
    try {
      this.pair = pair;
      this.exchange = new ccxt.kucoin2({
        apiKey: apiKey,
        secret: secret,
        password: password
      });
    } catch (error) {
      console.log(error);
    }
  }

  async fetchBalance() {
    try {
      const response = await this.exchange.fetchBalance();
      const data = {
        free: response.free,
        used: response.used,
        total: response.total
      };
      return data;
    } catch (error) {
      return error;
    }
  }

  async fetchTicker() {
    try {
      let data = await this.exchange.fetchTicker(this.pair);
      let record = {
        timestamp: data.timestamp,
        highBid: Number(data.bid).toFixed(7),
        lowAsk: Number(data.ask).toFixed(7),
        volume: data.info.volValue,
        lastTradedPrice: data.info.lastDealPrice,
        lastTradedQuantity: null
      };
      return record;
    } catch (error) {
      return error;
    }
  }

  async fetchTrades(count = null) {
    let data = null;
    let records = [];
    try {
      data = await this.exchange.fetchTrades(
        this.pair,
        Date.now() - 15 * 60 * 60 * 1000,
        50
      );
    } catch (error) {
      return error;
    }
    if (count == null) {
      count = data.length;
    }

    for (let i = data.length - 1; i > data.length - count; i--) {
      let entry = data[i];
      if (entry != undefined && entry != null) {
        let record = {
          id: entry.id,
          timestamp: entry.timestamp,
          pair: entry.symbol,
          side: entry.side,
          price: Number(entry.price).toFixed(7),
          amount: entry.amount
        };
        records.push(record);
      }
    }
    return records;
  }

  async createOrder(type, side, amount, price) {
    let record = null;
    let data = null;
    side = side.toLowerCase();
    try {
      data = await this.exchange.createOrder(
        this.pair,
        type,
        side,
        amount,
        price
      );
      record = {
        id: data.id,
        amount: data.amount,
        price: data.price,
        side: data.side,
        status: data.status
      };
    } catch (error) {
      return error;
    }
    return record;
  }

  async cancelOrder(id) {
    let record = null;
    let data = null;
    try {
      data = await this.exchange.cancelOrder(id);
      record = {
        id: data.id,
        status: data.status === "canceled" ? "cancelled" : data.status
      };
    } catch (error) {
      return error;
    }
    return record;
  }

  async fetchOrderStatus(id) {
    let data = null;
    try {
      data = await this.exchange.fetchOrderStatus(id, this.pair, {
        type: "BUY"
      });
    } catch (error) {
      try {
        data = await this.exchange.fetchOrderStatus(id, this.pair, {
          type: "SELL"
        });
      } catch (err) {
        data = err;
      }
    }
    return data;
  }
}

module.exports = Kucoin;
