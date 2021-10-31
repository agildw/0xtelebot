const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();
const Web3 = require('web3');
const web3 = new Web3('https://bsc-dataseed1.binance.org:443');
const axios = require('axios');
const { performance } = require('perf_hooks');

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

//get price token
bot.command('token', async (ctx) => {
    let startPerf = performance.now();
    const resultCtx = await ctx.update.message.text.split(' ');
    if (resultCtx[1] !== undefined) {
        if (resultCtx[1].substr(0, 2) === '0x' && resultCtx[1].length == 42) {
            const config = {
                method: 'GET',
                url: `https://api.pancakeswap.info/api/v2/tokens/${resultCtx[1]}`
            }
            axios(config)
                .then(async response => {
                    console.log(response.data);
                    await ctx.reply(`${response.data.data.name}  (${response.data.data.symbol})  \nPrice : $${response.data.data.price} \nPrice in BNB : ${response.data.data.price_BNB} bnb`);

                    let endPerf = performance.now();
                    await ctx.reply(Math.floor(endPerf - startPerf) / 1000 + 's')
                })
                .catch(error => {
                    console.log(error.message)
                    if (error.message === 'Request failed with status code 404') {
                        ctx.reply('*Error* token not found in pancakeswap', { parse_mode: 'MarkdownV2' })
                    }
                })

        } else {
            ctx.reply('Please insert valid address')
            console.log(resultCtx[1].length, resultCtx[1].substr(0, 1))
        }
    } else {
        ctx.reply('Please insert token address, Example :\n`/token 0x...`', { parse_mode: 'MarkdownV2' })
    }
    console.log(resultCtx)
})


//start bot
bot.launch()
console.log('Running')


process.once('SIGINT', () => bot.stop('SIGINT'));