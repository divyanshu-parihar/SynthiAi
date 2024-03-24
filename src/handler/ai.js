const OpenAI = require("openai");
const { bot } = require("../index");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function responseStream(prompt) {
  //   const stream = await openai.chat.completions.create({
  //     messages: [{ role: "user", content: prompt }],
  //     model: "gpt-3.5-turbo",
  //     stream: true,
  //   });
  //   for await (const chunk of stream) {
  //     // process.stdout.write(chunk.choices[0]?.delta?.content || "");
  //     console.log(chunk);
  //     // await bot.telegram.sendMessage(
  //     //   chatid,
  //     //   messageid,
  //     //   chunk.choices[0]?.delta?.content
  //     // );
  //   }
  // console.log(chatCompletion);
  const stream = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt + " in only 20 words" }],
    stream: true,
  });

  return stream;
  //   for await (const chunk of stream) {
  //     await bot.telegram.sendMessage(
  //       chatid,
  //       messageid,
  //       chunk.choices[0]?.delta?.content
  //     );
  //     process.stdout.write(chunk.choices[0]?.delta?.content || "");
  //   }
}
module.exports = { responseStream };
