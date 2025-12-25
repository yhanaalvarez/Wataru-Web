const axios = require("axios");

exports.meta = {
  name: "ai",
  aliases: ["ai", "chatgpt", "openai"],
  prefix: "both",
  version: "1.0.2",
  author: "Kaiz API",
  description: "Ask GPT-4",
  guide: ["<query>"],
  category: "ai"
};

exports.onStart = async function ({ wataru, msg, chatId, args }) {
  try {
    const question = args.join(" ").trim();
    if (!question) {
      return wataru.reply("❓ Please provide a question for GPT-4.");
    }

    const apiUrl = `https://urangkapolka.vercel.app/api/chatgpt4?prompt=${encodeURIComponent(question)}`;
    const response = await axios.get(apiUrl, { timeout: 20000 });

    const aiResponse =
      response?.data?.response ||
      response?.data?.result ||
      response?.data?.answer ||
      response?.data ||
      "⚠️ No response was returned from GPT-4.";

    await wataru.reply(aiResponse);

  } catch (error) {
    console.error(
      "GPT-4 API Error:",
      error?.response?.data || error.message
    );

    await wataru.reply(
      "⚠️ An error occurred while contacting the GPT-4 API. Please try again later."
    );
  }
};
