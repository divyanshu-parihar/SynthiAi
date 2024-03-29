async function menu(ctx) {
  await ctx.reply(
    `🫂 Subscribe to our channel to get latest bot updates: @MindAIProject
    
        🏠 Menu:`,
    {
      reply_markup: {
        inline_keyboard: [
          /* Inline buttons. 2 side-by-side */
          [{ text: "Select Chat Mode", callback_data: "SelectChat" }],
          [{ text: "Dialog History", callback_data: "Dialog-0" }],
          // [{ text: "Get Free Tokens", callback_data: "FreeTokens" }],
          // [{ text: "Gift Tokens", callback_data: "GiftToken" }],
          // [{ text: "Balance(Subscription)", callback_data: "Balance" }],
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
        ],
      },
    }
  );
}

module.exports = menu;
