const { Telegraf, Markup, session } = require("telegraf");
const fs = require("node:fs");
const path = require("path");
const OpenAI = require("openai");
const axios = require("axios");
const dotenv = require("dotenv");
const GibberishDetector = require("gibberish-detector");

const { SQLite } = require("@telegraf/session/sqlite");


const {
  start,
  menu,
  selectChat,
  history,
  dialog,
  exportDialogs,
} = require("./events");
const config = require("./config");
const { prisma } = require("./handler/database");
const store = SQLite({
  filename: "./telegraf-sessions.sqlite",
});
// const { responseStream } = require("./handler/ai");
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const bot = new Telegraf(process.env.BOT_TOKEN, {});

bot.context.chats = {};

bot.use(session({ store }));
bot.action("comming_soon", async (ctx) => {
  await ctx.editMessageText(" coming soon: ");

  await ctx.editMessageReplyMarkup(
    Markup.inlineKeyboard([
      [
        {
          text: "RAQ support (ON)",
          callback_data: "soon",
        },
      ],
      [
        {
          text: "GPT-4o (ON)",
          callback_data: "soon",
        },
      ],
      [
        {
          text: "GPU/CPU Usage (ON)",
          callback_data: "soon",
        },
      ],
      [
        {
          text: "Dalle Images (ON)",
          callback_data: "soon",
        },
      ],
      [
        {
          text: "Text-to-Voice (in development)",
          callback_data: "soon",
        },
      ],
      [
        {
          text: "Whisper Model (ON)",
          callback_data: "soon",
        },
      ],
      [
        {
          text: "Multilingual Support (ON)",
          callback_data: "soon",
        },
      ],
      [
        {
          text: "Image + Voice to Video (Visonique)",
          callback_data: "soon",
        },
      ],
      [
        {
          text: "Personalization (ON)",
          callback_data: "soon",
        },
      ],
      [
        {
          text: "Natural Query Interpretation (ON)",
          callback_data: "soon",
        },
      ],
      [
        {
          text: "Adaptive Learning (ON)",
          callback_data: "soon",
        },
      ],
      [
        {
          text: "Proactive Assistant (ON)",
          callback_data: "soon",
        },
      ],
      [
        {
          text: "Text-to-Website (beta)",
          callback_data: "soon",
        },
      ],
      [{ text: "Back", callback_data: "BackMenu" }],
    ]).reply_markup,
  );
});
bot.action("soon", async (ctx) => {
  await ctx.reply("This feature has been turned off.");
});
bot.action("portal", async (ctx) => {
  await ctx.editMessageText("XEI Portal: ");
  await ctx.editMessageReplyMarkup(
    Markup.inlineKeyboard([
      [{ text: "X", url: "https://x.com/xei_official" }],
      [{ text: "Website", url: "https://www.xei.ai/" }],
      [{ text: "Whitepaper", url: "https://xei.gitbook.io/documentation" }],
      [{ text: "Telegram Group", url: "https://t.me/xei_ai" }],
      [{ text: "Medium", url: "https://xei.medium.com/" }],
      [
        {
          text: "$XEI Coin",
          url: "https://xei.gitbook.io/documentation/general-info/xei-coin",
        },
      ],
      [
        {
          text: "Staking dApp",
          url: "https://xei.gitbook.io/documentation/utility/staking-dapp",
        },
      ],
      [
        {
          text: "#AIaaS",
          url: "https://xei.gitbook.io/documentation/utility/aiaas",
        },
      ],
      [{ text: "Create Cluster", url: "https://xei.ai/create-cluster/" }],
      [
        {
          text: "Marketing Plan",
          url: "https://xei.gitbook.io/documentation/general-info/marketing-plan-for-xei-coin",
        },
      ],
      [
        {
          text: "Roadmap 2024",
          url: "https://xei.gitbook.io/documentation/company/roadmap-2024",
        },
      ],
      [
        {
          text: "Partnerships",
          url: "https://xei.gitbook.io/documentation/company/partnerships",
        },
      ],
      [{ text: "About Us", url: "https://xei.ai/about-us/" }],
      [{ text: "Back", callback_data: "BackMenu" }],
    ]).reply_markup,
  );
});

const changeMode = async (ctx, index) => {
  currentIndex = index;
  let profiles = config.profiles.slice(currentIndex, currentIndex + 5);
  let keyboard = [];
  for (let el of profiles) {
    console.log(el);
    keyboard.push([{ text: el.name, callback_data: el.name }]);
  }

  if (config.profiles.length - (currentIndex + 5) > 0)
    keyboard.push([
      // { text: "Back", callback_data: "next-" + toString(currentIndex - 5) },
      { text: "Next", callback_data: "next-" + currentIndex },
    ]);
  keyboard.push([{ text: "Back to menu", callback_data: "BackMenu" }]);
  await ctx.reply(
    `Select chat mode (${config.profiles.length + 2} modes available)`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Dalle(Image Generation)",
              callback_data: "ImageGenerationMode",
            },
          ],
          [
            {
              text: "VoiceGPT(audio message prompt)",
              callback_data: "VoiceGPT",
            },
          ],
          //   [{ text: "GPT4(PRO)", callback_data: "GPT4" }],
          ...keyboard,
        ],
      },
    },
  );
};

bot.hears("/mode", async (ctx) => changeMode(ctx, 0));
bot.on("voice", async (ctx) => {
  // console.log(ctx);

  const data = await prisma.currentAssitant.findFirst({
    where: {
      userid: ctx.from.id.toString(),
    },
  });

  if (data.chatMode != "VoiceGPT") {
    await ctx.reply("Please select a VoiceGPT chat mode. use: /menu");
    return;
  }
  // download audio
  // console.log(ctx);

  const audio = ctx.message.voice;
  const audioLink = await ctx.telegram.getFileLink(audio.file_id);

  // Define a path where you want to save the audio file locally
  const filePath =
    __dirname + `/${ctx.from.id.toString()}.${audio.mime_type.split("/")[1]}`;
  // console.log(filePath);
  // Download the audio file using Axios
  const res = await axios({
    method: "GET",
    url: audioLink,
    responseType: "stream",
  });

  // Create a writable stream to save the audio file
  const writeStream = fs.createWriteStream(filePath);

  // Pipe the response data stream to the write stream to save the audio file
  res.data.pipe(writeStream);

  // Listen for when the file writing is complete
  writeStream.on("finish", async () => {
    // console.log("Audio file saved successfully:", filePath);

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
    });

    // fs.dele;

    // console.log(transcription);
    await ctx.reply("YOU: \n" + transcription.text);
    fs.unlinkSync(filePath, (e) => console.log("could not delete"));
    // console.log(transcription.text);
    const settings = await prisma.userSettings.findFirst({
      where: {
        userid: ctx.from.id.toString(),
      },
    });
    if (!settings) {
      await ctx.reply("Looks like you have not ran /start. Please run it .");
      return;
    }
    // const el = { name: data["chatMode"], desc: desc.desc };
    const prompt = `I want you to act like you are GPT4.
    prompt : ${transcription.text}`;
    // console.log(prompt);

    let message = await ctx.reply("...");
    // console.log(settings.gpt);
    const stream = await openai.chat.completions.create({
      model: settings.gpt,
      messages: [{ role: "user", content: prompt }],
      stream: true,
    });
    let response = "";

    for await (const chunk of stream) {
      if (
        chunk.choices[0]?.delta?.content == null ||
        chunk.choices[0]?.delta?.content == ""
      )
        continue;

      const newText = chunk.choices[0]?.delta?.content || "";
      response += newText;

      if (message.text != response) {
        try {
          await bot.telegram.editMessageText(
            message.chat.id,
            message.message_id,
            undefined,
            response,
          );
        } catch (e) {}
      }
    }
    try {
      const user = ctx.from.id.toString();

      const dataPoint = await prisma.userPurchasedToken.findUnique({
        where: { userid: user },
      });

      if (!dataPoint) {
        throw new Error("Data point not found");
      }

      // Calculate the new value
      const currentValue = dataPoint.token;
      const newValue =
        currentValue - transcription.text.length / 4 - response.length / 4;

      console.log(newValue);
      // Update the database with the new value
      await prisma.userPurchasedToken.update({
        where: { userid: user },
        data: {
          token: parseInt(newValue),
        },
      });
      // }
    } catch (e) {
      console.log("error happened for ", data);
      console.log(e);
    }
  });
});
bot.start(async (ctx) => {
  await ctx.reply(`Hello!
  I am the most advanced Artificial Intelligence in the world (created by XEIAI).

  I can help you with many tasks. For example:
  – write a social media post, an essay, an email
  – recognize your 🎤 Voice Messages
  – write/fix code
  – draw a picture
  – translate text into any language better than Google Translate
  – solve homework
  – correct errors in the text
  – be your personal psychologist
  - ... I can do anything!
  If you need help, go to 🏠 Menu:
    ⤷ Command: /menu`);
  await ctx.reply(`Let's get started! use /new to start a new interaction.`);
  console.log("username", ctx.from.username);
  try {
    await prisma.userSettings.create({
      data: {
        userid: ctx.from.id.toString(),
        username: ctx.from.username || "User",
        language: "ENGLISH",
        gpt: "gpt-4-turbo-preview",
        response: "short",
      },
    });
  } catch (e) {
    console.log(e);
  }
  try {
    const tokens = await prisma.userPurchasedToken.findFirst({
      where: {
        userid: ctx.from.id.toString(),
      },
    });
    console.log(tokens);
    if (!tokens) {
      await prisma.userPurchasedToken.create({
        data: {
          userid: ctx.from.id.toString(),
          token: 10000,
        },
      });
    }
  } catch (e) {
    console.log(e);
  }
});

bot.action("Help", async (ctx) => {
  await ctx.replyWithMarkdownV2(`I'm Synthi AI 🤖

  Commands:
  ⚪ /menu – Menu
  ⚪ /new – Start new interaction\\(\\*required\\)
  ⚪ /settings – Show settings

  🧠 GPT\\-4 Turbo is available
  🎨 Image Generation mode is live
  🎤 Voice Messages can be used

  Key Points to Remember:
  \\- Your conversation's length directly influences token consumption; shorter dialogs save tokens
  \\- Restart the conversation using the /new command
  \\- Utilize English \\(🇬🇧\\) for enhanced response quality

  The GPT\\-4 Turbo mode uses ten times the tokens compared to ChatGPT\\.
  👩🏼‍💻 Support: @marcus\\_xei \\- Lead Synthi Architect
  📜 [More details in our page](https://xei.gitbook.io/documentation/utility/synthi-ai-assistant) \\.
  `);
});
bot.hears("/help", async (ctx) => {
  await ctx.replyWithMarkdownV2(`I'm Synthi AI 🤖

  Commands:
  ⚪ /menu – Menu
  ⚪ /new – Start new interation\\(\\*required\\)
  ⚪ /settings – Show settings

  🧠 GPT\\-4 Turbo is available
  🎨 Image Generation mode is live
  🎤 Voice Messages can be used

  Key Points to Remember:
  \\- Your conversation's length directly influences token consumption; shorter dialogs save tokens
  \\- Restart the conversation using the /new command
  \\- Utilize English \\(🇬🇧\\) for enhanced response quality

  The GPT\\-4 Turbo mode uses ten times the tokens compared to ChatGPT\\.
  👩🏼‍💻 Support: @marcus\\_xei \\- Lead Synthi Architect
  📜 [More details in our page](https://xei.gitbook.io/documentation/utility/synthi-ai-assistant) \\.
  `);
});
bot.hears("/help", async (ctx) => {
  await ctx.replyWithMarkdownV2(`I'm Synthi AI 🤖

  Commands:
  ⚪ /menu – Menu
  ⚪ /new – Start new interation\\(required\\)
  ⚪ /settings – Show settings

  🧠 GPT\\-4 Turbo is available
  🎨 Image Generation mode is live
  🎤 Voice Messages can be used

  Key Points to Remember:
  \\- Your conversation's length directly influences token consumption; shorter dialogs save tokens
  \\- Restart the conversation using the /new command
  \\- Utilize English \\(🇬🇧\\) for enhanced response quality

  The GPT\\-4 Turbo mode uses ten times the tokens compared to ChatGPT\\.
  👩🏼‍💻 Support: @marcus\\_xei \\- Lead Synthi Architect
  📜 [More details in our page](https://xei.gitbook.io/documentation/utility/synthi-ai-assistant) \\.
  `);
});
bot.hears("/help", async (ctx) => {
  await ctx.replyWithMarkdownV2(`I'm Synthi AI 🤖

  Commands:
  ⚪ /menu – Menu
  ⚪ /new – Start new interation\\(required\\)
  ⚪ /settings – Show settings

  🧠 GPT\\-4 Turbo is available
  🎨 Image Generation mode is live
  🎤 Voice Messages can be used

  Key Points to Remember:
  \\- Your conversation's length directly influences token consumption; shorter dialogs save tokens
  \\- Restart the conversation using the /new command
  \\- Utilize English \\(🇬🇧\\) for enhanced response quality

  The GPT\\-4 Turbo mode uses ten times the tokens compared to ChatGPT\\.
  👩🏼‍💻 Support: @marcus\\_xei \\- Lead Synthi Architect
  📜 [More details in our page](https://xei.gitbook.io/documentation/utility/synthi-ai-assistant) \\.
  `);
});
bot.hears("/menu", menu);
bot.hears("/new", (ctx) => {
  start(ctx, bot);
});
bot.action("VoiceGPT", async (ctx) => {
  try {
    await prisma.currentAssitant.update({
      data: {
        chatMode: "VoiceGPT",
      },
      where: {
        userid: ctx.from.id.toString(),
      },
    });
  } catch (e) {
    console.log(e);
  }
  await ctx.reply("Start sending the voice prompts..");
});
bot.action("ImageGenerationMode", async (ctx) => {
  // TODO: check for subscription
  try {
    await prisma.currentAssitant.update({
      data: {
        chatMode: "ImageGenerationMode",
      },
      where: {
        userid: ctx.from.id.toString(),
      },
    });
  } catch (e) {
    console.log(e);
    await ctx.reply("Looks Like you never ran /new");
    return;
  }

  await ctx.reply("Start sending the image prompts..");
});
bot.action("changeUsername", async (ctx) => {
  console.log("before", bot.context[ctx.from.id]);
  ctx.reply("Now, please send me a message.");
  bot.context[ctx.from.id] = true;
  // console.log(bot.session);
  await ctx.answerCbQuery();
});

bot.action("AIMODEL", async (ctx) => {
  try {
    await ctx.editMessageText(`
    ChatGPT is that well-known model. It's fast and cheap. Ideal for everyday tasks. If there are some tasks it can't handle, try the GPT-4

    💡 Note: ChatGPT consumes 25x less tokens than GPT-4. Prefer using it for daily tasks.

    🟢🟢🟢⚪️⚪️ – Smart

    🟢🟢🟢🟢🟢 – Fast

    🟢🟢🟢🟢🟢 – Cheap

    Select model:`);
    await ctx.editMessageReplyMarkup(
      Markup.inlineKeyboard([
        [{ text: "GPT4", callback_data: "changeGPT|gpt-4-turbo-preview" }],
        [{ text: "Back", callback_data: "BackMenu" }],
      ]).reply_markup,
    );
  } catch (e) {
    console.log(e);
  }
});
bot.action(/changeGPT|w+/, async (ctx) => {
  // console.log(ctx.match.input);
  try {
    const response = ctx.match.input.split("|")[1];
    console.log(response);
    if (response == "gpt-3.5-turbo") {
      await prisma.userSettings.update({
        data: {
          gpt: response,
        },
        where: {
          userid: ctx.from.id.toString(),
        },
      });
      await ctx.reply(`GPT changed to ChatGPT3 turbo.`);
    } else {
      //TODO :  check for subscription.
      await prisma.userSettings.update({
        data: {
          gpt: response,
        },
        where: {
          userid: ctx.from.id.toString(),
        },
      });

      await ctx.reply(`GPT changed to  GPT4`);
    }
  } catch (e) {
    console.log(e);
    await ctx.reply(`We don't have any record of you. run /start.`);
  }
});

bot.hears("/settings", async (ctx) => {
  try {
    await ctx.reply(`⚙️ Settings:`, {
      reply_markup: {
        inline_keyboard: [
          /* Inline buttons. 2 side-by-side */
          [
            {
              text: "Username",
              callback_data: "changeUsername",
            },
          ],

          // [
          //   { text: "Short Response", callback_data: "Response-short" },
          //   { text: "Detailed Model", callback_data: "Response-detailed" },
          // ],
          [{ text: "AI Model", callback_data: "AIMODEL" }],
          [{ text: "Purchase", callback_data: "purchase" }],
          [{ text: "Back to menu", callback_data: "BackMenu" }],
        ],
      },
    });
  } catch (e) {
    console.log(e);
  }
});
bot.action("settings", async (ctx) => {
  try {
    await ctx.editMessageText("⚙️ Settings:");
    await ctx.editMessageReplyMarkup(
      Markup.inlineKeyboard([
        [
          {
            text: "Username",
            callback_data: "changeUsername",
          },
        ],
        // [{text: "Tokens",callback_da}]
        [{ text: "AI Model", callback_data: "AIMODEL" }],
        [{ text: "Purchase", callback_data: "purchase" }],
        [{ text: "Back to menu", callback_data: "BackMenu" }],
      ]).reply_markup,
    );
  } catch (e) {
    console.log(e);
  }
});
bot.action("purchase", async (ctx) => {
  await ctx.reply("Payment Link is being generated for 50USD");
  const data = await axios.post(
    "http://localhost:3000/create",
    {
      userid: ctx.from.id.toString(),
      amount: 50,
    },
    { "Content-Type": "application/json", "User-Agent": "insomnia/8.6.1" },
  );
  console.log(data);
  await ctx.reply(data.data.url);
});
bot.action(/^Response-\w+/, async (ctx) => {
  const text = ctx.match[0].split("-")[1];
  try {
    await prisma.userSettings.update({
      data: {
        response: text,
      },
      where: {
        userid: ctx.from.id.toString(),
      },
    });
  } catch (e) {
    console.log(e);
  }
});
bot.action("SelectChat", selectChat);
bot.action(/^history-\d+-\d+$/, history);
bot.action(/Dialog-\d+/, dialog);

bot.action(/ExportDialogs-\d+/, exportDialogs);
bot.action("DeleteAllDialogs", async (ctx) => {
  await ctx.editMessageText(
    `You sure want to delete the Dialogs(Irreversible)? `,
  );
  await ctx.editMessageReplyMarkup(
    Markup.inlineKeyboard([
      [{ text: "Yes", callback_data: "ConfirmDeleteAllDialogs" }],
      [{ text: "Back to menu", callback_data: "BackMenu" }],
    ]).reply_markup,
  );
});
bot.action("ConfirmDeleteAllDialogs", async (ctx) => {
  try {
    await prisma.chat.deleteMany({
      where: {
        userid: ctx.from.id.toString(),
      },
    });
    await prisma.interaction.deleteMany({
      where: {
        userid: ctx.from.id.toString(),
      },
    });
    await prisma.currentInteraction.deleteMany({
      where: {
        userid: ctx.from.id.toString(),
      },
    });
    await ctx.editMessageText(`Deleted All dialogs`);
    await ctx.editMessageReplyMarkup(Markup.inlineKeyboard([]).reply_markup);
  } catch (e) {
    // await ctx.reply("Failed to delete all dialogs");
    console.log(e);
  }
});
bot.action(/back-\d+/, async (ctx) => {
  let data = ctx.match[0].split("-")[1];
  // const data = ctx.match[1].split("-")[1];
  console.log("back", data);
  let profiles = config.profiles.slice(data, data + 5);

  let keyboard = [];

  if (data == 0) {
    keyboard.push([
      {
        text: "Dalle(Image Generation)",
        callback_data: "ImageGenerationMode",
      },
    ]);
    keyboard.push([
      {
        text: "VoiceGPT(audio message prompt)",
        callback_data: "VoiceGPT",
      },
    ]);
  }
  for (let el of profiles) {
    // console.log(el);
    keyboard.push([{ text: el.name, callback_data: el.name }]);
  }
  const newLoc = parseInt(data) + 5;
  if (parseInt(data - 5) >= 0) {
    keyboard.push([
      { text: "Back", callback_data: "back-" + parseInt(data - 5) },
    ]);
  }
  try {
    await ctx.editMessageReplyMarkup(
      Markup.inlineKeyboard([
        ...keyboard,
        [
          // { text: "Back", callback_data: "next-" + toString(currentIndex - 5) },

          { text: "Next", callback_data: "next-" + parseInt(newLoc) },
        ],
        [{ text: "Back to menu", callback_data: "BackMenu" }],
      ]).reply_markup,
    );
  } catch (e) {}
});

bot.action("Balance", async (ctx) => {
  console.log("balance");
  try {
    const data = await prisma.userPurchasedToken.findFirst({
      where: {
        userid: ctx.from.id.toString(),
      },
    });
    console.log(data.token);

    await ctx.reply("Your Balance " + data.token);
  } catch (e) {
    console.log(e);
  }
});
bot.action(/next-\d+/, async (ctx) => {
  let data = ctx.match[0].split("-")[1];
  console.log("next", data);

  let sliceValue = data;
  if (data == 0) sliceValue += 5;
  let profiles = config.profiles.slice(sliceValue, sliceValue + 5);

  let keyboard = [];
  for (let el of profiles) {
    // console.log(el);
    keyboard.push([{ text: el.name, callback_data: el.name }]);
  }
  let newLoc = parseInt(data) + 5;

  // if (data == 5) newLoc += 5;
  // console.log(config.profiles.length, newLoc);

  if (newLoc < config.profiles.length)
    keyboard.push([
      { text: "Next", callback_data: "next-" + parseInt(newLoc) },
    ]);
  try {
    await ctx.editMessageReplyMarkup(
      Markup.inlineKeyboard([
        ...keyboard,
        [
          // { text: "Back", callback_data: "next-" + toString(currentIndex - 5) },
          { text: "Back", callback_data: "back-" + parseInt(data - 5) },
        ],
        [{ text: "Back to menu", callback_data: "BackMenu" }],
      ]).reply_markup,
    );
  } catch (e) {}
});
bot.action("BackMenu", async (ctx) => {
  await ctx.editMessageText(
    `
    Subscribe to our Synthi AI Official Channel

    https://t.me/synthi_ai`,
  );
  await ctx.editMessageReplyMarkup(
    Markup.inlineKeyboard([
      [{ text: "Select Chat Mode", callback_data: "SelectChat" }],
      [{ text: "Coming Soon", callback_data: "comming_soon" }],
      [{ text: "Dialog History", callback_data: "Dialog-0" }],
      [{ text: "Balance", callback_data: "Balance" }],
      [
        { text: "Settings", callback_data: "settings" },
        { text: "Help", callback_data: "Help" },
      ],
      [
        {
          text: "XEI Portal",
          callback_data: "portal",
        },
      ],
    ]).reply_markup,
  );
});

let profiles = config.profiles;
for (const el of profiles) {
  bot.action(el.name, async (ctx) => {
    try {
      await prisma.currentAssitant.update({
        where: {
          userid: ctx.from.id.toString(),
        },
        data: {
          chatMode: el.name,
        },
      });
    } catch (e) {
      await prisma.currentAssitant.create({
        data: {
          userid: ctx.from.id.toString(),
          chatMode: el.name,
        },
      });
    }

    // console.log(ctx.session);
    await ctx.reply(`Synthi AI: 👩🏼‍🎓 Hi, I'm ${el.name}. How can I help you?
    `);
  });
}

bot.on("text", async (ctx) => {
  // gibbrish detection

  // if (bot.context.chatBoost)
  if (bot.context[ctx.from.id.toString()]) {
    await prisma.userSettings.update({
      data: {
        username: ctx.message.text,
      },
      where: {
        userid: ctx.from.id.toString(),
      },
    });

    await ctx.reply("You name changed! Welcome, " + ctx.message.text);
    // console.log("here");
    bot.context[ctx.from.id.toString()] = false;
    return;
  }

  const dataPoint = await prisma.userPurchasedToken.findUnique({
    where: { userid: ctx.from.id.toString() },
  });

  if (!dataPoint) {
    // throw new Error("Data point not found");
    return await ctx.reply(
      "You don't have a token wallet, Please create one with /start.",
    );
  }

  if (dataPoint.token <= 0) {
    return await ctx.reply("You don't have sufficient tokens.");
  }
  // let chance = GibberishDetector.detect(ctx.message.text);
  // console.log(chance);
  // if (chance > 80) {
  //   await ctx.reply(
  //     "It looks like you misspelled something or your message does not have any specific message..\nfeel free to ask specific question. "
  //   );
  //   return;
  // }
  const currentInteractionData = await prisma.currentInteraction.findFirst({
    where: {
      userid: ctx.from.id.toString(),
    },
  });
  if (!currentInteractionData) {
    return await ctx.reply(
      "Please resend the message after creating a interaction with /new.",
    );
  }
  const data = await prisma.currentAssitant.findFirst({
    where: {
      userid: ctx.from.id.toString(),
    },
  });
  if (!data) {
    await ctx.reply("Plese select any CHATBOT /menu");
    return;
  }
  if (data.chatMode == "ImageGenerationMode") {
    await ctx.reply("Please wait.. Image is being generated.");
    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: ctx.message.text,
        size: "1024x1024",
        quality: "standard",
        n: 1,
      });

      // console.log(response);
      image_url = response.data[0].url;
      // console.log(image_url);

      await ctx.sendPhoto(image_url);
      return;
    } catch (e) {
      await ctx.reply(`Invalid prompt`);
      return;
    }
  }
  const interaction = await prisma.interaction.findFirst({
    where: {
      id: currentInteractionData.currentInteraction,
    },
  });
  console.log("interaction", interaction);
  if (interaction.name.toLowerCase() == "hello") {
    await prisma.interaction.update({
      data: {
        name: ctx.message.text,
      },
      where: {
        id: currentInteractionData.currentInteraction,
      },
    });
  }

  const settings = await prisma.userSettings.findFirst({
    where: {
      userid: ctx.from.id.toString(),
    },
  });
  // console.log("settings");
  if (!settings) {
    await ctx.reply("Looks like you have not ran /start. Please run it .");
    return;
  }
  // console.log(data);
  // might slow it down in long term. consider making 2 configs. one for name and other description
  const desc = config.profiles.find((el) => el.name == data.chatMode);

  const el = { name: data["chatMode"], desc: desc.desc };
  console.log(el);
  try {
    bot.context.chats[ctx.from.id.toString()].push(
      `You : ${ctx.message.text}\n`,
    );
  } catch (e) {
    console.log(e);
    bot.context.chats[ctx.from.id.toString()] = [];
    bot.context.chats[ctx.from.id.toString()].push(
      `You : ${ctx.message.text}\n`,
    );
  }
  const prompt = `I want you to act like you are in  ${
    el.name
  }. here is the description for your mode and reply as per your descripton without mentioned that your are an ai:
  description : ${el.desc},
  maximum word limit(do not exceed this limit ever) : 10-400 words,
  prompt : ${bot.context.chats[ctx.from.id.toString()].join()}`;
  console.log(prompt);

  let message = await ctx.reply("...");
  // console.log(settings.gpt);
  let response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    // stream: true,
  });

  const tokens_used = response.usage.total_tokens;
  // let response = "";

  // for await (const chunk of stream) {
  //   if (
  //     chunk.choices[0]?.delta?.content == null ||
  //     chunk.choices[0]?.delta?.content == ""
  //   ) {
  //     // continue;
  //     console.log(chunk.choices[0]?.delta?.content);

  //     // await bot.telegram.editMessageText(
  //     //   message.chat.id,
  //     //   message.message_id,
  //     //   undefined,
  //     //   response
  //     // );
  //     continue;
  //   }

  //   const newText = chunk.choices[0]?.delta?.content || "";
  //   response += newText;

  //   // if (
  //   //   response.length % 7 == 0 ||
  //   //   response.length % 2 == 0
  //   //   // response.length % 2 ==
  //   // ) {
  //   //   await bot.telegram.editMessageText(
  //   //     message.chat.id,
  //   //     message.message_id,
  //   //     undefined,
  //   //     response
  //   //   );
  //   // }
  // }

  // await bot.telegram.editMessageText(
  //   message.chat.id,
  //   message.message_id,
  //   undefined,
  //   response
  // );
  console.log(response);
  console.log(response.choices[0].message);

  response = response.choices[0].message.content;
  if (response.length < 40) {
    await bot.telegram.editMessageText(
      message.chat.id,
      message.message_id,
      undefined,
      response,
    );
  } else {
    const noOfedits = 7;
    let length = response.length;

    // Calculate the approximate length of each segment
    let segment_length = Math.floor(length / noOfedits);

    // Extract each segment of the string
    let segment1 = response.substring(0, segment_length);
    let segment2 = response.substring(segment_length, 2 * segment_length);
    let segment3 = response.substring(2 * segment_length);

    // doing the below craziness just to make sure the client is satified
    await bot.telegram.editMessageText(
      message.chat.id,
      message.message_id,
      undefined,
      segment1,
    );
    await bot.telegram.editMessageText(
      message.chat.id,
      message.message_id,
      undefined,
      segment1 + segment2,
    );
    await bot.telegram.editMessageText(
      message.chat.id,
      message.message_id,
      undefined,
      segment1 + segment2 + segment3,
    );
  }

  console.log(response);
  try {
    bot.context.chats[ctx.from.id.toString()].push(`AI : ${response}`);
    await prisma.chat.create({
      data: {
        userid: ctx.from.id.toString(),
        prompt: prompt,
        response: response,
        interactionId: currentInteractionData.currentInteraction,
      },
    });
  } catch (e) {
    console.log(e);
    console.log("failed to save chat");
  }
  console.log("here");
  try {
    const user = ctx.from.id.toString();

    // Calculate the new value
    const currentValue = dataPoint.token;
    const newValue = currentValue - tokens_used;

    console.log(newValue);
    // Update the database with the new value
    await prisma.userPurchasedToken.update({
      where: { userid: user },
      data: {
        token: parseInt(newValue) < 0 ? 0 : newValue,
      },
    });
  } catch (e) {
    console.log("error happened for ", data);
    console.log(e);
  }
});

async function main() {
  console.log("Starting the bot...");
  bot.launch();
}
try {
  main();
} catch (e) {
  console.log(e);
}
module.exports = { bot };
