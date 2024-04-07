const { fileFromPath } = require("openai");
const { prisma } = require("../handler/database");
const { Markup } = require("telegraf");

async function dialog(ctx) {
  let historyIndex = parseInt(ctx.match[0].split("-")[1]);
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

    await ctx.editMessageText(
      `Here's your 🗂️ Dialog History\nYou can select any dialog and continue it!`
    );
    console.log(keyboard);
    console.log("index", historyIndex);
    if (data.length >= parseInt(historyIndex)) {
      keyboard.push([
        { text: "Next", callback_data: "Dialog-" + parseInt(historyIndex) },
      ]);
    }
    console.log("history index", historyIndex);
    if (historyIndex - 10 >= 0) {
      keyboard.push([
        {
          text: "Back",
          callback_data: "Dialog-" + parseInt(historyIndex - 10),
        },
      ]);
    }
    keyboard.push([{ text: "Back to menu", callback_data: "BackMenu" }]);

    await ctx.editMessageReplyMarkup(
      Markup.inlineKeyboard([...keyboard]).reply_markup,
      { message_id: messageId }
    );
  } catch (e) {
    console.log(e);
    await ctx.reply("could not find dialogs");
    return;
  }
}

module.exports = dialog;
