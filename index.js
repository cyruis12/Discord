const express = require("express");
const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

const app = express();
app.get("/", (req, res) => res.send("Bot is alive!"));
app.listen(3000, () => console.log("🌐 Web server running"));

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const ownerId = "1421845902556921856"; // your Discord ID
const balances = {};

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "give") {
    if (interaction.user.id !== ownerId) {
      return interaction.reply({ content: "⛔ Only the bot owner can use this command.", ephemeral: true });
    }

    const user = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    if (!balances[user.id]) balances[user.id] = 0;
    balances[user.id] += amount;

    const embed = new EmbedBuilder()
      .setTitle("💸 Transaction Complete")
      .setDescription(`${interaction.user.username} gave ${amount} coins to ${user.username}`)
      .setColor("Gold");

    await interaction.reply({ embeds: [embed] });
  }
});

const commands = [
  new SlashCommandBuilder()
    .setName("give")
    .setDescription("Give coins to a user (owner only)")
    .addUserOption(opt => opt.setName("user").setDescription("User to give coins to").setRequired(true))
    .addIntegerOption(opt => opt.setName("amount").setDescription("Amount of coins").setRequired(true))
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log("✅ Slash commands registered globally!");
  } catch (err) {
    console.error(err);
  }
})();

client.login(process.env.TOKEN);
