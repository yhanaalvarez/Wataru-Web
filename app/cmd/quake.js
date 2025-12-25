const axios = require("axios");

exports.meta = {
  name: "earthquake",
  aliases: ["quake", "lindol", "phivolcs"],
  prefix: "both",
  version: "1.0.0",
  author: "PHIVOLCS API",
  description: "Get latest PHIVOLCS earthquake info",
  guide: [""],
  category: "information"
};

exports.onStart = async function ({ wataru }) {
  try {
    const apiUrl = "https://hutchingd-earthquake-info-philvocs-api-cc.hf.space/info";
    const response = await axios.get(apiUrl, { timeout: 20000 });

    const data = response?.data?.details;
    if (!data) {
      return wataru.reply("⚠️ No earthquake data available.");
    }

    const message =
      `🌏 PHIVOLCS EARTHQUAKE UPDATE\n\n` +
      `📅 Date & Time: ${data.dateTime}\n` +
      `📍 Location: ${data.location}\n` +
      `📏 Magnitude: ${data.magnitude}\n` +
      `🌊 Depth: ${data.depth || "N/A"}\n` +
      `🌀 Origin: ${data.origin}\n` +
      `📈 Aftershocks Expected: ${data.expectingAftershocks}\n\n` +
      `🗺️ Map: ${data.mapImageUrl}\n` +
      `🔗 Source: ${data.sourceUrl}`;

    await wataru.reply(message);

  } catch (error) {
    console.error("PHIVOLCS API Error:", error.message);
    await wataru.reply("⚠️ Failed to fetch PHIVOLCS earthquake data.");
  }
};
