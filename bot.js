const { Bot } = require("grammy");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { hydrateFiles } = require("@grammyjs/files");
const fs = require("fs");
require("dotenv").config();

// Create an instance of the `Bot` class and pass your bot token to it.
const bot = new Bot(process.env.BOT_TOKEN); // <-- put your bot token between the ""
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// Use the plugin.
bot.api.config.use(hydrateFiles(bot.token));

// Handle the /start command.
bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
// Handle other messages.
bot.on("message:photo", async (ctx) => {
  const prompt = ctx.message.caption + ", jawab pakai bahasa indonesia!";
  // Prepare the file for download.
  const file = await ctx.getFile();
  // Download the file to a temporary location.
  const path = await file.download();
  // Print the file path.
  console.log("File saved at ", path);
  const image = {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType: "image/png",
    },
  };

  const result = await model.generateContent([prompt, image]);
  ctx.reply(result.response.text());
});

bot.on("message", async (ctx) => {
  const message = ctx.message.text;
  // console.log(message);

  const prompt = "Siapa presiden RI ke-1?";
  const result = await model.generateContent(message);
  console.log(result.response.text());
  ctx.reply(result.response.text());
});

// Start the bot.
bot.start();
