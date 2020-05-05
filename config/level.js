const leveldown = require('leveldown');
const levelup = require('levelup');

const ETH_COSS_DB = levelup(leveldown('./../LevelDatabase/ETHCOSSVolume'));
const BTC_COSS_DB = levelup(leveldown('./../LevelDatabase/BTCCOSSVolume'));

module.exports = { ETH_COSS_DB, BTC_COSS_DB };