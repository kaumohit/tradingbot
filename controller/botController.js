const Liquid = require("../exchanges/liquid");
const Cobinhood = require("../exchanges/cobinhood");
const Kucoin = require("../exchanges/kucoin");
const VolumeBot = require("../bots/volumeBot");
const SDBot = require("../bots/SDBot");
const MarketBot = require("../bots/MarketBot");
let ActiveBots = {};

const logDetails = (exchange, botType, action) => {
  const timestamp = new Date();
  console.log(
    exchange,
    " ",
    botType,
    " Bot ",
    action,
    " at ",
    timestamp.toLocaleDateString(),
    "   ",
    timestamp.toLocaleTimeString()
  );
};

exports.startBot = async (req, res) => {
  const {
    apiKey1,
    apiKey2,
    secret1,
    secret2,
    params,
    exchange,
    pair,
    password1,
    password2
  } = req.body;

  const botType = req.body.bot;

  let Wrapper = null;
  let BotType = null;
  let BotEngine = null;

  logDetails(exchange, botType, "started");

  if (exchange == null || botType == null) {
    console.log("NULL");
    res.status(400).json({ msg: "Error: Bot credentials not specified!" });
    return;
  }

  switch (exchange) {
    case "Liquid": {
      Wrapper = Liquid;
      break;
    }
    case "Cobinhood": {
      Wrapper = Cobinhood;
      break;
    }
    case "Kucoin": {
      console.log("Inside KUCOIN!");
      Wrapper = Kucoin;
      break;
    }
    default: {
      return;
    }
  }
  switch (botType) {
    case "Volume": {
      BotType = VolumeBot;
      break;
    }
    case "Market": {
      BotType = MarketBot;
      break;
    }
    case "SD": {
      BotType = SDBot;
      break;
    }
    default: {
      return;
    }
  }
  let ex1 = null;
  if (exchange === "Cobinhood") {
    console.log("COBINHOOD!!!");
    ex1 = new Wrapper(apiKey1, pair);
  } else if (exchange === "Kucoin") {
    console.log("Kucoin selcted");
    ex1 = new Wrapper(apiKey1, secret1, password1, pair);
  } else {
    console.log("OTHER THAN COBINHOOD!!!");
    console.log(exchange);
    ex1 = new Wrapper(apiKey1, secret1, pair);
  }
  let ex2 = null;
  if (botType === "Volume") {
    if (exchange === "Cobinhood") {
      ex2 = new Wrapper(apiKey2, pair);
    } else if (exchange === "Kucoin") {
      console.log("Kucoin selcted");
      ex2 = new Wrapper(apiKey2, secret2, password2, pair);
    } else {
      ex2 = new Wrapper(apiKey2, secret2, pair);
    }
  }

  const id = Date.now();
  params.botId = id;
  BotEngine = new BotType(ex1, ex2, params);
  let data = {
    VOL_UPPER: params.volumeUpperLimit,
    VOL_LOWER: params.volumeLowerLimit
  };
  console.log(JSON.stringify(data));
  BotEngine.start();
  const botData = {
    id,
    exchange,
    ref: BotEngine,
    bot: botType
  };
  ActiveBots[id] = botData;
  res.status(200).json({
    msg: `${botType} " BOT started successfully!`,
    ID: id
  });
};

exports.BotDetails = (req, res) => {
  if (Object.keys(ActiveBots).length === 0) {
    res.status(200).json({ msg: "No Active Bots." });
  } else {
    let activeBots = [];
    Object.keys(ActiveBots).forEach(data => {
      let res = {
        id: ActiveBots[data].id,
        exchange: ActiveBots[data].exchange,
        bot: ActiveBots[data].bot
      };
      activeBots.push(res);
    });
    res.status(200).json({ bots: activeBots });
  }
};

exports.stopBot = async (req, res) => {
  const { id } = req.body;
  let ex = ActiveBots[id].exchange;
  let bot = ActiveBots[id].bot;
  await ActiveBots[id].ref.stop(id);
  delete ActiveBots[id];

  logDetails(ex, bot, "Stopped");
  res.status(200).json({ msg: "Bot Stopped successfully", id });
  console.log(`Bot ${id} stopped at ${new Date()}`);
};

exports.getStatus = (req, res) => {
  const { id } = req.body;
  res.status(200).json({
    status: ActiveBots[id].ref.status
  });
};
