const { prisma } = require("../handler/database");
UTF8 = {
  encode: function (s) {
    for (
      var c, i = -1, l = (s = s.split("")).length, o = String.fromCharCode;
      ++i < l;
      s[i] =
        (c = s[i].charCodeAt(0)) >= 127
          ? o(0xc0 | (c >>> 6)) + o(0x80 | (c & 0x3f))
          : s[i]
    );
    return s.join("");
  },
  decode: function (s) {
    for (
      var a,
        b,
        i = -1,
        l = (s = s.split("")).length,
        o = String.fromCharCode,
        c = "charCodeAt";
      ++i < l;
      (a = s[i][c](0)) & 0x80 &&
      ((s[i] =
        (a & 0xfc) == 0xc0 && ((b = s[i + 1][c](0)) & 0xc0) == 0x80
          ? o(((a & 0x03) << 6) + (b & 0x3f))
          : o(128)),
      (s[++i] = ""))
    );
    return s.join("");
  },
};

//metodo 2
function checkUTF8(text) {
  var utf8Text = text;
  try {
    // Try to convert to utf-8
    utf8Text = decodeURIComponent(escape(text));
    // If the conversion succeeds, text is not utf-8
  } catch (e) {
    // console.log(e.message); // URI malformed
    // This exception means text is utf-8
  }
  return utf8Text; // returned text is always utf-8
}
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
      🧑‍💻 You: ${prompt.replace(/[_*[\]()~`>#\+\-=|{}.!]/g, "\\$&")}\n
\\-
[Telegram](t.me/SynthiAI_bot) \\| [X](https://twitter.com/xei_official) \\| [Website](https://www.xei.ai)
Built by SythiAi
      `);

      await ctx.replyWithMarkdownV2(`
      🧑‍💻 AI: ${chat.response.replace(/[_*[\]()~`>#\+\-=|{}.!]/g, "\\$&")}\n
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
