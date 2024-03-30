const { fileFromPath } = require("openai");
const { prisma } = require("../handler/database");
const { Markup } = require("telegraf");
async function dialog(ctx) {
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
    let filtered = data.reverse().slice(historyIndex, historyIndex + 5);
    for (const el of filtered) {
      keyboard.push([
        {
          text: `😍 ${el.name}`,
          callback_data: "history-" + el.id + "-" + 0,
        },
      ]);
    }

    historyIndex += 5;

    await ctx.editMessageText(`Here's your 🗂️ Dialog History
  You can select any dialog and continue it!
  `);
    console.log(keyboard);

    if (filtered.length > historyIndex + 5)
      keyboard.push([
        { text: "Next", callback_data: "Dialog-" + historyIndex },
      ]);

    keyboard.push([{ text: "Back to menu", callback_data: "BackMenu" }]);

    await ctx.editMessageReplyMarkup(
      Markup.inlineKeyboard([
        // [{ text: "Assitant", callback_data: "Assitant" }],
        // [{ text: "Brief Assitant", callback_data: "BriefAssitant" }],
        // [{ text: "Code Developer", callback_data: "CodeDeveloper" }],
        // [{ text: "DALLE-3 Image Generation", callback_data: "Dalle" }],
        // [{ text: "Eva Elfie(18+) [PRO]", callback_data: "EvaElfie" }],
        ...keyboard,
        // [[{ text: "Dialog History", callback_data: "Dialog-" + historyIndex }]][

        // [{ text: "Delete all dialogs", callback_data: "DeleteAllDialogs" }],
        // // [{ text: "Next", callback_data: "Dialog-" + historyIndex }],

        // [
        //   // ],
        //   { text: "Back to menu", callback_data: "BackMenu" },
        // ],
      ]).reply_markup,
      { message_id: messageId }
    );
  } catch (e) {
    console.log(e);
    await ctx.reply("could not find dialogs");
    return;
  }
}

module.exports = dialog;
