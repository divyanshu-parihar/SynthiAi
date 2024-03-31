const { prisma } = require("../handler/database");
const fs = require("node:fs");
const path = require("path");
async function exportDialogs(ctx) {
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
    console.log(data, chats);
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

    if (!fs.existsSync(path.join(__dirname, ctx.from.id.toString()))) {
      fs.mkdirSync(path.join(__dirname, ctx.from.id.toString()));
    }

    // Write HTML to file
    fs.writeFile(
      path.join(__dirname, ctx.from.id.toString(), "interaction log" + ".html"),
      html,
      "utf8",
      async (err) => {
        if (err) {
          console.error("Error writing HTML file:", err);

          return;
        }
      }
    );
    await ctx.replyWithDocument({
      caption: "interaction log",
      source: path.join(
        __dirname,
        ctx.from.id.toString(),
        "interaction log" + ".html"
      ),
    });

    fs.unlink(
      path.join(__dirname, ctx.from.id.toString(), "interaction log" + ".html"),
      () => console.log("file deleted")
    );
  } catch (e) {
    console.log(e);
    await ctx.reply("could not generate dialogs");
    return;
  }
}

module.exports = exportDialogs;
