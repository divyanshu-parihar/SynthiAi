const { prisma } = require("../handler/database");
const fs = require("node:fs");
const path = require("path");
const { jsPDF } = require("jspdf");

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
                        ${chats
                          .map(
                            (row) => `
                              -----------------------------------
                                ${row.prompt.split("prompt :")[1]}
                                ${row.response}</div>
                              -----------------------------------
                        `
                          )
                          .join("")}
        `;

    // if (!fs.existsSync(path.join(__dirname, ctx.from.id.toString()))) {
    //   fs.mkdirSync(path.join(__dirname, ctx.from.id.toString()));
    // }

    // // Write HTML to file
    // fs.writeFile(
    //   path.join(__dirname, ctx.from.id.toString(), "interaction log" + ".html"),
    //   html,
    //   "utf8",
    //   async (err) => {
    //     if (err) {
    //       console.error("Error writing HTML file:", err);

    //       return;
    //     }
    //   }
    // );
    // const doc = new jsPDF({
    //   format: "A4",
    // });
    // doc.text(html, 5, 10, {});
    // doc.save(
    //   path.join(__dirname, ctx.from.id.toString(), "interaction log" + ".pdf")
    // );
    let writeStream = fs.createWriteStream(
      path.join(__dirname, ctx.from.id.toString(), "interaction log" + ".xls")
    );
    let header = "Prompt" + "\t" + "Response" + "\n";
    // let row1 = " 21" + "\t" + "Rob" + "\n";
    // let row2 = " 22" + "\t" + "bob" + "\n";
    writeStream.write(header);

    chats.forEach((row) => {
      let values = row.prompt.split("prompt :")[1] + "\t" + row.response + "\n";
      writeStream.write(values);
    });
    // chats
    //   .map(
    //     (row) => `
    //       -----------------------------------
    //         ${row.prompt.split("prompt :")[1]}
    //         ${row.response}</div>
    //       -----------------------------------
    // `
    //   )

    writeStream.close(async () => {
      await ctx.replyWithDocument({
        caption: "interaction log",
        source: path.join(
          __dirname,
          ctx.from.id.toString(),
          "interaction log" + ".xls"
        ),
      });

      fs.unlink(
        path.join(
          __dirname,
          ctx.from.id.toString(),
          "interaction log" + ".xls"
        ),
        () => console.log("file deleted")
      );
    });

    // Save the PDF file
    // pdf.save(
    //   path.join(__dirname, ctx.from.id.toString(), "interaction log" + ".pdf")
    // );
  } catch (e) {
    console.log(e);
    await ctx.reply("could not generate dialogs");
    return;
  }
}

module.exports = exportDialogs;
