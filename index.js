const { Telegraf } = require('telegraf');
require('dotenv').config();
const Web3 = require('web3');
const web3 = new Web3('https://bsc-dataseed1.binance.org:443');


//insert your bot token here
const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => ctx.reply('Hello can i help you?'))

//create wallet command
bot.command('createwallet', (ctx) => {
    const resultWallet = web3.eth.accounts.create();
    const backTick = '`';
    ctx.reply(
        `*Address* : ${backTick}${resultWallet.address}${backTick}\n*Private Key * : ${backTick}${resultWallet.privateKey}${backTick}`, { parse_mode: "MarkdownV2" })
})
//start bot
bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'));