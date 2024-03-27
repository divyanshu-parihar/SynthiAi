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
