const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();
const Web3 = require('web3');
const web3 = new Web3('https://bsc-dataseed1.binance.org:443');
const axios = require('axios');
// const { performance } = require('perf_hooks');
const cheerio = require('cheerio');
const fs = require('fs');

//insert your bot token here
const bot = new Telegraf(process.env.BOT_TOKEN)





//main bot
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

                    if (resultCtx[2] !== undefined) {
                        ctx.reply(`${response.data.data.name}  (${response.data.data.symbol})\n${resultCtx[2]} ${response.data.data.symbol} = $${Math.floor(response.data.data.price * resultCtx[2])}
                        \nPrice : $${response.data.data.price} \nPrice in BNB : $${response.data.data.price_BNB}`)
                    } else {
                        await ctx.reply(`${response.data.data.name}  (${response.data.data.symbol})  \nPrice : $${response.data.data.price} \nPrice in BNB : $${response.data.data.price_BNB}`);
                    }
                })
                .catch(error => {
                    console.log(error.message)
                    if (error.response.status === 404) {
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

//get balance wallet bsc
bot.command('balance', async (ctx) => {
    const senderText = ctx.update.message.text.split(' ');
    const walletAddress = senderText[1];
    if (await walletAddress !== undefined && walletAddress.substr(0, 2) === '0x' && await walletAddress.length == 42) {
        axios.get('https://bscscan.com/address/' + walletAddress)
            .then(async (response) => {
                const $ = cheerio.load(response.data)
                $('.list-custom-BEP-20').each(async (i, item) => {
                    let addressToken = $('a', item).attr('href');
                    let getAddress = addressToken.match(/0x[\a-fA-F0-9\?]{40}/g);
                    let getBalance = $('a > div:nth-child(1) > span', item).text();
                    let intBalance = getBalance.replace(/,/g, '').split(' ');

                    await axios.get('https://api.pancakeswap.info/api/v2/tokens/' + getAddress[0])
                        .then(async (response) => {
                            const result = response.data.data;
                            if (result.price != 0 && result.name != 'unknown') {
                                parseFloat(result.price);
                                parseFloat(intBalance[0]);
                                // console.log(`${result.name} (${result.symbol})\n$${result.price}\n\nBalance : $${intBalance[0] * result.price}\n`)
                                fs.writeFile(`result-${ctx.message.chat.id}.txt`, `${intBalance[0]} <a href="https://bscscan.com/token/${getAddress[0]}">${result.symbol}</a> [ $${(intBalance[0] * result.price).toFixed(4)} ]\n`, { flag: 'a+' }, err => { })
                            } else {
                                fs.writeFile(`result-${ctx.message.chat.id}.txt`, `${intBalance[0]} <a href="https://bscscan.com/token/${getAddress[0]}">${result.symbol}</a>\n`, { flag: 'a+' }, err => { })
                            }
                        })
                        .catch(error => {
                            if (error.response.status === 404) {
                                console.log('LP Not Found in PCS');

                            } else {
                                console.log(error.message)
                            }
                        })
                })
                // console.log($('.list-custom-BEP-20').length);

                // console.log($('.list-custom-BEP-20').html());
            })
            .catch((error) => {
                console.log(error);
            })
    } else {
        ctx.reply('address not valid')
    }

    if (await walletAddress !== undefined) {
        setTimeout(async () => {
            console.log('DONE')
            const data = await fs.readFileSync(`result-${ctx.message.chat.id}.txt`, { encoding: 'utf8', flag: 'r' });
            await ctx.reply(data, { parse_mode: 'HTML' })
            await fs.unlinkSync(`./result-${ctx.message.chat.id}.txt`)
        }, 5000)
    }





})

//price watcher raydium


//start bot
bot.launch()
console.log('Running')


process.once('SIGINT', () => bot.stop('SIGINT'));