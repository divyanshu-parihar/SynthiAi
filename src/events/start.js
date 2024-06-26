const { prisma } = require("../handler/database");

async function start(ctx, bot) {
  bot.context.chats[ctx.from.id.toString()] = [];
  const userId = ctx.from.id.toString();
  // const interaction = await prisma.currentAssitant.findFirst({
  //   where: {
  //     userid: userId,
  //   },
  // });

  // if (interaction) {
  //   await prisma.currentAssitant.update({
  //     data: {
  //       chatMode: "Assistant",
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
  //       chatMode: "Assistant",
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
      userid: userId,
    },
  });

  if (currentInteraction) {
    await prisma.currentInteraction.update({
      data: {
        currentInteraction: data.id,
      },
      where: {
        userid: userId,
      },
    });
  } else {
    await prisma.currentInteraction.create({
      data: {
        // id: prisma.ui,
        userid: userId,

        currentInteraction: data.id,
      },
    });
  }

  const row = await prisma.currentAssitant.findFirst({
    where: {
      userid: userId,
    },
  });

  if (row) {
    await prisma.currentAssitant.update({
      data: {
        chatMode: " 👨‍💼 Assistant",
      },
      where: {
        userid: userId,
      },
    });
  } else {
    await prisma.currentAssitant.create({
      data: {
        userid: userId,
        chatMode: " 👨‍💼 Assistant",
      },
    });
  }
  try {
    await prisma.userSettings.create({
      data: {
        userid: ctx.from.id.toString(),
        language: "ENGLISH",
        username: ctx.from.username,
        gpt: "gpt-4-turbo-preview",
        response: "short",
      },
    });
  } catch (e) {
    console.log("user already has settings");
  }

  // console.log(await prisma.userPurchasedToken.findMany());
  await ctx.reply(
    'Your dialog "🧠 Hello" is saved to 🗂️ Dialog History. You can continue it anytime with /menu command'
  );
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
}
module.exports = start;
