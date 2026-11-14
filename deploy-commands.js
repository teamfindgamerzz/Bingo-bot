
require("dotenv").config();

const {
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show Bingo commands"),

  new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Show server information"),

  new SlashCommandBuilder()
    .setName("support")
    .setDescription("Bingo support server"),

  new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Get Bingo invite link"),

  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(o =>
      o.setName("user").setDescription("Member").setRequired(true))
    .addStringOption(o =>
      o.setName("reason").setDescription("Reason")),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(o =>
      o.setName("user").setDescription("Member").setRequired(true))
    .addStringOption(o =>
      o.setName("reason").setDescription("Reason")),

  new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o =>
      o.setName("user").setDescription("Member").setRequired(true))
    .addIntegerOption(o =>
      o.setName("minutes").setDescription("Duration in minutes")
        .setMinValue(1).setMaxValue(40320).setRequired(true)),

  new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o =>
      o.setName("user").setDescription("Member").setRequired(true))
    .addStringOption(o =>
      o.setName("reason").setDescription("Reason").setRequired(true)),

  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Delete messages")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(o =>
      o.setName("amount").setDescription("Amount")
        .setMinValue(1).setMaxValue(100).setRequired(true)),

  new SlashCommandBuilder()
    .setName("afk")
    .setDescription("Set AFK status")
    .addStringOption(o =>
      o.setName("reason").setDescription("AFK reason")),

  new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Create a poll")
    .addStringOption(o =>
      o.setName("question").setDescription("Question").setRequired(true)),

  new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Lock channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Unlock channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
].map(command => command.toJSON());

async function main() {
  const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

  if (!DISCORD_TOKEN || !CLIENT_ID) {
    throw new Error("Missing DISCORD_TOKEN or CLIENT_ID.");
  }

  const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

  const route = GUILD_ID
    ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
    : Routes.applicationCommands(CLIENT_ID);

  await rest.put(route, { body: commands });

  console.log(`Registered ${commands.length} Bingo commands!`);
}

main().catch(console.error);
