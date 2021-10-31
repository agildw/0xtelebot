const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();
const Web3 = require('web3');
const web3 = new Web3('https://bsc-dataseed1.binance.org:443');
const axios = require('axios')

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

bot.command('token', async (ctx) => {
    // await ctx.reply('Please enter token address (0x...)')
    // await ctx.reply('Cancel', Markup.keyboard([
    //     ['🚫 Cancel']
    // ]).oneTime().resize()
    // )
    const resultCtx = await ctx.update.message.text.split(' ');
    if (resultCtx[1] !== undefined) {
        if (resultCtx[1].substr(0, 2) === '0x' && resultCtx[1].length == 42) {

        } else {
            ctx.reply('Please insert valid address')
            console.log(resultCtx[1].length, resultCtx[1].substr(0, 1))
        }
    } else {
        ctx.reply('Please insert token address, Example :\n`/token 0x...`', { parse_mode: 'MarkdownV2' })
    }
    console.log(resultCtx)
})

//get price token


//start bot
bot.launch()
console.log('Running')


process.once('SIGINT', () => bot.stop('SIGINT'));