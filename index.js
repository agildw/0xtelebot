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
bot.command('dexlab', async (ctx) => {
    const senderText = ctx.update.message.text.split(' ');
    console.log(senderText)
    let prices = [];
    let marketId;
    let namePair;

    if (senderText[1] != undefined) {
        const tokenPair = senderText[1].toUpperCase();
        let firstResult = 0
        let tokenName;
        console.log(tokenPair)

        const getPrice = async () => {
            const config = {
                url: 'https://v-api.dexlab.space/v2/markets/recent',
                method: 'GET',
                headers: {
                    'authority': 'tv-backup-api.dexlab.space',
                    'sec-ch-ua': '"Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99"',
                    'sec-ch-ua-mobile': '?0',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36',
                    'sec-ch-ua-platform': '"Windows"',
                    'accept': '*/*',
                    'origin': 'https://trade.dexlab.space',
                    'sec-fetch-site': 'same-site',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-dest': 'empty',
                    'referer': 'https://trade.dexlab.space/',
                    'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
                }
            }


            await axios(config)
                .then(async (response) => {

                    const data = response.data.data
                    let result = await data.filter(x => x.market === tokenPair)
                    if (result[0].market != undefined) {
                        tokenName = result[0].market.split('/')
                        if (firstResult != 1) {
                            if (senderText[2] !== undefined) {
                                ctx.reply('Started Monitoring ' + tokenPair)
                                ctx.reply(`Market founded!\nMarket : ${result[0].market}\nClose Price : ${result[0].closePrice}\nPrice : ${result[0].price}\nChange Price : ${result[0].changePrice}\nMarket ID : ${result[0].marketAddress}\n\n${senderText[2]} ${tokenName[0]} = $${Number(senderText[2] * result[0].price)}`);
                            } else {
                                ctx.reply(`Market founded!\nMarket : ${result[0].market}\nClose Price : ${result[0].closePrice}\nPrice : ${result[0].price}\nChange Price : ${result[0].changePrice}\nMarket ID : ${result[0].marketAddress}\n`);
                            }

                            firstResult++
                        }
                        namePair = result[0].market;
                        marketId = result[0].marketAddress;
                        prices.push(result[0].price)
                        return result[0].price;
                    }
                })
                .catch((error) => {
                    console.log(error.message)
                })
        }
        await getPrice()
        if (tokenPair == 'CANCEL' || namePair !== undefined) {
            let callFunctionPrice = setInterval(() => {
                getPrice();
                if (prices[prices.length - 1] != prices[prices.length - 2] && senderText[2]) {
                    ctx.reply(`<a href="https://trade.dexlab.space/#/market/${marketId}">${namePair}</a>\nPrice changed! <b>${prices[prices.length - 1]}</b>\n\ ${senderText[2]} ${tokenName[0]} = $${Number(senderText[2] * prices[prices.length - 1])}`, { 'parse_mode': 'HTML', disable_web_page_preview: true });
                } else if (prices[prices.length - 1] != prices[prices.length - 2]) {
                    ctx.reply(`<a href="https://trade.dexlab.space/#/market/${marketId}">${namePair}</a>\nPrice changed! <b>${prices[prices.length - 1]}</b>`, { 'parse_mode': 'HTML', disable_web_page_preview: true });
                }
                if (tokenPair == 'CANCEL') {
                    clearInterval(callFunctionPrice);
                    ctx.reply('Price alert canceled')
                }
                //  else {
                //     console.log('Masih ' + prices[prices.length - 1])
                // }
            }, 30000)
        }
        else {
            ctx.reply('Market not found')
        }

        // if (tokenPair == 'CANCEL') {
        //     let stopJob = cron.scheduleJob['dexlabHayyuk'];
        //     stopJob.stop();
        //     ctx.reply('Price alert canceled')
        // }


    } else {
        ctx.reply('Invalid format\nExample `/dexlab sol/usdc`', { 'parse_mode': 'MarkdownV2' })
    }


})

bot.command('sol', async (ctx) => {
    const senderText = ctx.update.message.text.split(' ');
    let solWallet = senderText[1]
    axios({
        url: `https://api.solscan.io/account/tokens?address=${solWallet}&price=1`,
        method: 'GET',
        headers: {
            'authority': 'api.solscan.io',
            'accept': 'application/json, text/plain, */*',
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
            'origin': 'https://solscan.io',
            'sec-fetch-site': 'same-site',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'referer': 'https://solscan.io/',
            'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            'if-none-match': 'W/"1ec5-qeEAYZxDqmHsk/CbA96p2P6ubmA"'
        }
    })
        .then((response) => {
            const result = response.data.data;
            // console.log(response.data.data)
            let sendText = `[${solWallet}](https://solscan.io/account/${solWallet})\nFounded *${result.length}* Token\n\n`;
            let indexResult = 0;
            result.forEach((element, index) => {
                sendText += element.tokenAmount.uiAmount + ' ';
                if (element.tokenName) {
                    sendText += element.tokenName;
                } else {
                    sendText += `[${element.tokenAddress}](https://solscan.io/account/${element.tokenAccount})\n`;
                }

                if (element.tokenSymbol) {
                    if (element.priceUsdt) {
                        sendText += ` ([${element.tokenSymbol}](https://solscan.io/account/${element.tokenAccount}))`
                        sendText += ` ~ $${element.priceUsdt * element.tokenAmount.uiAmount}\n`
                    } else {
                        sendText += ` ([${element.tokenSymbol}](https://solscan.io/account/${element.tokenAccount}))\n`
                    }

                }
                // sendText += '---\n'


                indexResult++;
            });
            if (result.length == indexResult) {
                // ctx.reply(`Ada ${result.length} Token`)
                ctx.reply(sendText, { parse_mode: 'Markdown', disable_web_page_preview: true })
            } else {
                ctx.reply('not found')
                console.log(indexResult)

            }

        })
        .catch((error) => {
            if (error.data !== undefined) {
                ctx.reply(error.data.message)
            }

        })
})


//start bot
bot.launch()
let today = new Date();
let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
console.log('Running', date, time)


process.once('SIGINT', () => bot.stop('SIGINT'));