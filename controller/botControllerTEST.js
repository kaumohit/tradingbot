const Coss = require('../exchanges/coss');
const Binance = require('../exchanges/binance');
const cossVolumeBot = require('../bots/cossVolBot');
const SDBot = require('../bots/SDBot');
let ActiveBots = {};

const logDetails = (exchange, botType, action) => {
  const timestamp = new Date();
  console.log(
    exchange,
    ' ',
    botType,
    ' Bot ',
    action,
    ' at ',
    timestamp.toLocaleDateString(),
    '   ',
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
    pair
  } = req.body;

  const botType = req.body.bot;

  let Wrapper = null;
  let BotType = null;
  let BotEngine = null;

  logDetails(exchange, botType, 'started');

  if (!exchange || !botType) {
    res.status(400).json({ msg: 'Error: Bot credentials not specified!' });
    return;
  }

  switch (exchange) {
    case 'COSS': {
      Wrapper = Coss;
      break;
    }
    case 'Binance': {
      Wrapper = Binance;
      break;
    }
    default: {
      return;
    }
  }
  switch (botType) {
    case 'Volume': {
      BotType = cossVolumeBot;
      break;
    }
    case 'SD': {
      BotType = SDBot;
      break;
    }
    default: {
      return;
    }
  }
  const ex1 = new Wrapper(apiKey1, secret1, pair);
  const ex2 = new Wrapper(apiKey2, secret2, pair);

  const id = Date.now();
  params.botId = id;
  BotEngine = new BotType(ex1, ex2, params);
  BotEngine.start();
  const botData = {
    id,
    exchange,
    ref: BotEngine,
    bot: botType
  };
  ActiveBots[id] = botData;
  res.status(200).json({
    msg: `${botType} ' BOT started successfully!`,
    ID: id
  });
};

exports.BotDetails = (req, res) => {
  if (Object.keys(ActiveBots).length === 0) {
    res.status(200).json({ msg: 'No Active Bots.' });
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
  console.log(`Bot ${id} STOP called: `);
  console.log(`${ActiveBots[id].ref}`);
  await ActiveBots[id].ref.stop();
  delete ActiveBots[id];
  logDetails(ex, bot, 'Stopped');
  res.status(200).json({ msg: 'Bot Stopped successfully', id });
  console.log(`Bot ${id} stopped at ${new Date()}`);
};

exports.getStatus = (req, res) => {
  const { id } = req.body;
  res.status(200).json({
    status: ActiveBots[id].ref.status
  });
};
