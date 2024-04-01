const { prisma } = require("../handler/database");

async function history(ctx) {
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
      return;
    }
    const list = data.slice(index, index + 4);
    if (list.length == 0) {
      await ctx.reply("No More chats");
      return;
    }

    const escapeMap = {
      "!": "\\!",
      ".": "\\.",
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "`": "&#x60;",
      "\\": "\\\\", // Escape backslash itself
      // Add more special characters as needed
    };
    for (const chat of list) {
      let prompt = chat.prompt.split("prompt :")[1];
      await ctx.replyWithMarkdownV2(`
      🧑‍💻 You: ${prompt
        .replace(".", " ")
        .replace(/[&<>"'`!.\\]/g, (match) => escapeMap[match])}\n
\\-
[Telegram](t.me/SynthiAI_bot) \\| [X](https://twitter.com/xei_official) \\| [Website](https://www.xei.ai)
Built by SythiAi
      `);

      await ctx.replyWithMarkdownV2(`
      🧑‍💻 You: ${chat.response.replace(
        /[&<>"'`!.\\]/g,
        (match) => escapeMap[match]
      )}\n
\\-
[Telegram](t.me/SynthiAI_bot) \\| [X](https://twitter.com/xei_official) \\| [Website](https://www.xei.ai)
Built by SythiAi
      `);
    }
    index += 4;
    await ctx.reply("Options: ", {
      reply_markup: {
        inline_keyboard: [
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
}

module.exports = history;
