const { Telegraf, Markup, session } = require("telegraf");
const { PrismaClient } = require("@prisma/client");
const fs = require("node:fs");
const path = require("path");
const OpenAI = require("openai");
const dotenv = require("dotenv");
const { SQLite } = require("@telegraf/session/sqlite");
const config = require("./config");
const store = SQLite({
  filename: "./telegraf-sessions.sqlite",
});
// const { responseStream } = require("./handler/ai");
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
// bot.use(async (ctx, next) => {
//   ctx.session.count++; // increment once
//   return next(); // pass control to next middleware
// });

const bot = new Telegraf(process.env.BOT_TOKEN, {});

const prisma = new PrismaClient();
bot.use(session({ store }));

bot.start(async (ctx) => {
  // console.log(ctx.state);
  // // bot.context.se÷ssion = {};
  // console.log(ctx.session);
  // ctx.state[ctx.from.id] = {};
  // bot.telegram.editMessageText();
  // const interaction = await prisma.interaction.findFirst({
  //   where: {
  //     userid: userId,
  //   },
  // });

  // if (interaction) {
  //   await prisma.currentAssitant.update({
  //     data: {
  //       chatMode: "",
  //     },
  //     where: {
  //       userid: userId,
  //     },
  //   });
  // } else {
  //   await prisma.currentAssitant.create({
  //     data: {
  //       // id: prisma.ui,
  //       userid: userId,

  //       chatMode: "",
  //     },
  //   });
  // }
  const data = await prisma.interaction.create({
    data: {
      userid: ctx.from.id.toString(),
      chatid: ctx.chat.id.toString(),
      name: "hello",
    },
  });

  const currentInteraction = await prisma.currentInteraction.findFirst({
    where: {
      userid: ctx.from.id.toString(),
    },
  });

  if (currentInteraction) {
    await prisma.currentInteraction.update({
      data: {
        currentInteraction: data.id,
      },
      where: {
        userid: ctx.from.id.toString(),
      },
    });
  } else {
    await prisma.currentInteraction.create({
      data: {
        // id: prisma.ui,
        userid: ctx.from.id.toString(),

        currentInteraction: data.id,
      },
    });
  }
  const userId = ctx.from.id.toString();
  const row = await prisma.currentAssitant.findFirst({
    where: {
      userid: ctx.from.id.toString(),
    },
  });

  if (row) {
    await prisma.currentAssitant.update({
      data: {
        chatMode: "",
      },
      where: {
        userid: userId,
      },
    });
  } else {
    await prisma.currentAssitant.create({
      data: {
        // id: prisma.ui,
        userid: userId,

        chatMode: "",
      },
    });
  }
  ctx.reply(
    'Your dialog "🧠 Hello" is saved to 🗂️ Dialog History. You can continue it anytime with /menu command'
  );
  ctx.reply(`Hi! I'm MindAI bot 🤖

    Commands:
    ⚪ /menu – Menu
    ⚪ /balance – Account balance (🍉 Subscription)
    ⚪ /mode – Select chat mode
    ⚪ /new – Start new dialog
    ⚪ /settings – Show settings
    
    🧠 GPT-4 Turbo is available now in /settings!
    🎨 Create images with DALL-E 3/ in 👩‍🎨 Image Generation mode
    🎤 You can send Voice Messages instead of text
    
    Important notes:
    1. The longer your dialog, the more tokens are spent with each new message. To start new dialog, send /new command
    2. Write in 🇬🇧 English for a better quality of answers
    3. GPT-4 Turbo consumes 10x more tokens than ChatGPT. So use it when you really need it
    
    👩🏼‍💻 Support: @Oscar_Web3 - @itsB3nson
    📜 Check out our Whitepaper for more information: click here`);
});

bot.hears("/menu", async (ctx) => {
  try {
    await prisma.currentAssitant.create({
      data: {
        userid: ctx.from.id.toString(),
        chatMode: "",
      },
    });
  } catch (e) {
    console.log(e);
  }
  // console.log(ctx)
  ctx.reply(
    `🫂 Subscribe to our channel to get latest bot updates: @MindAIProject

    🏠 Menu:`,
    {
      reply_markup: {
        inline_keyboard: [
          /* Inline buttons. 2 side-by-side */
          [{ text: "Select Chat Mode", callback_data: "SelectChat" }],
          [{ text: "Dialog History", callback_data: "Dialog-0" }],
          [{ text: "Get Free Tokens", callback_data: "FreeTokens" }],
          [{ text: "Gift Tokens", callback_data: "GiftToken" }],
          [{ text: "Balance(Subscription)", callback_data: "Balance" }],
          [
            { text: "Settings", callback_data: "Settings" },
            { text: "Help", callback_data: "Help" },
          ],
          /* One button */
          // [ { text: "Next", callback_data: "next" } ],

          /* Also, we can have URL buttons. */
          [{ text: "Open in browser", url: "telegraf.js.org" }],
        ],
      },
    }
  );
});

bot.action("SelectChat", async (ctx) => {
  // console.log(bot.context);

  const currentIndex = 0;
  const historyIndex = 0;
  // console.log(ctx.state[ctx.from.id]);
  // console.log(ctx)
  // console.log(ctx.update.callback_query.message)
  // Get the current message ID and chat ID

  let profiles = config.profiles.slice(currentIndex, currentIndex + 5);

  let keyboard = [];
  for (let el of profiles) {
    console.log(el);
    keyboard.push([{ text: el.name, callback_data: el.name }]);
  }
  await ctx.editMessageText("Select chat mode (73 modes available");
  const messageId = ctx.update.callback_query.message.message_id;
  await ctx.editMessageReplyMarkup(
    Markup.inlineKeyboard([
      // [{ text: "Assitant", callback_data: "Assitant" }],
      // [{ text: "Brief Assitant", callback_data: "BriefAssitant" }],
      // [{ text: "Code Developer", callback_data: "CodeDeveloper" }],
      // [{ text: "DALLE-3 Image Generation", callback_data: "Dalle" }],
      // [{ text: "Eva Elfie(18+) [PRO]", callback_data: "EvaElfie" }],
      ...keyboard,

      [{ text: "Next", callback_data: "next-" + currentIndex }],
      [{ text: "Back to menu", callback_data: "BackMenu" }],
    ]).reply_markup,
    { message_id: messageId }
  );
  // Send a confirmation message
});

bot.action(/^history-\d+-\d+$/, async (ctx) => {
  let index = ctx.match[0].split("-")[2];
  let interactionid = ctx.match[0].split("-")[1];
  console.log(index, interactionid);
  try {
    let data = await prisma.chat.findMany({
      where: {
        interactionId: parseInt(interactionid),
      },
    });

    if (data.length == 0) {
      await ctx.reply("No Chats in this interaction");
    }
    const list = data.slice(index, index + 4);
    if (list.length == 0) {
      await ctx.reply("No More chats");
      return;
    }
    for (const chat of list) {
      let prompt = chat.prompt.split("prompt :")[1];
      await ctx.reply(`
      🧑‍💻 You: ${prompt}\n
-
[Telegram](https://t.me/) | [Twitter](https://twitter.com/) | [Website](https://google.com)
Built by SythiAi
      `);

      await ctx.reply(`
      🧑‍💻 You: ${chat.response}\n
-
[Telegram](https://t.me/) | [Twitter](https://twitter.com/) | [Website](https://google.com)
Built by SythiAi
      `);
    }
    index += 4;
    // await ctx.reply(
    //   Markup.inlineKeyboard([
    //     // [{ text: "Assitant", callback_data: "Assitant" }],
    //     // [{ text: "Brief Assitant", callback_data: "BriefAssitant" }],
    //     // [{ text: "Code Developer", callback_data: "CodeDeveloper" }],
    //     // [{ text: "DALLE-3 Image Generation", callback_data: "Dalle" }],
    //     // [{ text: "Eva Elfie(18+) [PRO]", callback_data: "EvaElfie" }],
    //     ...keyboard,
    //     // [[{ text: "Dialog History", callback_data: "Dialog-" + historyIndex }]][
    //     [
    //       {
    //         text: "Next",
    //         callback_data: `${history}-${interactionid}-${index}`,
    //       },
    //     ],
    //     [{ text: "Back to menu", callback_data: "BackMenu" }],
    //   ]).reply_markup,
    //   { message_id: messageId }
    // );
    await ctx.reply("Options: ", {
      reply_markup: {
        inline_keyboard: [
          /* Inline buttons. 2 side-by-side */
          // [{ text: "Select Chat Mode", callback_data: "SelectChat" }],
          // [{ text: "Dialog History", callback_data: "Dialog-0" }],
          // [{ text: "Get Free Tokens", callback_data: "FreeTokens" }],
          // [{ text: "Gift Tokens", callback_data: "GiftToken" }],
          // [{ text: "Balance(Subscription)", callback_data: "Balance" }],
          // [
          //   { text: "Settings", callback_data: "Settings" },
          //   { text: "Help", callback_data: "Help" },
          // ],
          /* One button */
          // [ { text: "Next", callback_data: "next" } ],

          /* Also, we can have URL buttons. */
          [
            {
              text: "Show More",
              callback_data: `history-${interactionid}-${index}`,
            },
          ],
          [
            {
              text: "Export dialogs",
              callback_data: "ExportDialogs-" + interactionid,
            },
          ],
        ],
      },
    });
  } catch (e) {
    console.log(e);
    await ctx.reply("error occured");
    return;
  }
});

bot.action(/Dialog-\d+/, async (ctx) => {
  console.log("Hello");
  let historyIndex = ctx.match[0].split("-")[1];
  // let historyIndex = 0;
  const messageId = ctx.update.callback_query.message.message_id;

  let keyboard = [];
  try {
    const data = await prisma.interaction.findMany({
      where: {
        userid: ctx.from.id.toString(),
      },
    });

    console.log(data);

    for (const el of data.reverse().slice(historyIndex, historyIndex + 5)) {
      keyboard.push([
        {
          text: `😍 ${el.name}`,
          callback_data: "history-" + el.id + "-" + 0,
        },
      ]);
    }
  } catch (e) {
    console.log(e);
    await ctx.reply("could not find dialogs");
    return;
  }

  historyIndex += 5;
  await ctx.editMessageText(`Here's your 🗂️ Dialog History
  You can select any dialog and continue it!
  `);
  console.log(keyboard);
  await ctx.editMessageReplyMarkup(
    Markup.inlineKeyboard([
      // [{ text: "Assitant", callback_data: "Assitant" }],
      // [{ text: "Brief Assitant", callback_data: "BriefAssitant" }],
      // [{ text: "Code Developer", callback_data: "CodeDeveloper" }],
      // [{ text: "DALLE-3 Image Generation", callback_data: "Dalle" }],
      // [{ text: "Eva Elfie(18+) [PRO]", callback_data: "EvaElfie" }],
      ...keyboard,
      // [[{ text: "Dialog History", callback_data: "Dialog-" + historyIndex }]][

      [{ text: "Delete all dialogs", callback_data: "DeleteAllDialogs" }],
      [{ text: "Next", callback_data: "Dialog-" + historyIndex }],

      [
        // ],
        { text: "Back to menu", callback_data: "BackMenu" },
      ],
    ]).reply_markup,
    { message_id: messageId }
  );
});
// bot.action(/history-\d+/, async (ctx) => {
//   let data = ctx.match[0].split("-")[1];

//   const chats = await prisma.chat.findMany({
//     where: {},
//   });
// });
bot.action(/ExportDialogs-\d+/, async (ctx) => {
  console.log("file exporting");
  let interactionid = ctx.match[0].split("-")[1];
  try {
    const data = await prisma.interaction.findFirst({
      where: {
        id: parseInt(interactionid),
      },
    });

    const chats = await prisma.chat.findMany({
      where: {
        interactionId: data.id,
      },
    });
    const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Database Information</title>
            </head>
            <body style="text-align:center">
                <h1>Interaction Log:</h1>
                        ${chats
                          .map(
                            (row) => `
                            <div style="border: 2px solid black; margin: 2px;">
                                <div style="margin: 2px;background-color: yellow;">${
                                  row.prompt.split("prompt :")[1]
                                }</div>
                                <div style="padding:2px;">${row.response}</div>
                               
                            </div>
                        `
                          )
                          .join("")}
                    
            </body>
            </html>
        `;

    // Write HTML to file
    fs.writeFile(
      path.join(__dirname, "temp", ctx.from.id.toString() + ".html"),
      html,
      "utf8",
      async (err) => {
        if (err) {
          console.error("Error writing HTML file:", err);

          return;
        }
        // await ctx.replyWithDocument(
        //   path.join(__dirname, ctx.from.id.toString() + ".html")
        // );
        // console.log("HTML file generated successfully.");
      }
    );
    await ctx.replyWithDocument({
      source: path.join(__dirname, ctx.from.id.toString() + ".html"),
    });
  } catch (e) {
    console.log(e);
    await ctx.reply("could not find dialogs");
    return;
  }
});
bot.action("DeleteAllDialogs", async (ctx) => {
  await ctx.editMessageText(
    `You sure want to delete the Dialogs(Irreversible)? `
  );
  await ctx.editMessageReplyMarkup(
    Markup.inlineKeyboard([
      [{ text: "Yes", callback_data: "ConfirmDeleteAllDialogs" }],
      [{ text: "Back to menu", callback_data: "BackMenu" }],
    ]).reply_markup
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
bot.action(/next-\d+/, async (ctx) => {
  let data = ctx.match[0].split("-")[1];
  // const data = ctx.match[1].split("-")[1];

  let profiles = config.profiles.slice(data, data + 5);

  let keyboard = [];
  for (let el of profiles) {
    console.log(el);
    keyboard.push([{ text: el.name, callback_data: el.name }]);
  }
  data += 5;

  try {
    await ctx.editMessageReplyMarkup(
      Markup.inlineKeyboard([
        ...keyboard,
        [{ text: "Next", callback_data: "next-" + parseInt(data) }],
        [{ text: "Back to menu", callback_data: "BackMenu" }],
      ]).reply_markup
    );
  } catch (e) {}
});
bot.action("BackMenu", async (ctx) => {
  await ctx.editMessageText(
    `🫂 Subscribe to our channel to get latest bot updates: @MindAIProject

        🏠 Menu:`
  );
  await ctx.editMessageReplyMarkup(
    Markup.inlineKeyboard([
      [{ text: "Select Chat Mode", callback_data: "SelectChat" }],
      [{ text: "Dialog History", callback_data: "Dialog-0" }],
      [{ text: "Get Free Tokens", callback_data: "FreeTokens" }],
      [{ text: "Gift Tokens", callback_data: "GiftToken" }],
      [{ text: "Balance(Subscription)", callback_data: "Balance" }],
      [
        { text: "Settings", callback_data: "Settings" },
        { text: "Help", callback_data: "Help" },
      ],
      [{ text: "Open in browser", url: "telegraf.js.org" }],
    ]).reply_markup
  );
});

let profiles = config.profiles;
for (const el of profiles) {
  bot.action(el.name, async (ctx) => {
    await prisma.currentAssitant.update({
      where: {
        userid: ctx.from.id.toString(),
      },
      data: {
        chatMode: el.name,
      },
    });
    // console.log(ctx.session);
    await ctx.reply(`Synthi AI: 👩🏼‍🎓 Hi, I'm ${el.name}. How can I help you?
    `);
  });
}
// let keyboard = [];
// for (let el of profiles) {
//   console.log(el);
//   keyboard.push([{ text: el.name, callback_data: el.name }]);
// }

// bot.action("Assitant", async (ctx) => {
//   // console.log(bot.context.session);
//   await prisma.currentAssitant.update({
//     where: {
//       userid: ctx.from.id.toString(),
//     },
//     data: {
//       chatMode: "Assitant",
//     },
//   });
//   // console.log(ctx.session);
//   await ctx.reply(`Synthi AI: 👩🏼‍🎓 Hi, I'm Assistant. How can I help you?
//   `);
// });
// bot.action("BriefAssitant", async (ctx) => {
//   await ctx.reply(bot.context[ctx.message.from.id].assistant_type);
// });

bot.on("text", async (ctx) => {
  const currentInteractionData = await prisma.currentInteraction.findFirst({
    where: {
      userid: ctx.from.id.toString(),
    },
  });
  if (!currentInteractionData) {
    return await ctx.reply("Please start a new Interaction with /start");
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

  const data = await prisma.currentAssitant.findFirst({
    where: {
      userid: ctx.from.id.toString(),
    },
  });
  // might slow it down in long term. consider making 2 configs. one for name and other description
  const desc = config.profiles.find((el) => el.name == data.chatMode);

  if (data.chatMode == "") {
    await ctx.reply("Please select a chatMode");
    return;
  }
  // console.log("userdata", data);
  const el = { name: data["chatMode"], desc: desc.desc };
  const prompt = `I want you to act like you are in  ${el.name}. here is the description for your mode and reply as per your descripton:
  description : ${el.desc},
  word limit : 40 words,
  prompt : ${ctx.message.text}`;
  console.log(prompt);
  let message = await ctx.reply("...");
  const stream = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    stream: true,
  });
  let response = "";

  // stream.on("data", (data) => console.log("data", data));
  for await (const chunk of stream) {
    if (
      chunk.choices[0]?.delta?.content == null ||
      chunk.choices[0]?.delta?.content == ""
    )
      continue;
    // await ctx.reply("..listening");
    const newText = chunk.choices[0]?.delta?.content || "";
    response += newText;
    // console.log(newText);
    // stream.pause();

    Promise.all([new Promise((resolve) => setTimeout(() => resolve, 2000))]);
    if (message.text != response) {
      try {
        await bot.telegram.editMessageText(
          message.chat.id,
          message.message_id,
          undefined,
          response
        );
      } catch (e) {}
      // setTimeout(() => console.log("waited"), 2000);
    }
    // if (ctx.session.lastMessageId) {
    //   try {
    //     // Delete the previous reply
    //     await ctx.telegram.(
    //       ctx.chat.id,
    //       ctx.session.lastMessageId,
    //       ctx.session.lastMessageId
    //       // response
    //     );
    //   } catch (error) {
    //     console.error("Error deleting previous message:", error);
    //   }
    // }
    // let msg = await ctx.reply(response);
    // ctx.session.lastMessageId = msg.message_id;

    // bot.telegram.editMessageText();
    // const { chatId, messageId } = ctx.update.callback_query.message.chat;
    // const { chatId, messageId } = msg.chat;

    // console.log("chatid", chatId, "messageid", messageId);
    // // Call the `editMessageText` method on `bot.telegram` to edit the message
    // response += newText;
    // // bot.telegram.deleteMessage(chatId, messageId);
    // await ctx
    //   .sendMessage(response, messageId, undefined, newText)
    //   .then(() => {
    //     console.log("Message edited successfully");
    //   })
    //   .catch((error) => {
    //     console.error("Error editing message:", error);
    //   });

    // await ctx.sendMessage(chunk.choices[0]?.delta?.content);
    // for await (const chunk of stream) {
    //   process.stdout.write(chunk.choices[0]?.delta?.content || "");
    // }
  }
  try {
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

  // await ctx.editMessageCaption(response);
});
async function main() {
  // const stream = await openai.chat.completions.create({
  //   messages: [
  //     { role: "user", content: "Say this is a test and write a small poem" },
  //   ],
  //   model: "gpt-3.5-turbo",
  //   stream: true,
  // });
  // for await (const chunk of stream) {
  //   process.stdout.write(chunk.choices[0]?.delta?.content || "");
  // }
  // console.log(chatCompletion);

  bot.launch();
}

main();
module.exports = { bot };
