const { Markup } = require("telegraf");
const config = require("../config");
async function selectChat(ctx) {
  const currentIndex = 0;
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
      [{ text: "Next", callback_data: "next-" + currentIndex }],
      [{ text: "Back to menu", callback_data: "BackMenu" }],
    ]).reply_markup,
    { message_id: messageId }
  );
}

module.exports = selectChat;
