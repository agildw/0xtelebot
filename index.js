const { Telegraf } = require('telegraf');
require('dotenv').config();

//insert your bot token here
const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => ctx.reply('Hello can i help you?'))

//start bot
bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'));