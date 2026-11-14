
require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField,
  Events
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const afkUsers = new Map();

client.once(Events.ClientReady, () => {
  console.log(`Bingo is online as ${client.user.tag}`);

  client.user.setPresence({
    activities: [{ name: "your server | /help" }],
    status: "online"
  });
});

client.on(Events.GuildMemberAdd, member => {
  const channel = member.guild.systemChannel;

  if (channel) {
    channel.send(`👋 Welcome ${member} to **${member.guild.name}**!`);
  }
});

client.on(Events.GuildMemberRemove, member => {
  const channel = member.guild.systemChannel;

  if (channel) {
    channel.send(`👋 **${member.user.tag}** left the server.`);
  }
});

client.on(Events.MessageCreate, message => {
  if (!message.guild || message.author.bot) return;

  if (afkUsers.has(message.author.id)) {
    afkUsers.delete(message.author.id);
    message.reply("Welcome back! Your AFK status has been removed.");
  }

  for (const user of message.mentions.users.values()) {
    if (afkUsers.has(user.id)) {
      message.reply(`💤 ${user.username} is AFK: ${afkUsers.get(user.id)}`);
    }
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, guild, options, channel } = interaction;

  try {
    switch (commandName) {

      case "help":
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#202225")
              .setTitle("Bingo Bot Commands")
              .setDescription(
                "**Moderation**\n" +
                "/ban /kick /timeout /warn /clear\n\n" +
                "**Management**\n" +
                "/announce /embed /lock /unlock\n" +
                "/role give /role remove\n\n" +
                "**Utility**\n" +
                "/serverinfo /roleinfo /afk /poll\n" +
                "/support /invite /rules /staff"
              )
          ]
        });

      case "serverinfo":
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#5865F2")
              .setTitle(guild.name)
              .addFields(
                { name: "Members", value: `${guild.memberCount}`, inline: true },
                { name: "Channels", value: `${guild.channels.cache.size}`, inline: true },
                { name: "Owner", value: `<@${guild.ownerId}>` }
              )
              .setTimestamp()
          ]
        });

      case "support":
        return interaction.reply({
          content: "Bingo Support: https://discord.gg/4MFGuz6t9k",
          ephemeral: true
        });

      case "invite":
        return interaction.reply({
          content: `https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot%20applications.commands&permissions=8`,
          ephemeral: true
        });

      case "ban": {
        const user = options.getUser("user");
        const reason = options.getString("reason") || "No reason provided";
        const target = await guild.members.fetch(user.id);

        if (!target.bannable)
          return interaction.reply({ content: "I cannot ban this member.", ephemeral: true });

        await target.ban({ reason });

        return interaction.reply(`🔨 ${user.tag} has been banned. Reason: ${reason}`);
      }

      case "kick": {
        const user = options.getUser("user");
        const reason = options.getString("reason") || "No reason provided";
        const target = await guild.members.fetch(user.id);

        if (!target.kickable)
          return interaction.reply({ content: "I cannot kick this member.", ephemeral: true });

        await target.kick(reason);

        return interaction.reply(`👢 ${user.tag} has been kicked.`);
      }

      case "timeout": {
        const user = options.getUser("user");
        const minutes = options.getInteger("minutes");
        const target = await guild.members.fetch(user.id);

        if (!target.moderatable)
          return interaction.reply({ content: "Cannot timeout this member.", ephemeral: true });

        await target.timeout(minutes * 60000);

        return interaction.reply(`${user.tag} timed out for ${minutes} minutes.`);
      }

      case "warn": {
        const user = options.getUser("user");
        const reason = options.getString("reason");

        return interaction.reply(`⚠️ ${user} has been warned. Reason: ${reason}`);
      }

      case "clear": {
        const amount = options.getInteger("amount");
        const deleted = await channel.bulkDelete(amount, true);

        return interaction.reply({
          content: `Deleted ${deleted.size} messages.`,
          ephemeral: true
        });
      }

      case "afk": {
        const reason = options.getString("reason") || "AFK";
        afkUsers.set(interaction.user.id, reason);

        return interaction.reply({
          content: `💤 AFK enabled: ${reason}`,
          ephemeral: true
        });
      }

      case "poll": {
        const question = options.getString("question");

        const poll = await channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor("#5865F2")
              .setTitle("📊 Poll")
              .setDescription(question)
          ]
        });

        await poll.react("👍");
        await poll.react("👎");

        return interaction.reply({
          content: "Poll created!",
          ephemeral: true
        });
      }

      case "lock":
        await channel.permissionOverwrites.edit(
          guild.roles.everyone,
          { SendMessages: false }
        );

        return interaction.reply("🔒 Channel locked.");

      case "unlock":
        await channel.permissionOverwrites.edit(
          guild.roles.everyone,
          { SendMessages: null }
        );

        return interaction.reply("🔓 Channel unlocked.");

      default:
        return interaction.reply({
          content: "Unknown command. Use /help.",
          ephemeral: true
        });
    }

  } catch (error) {
    console.error(error);

    const response = {
      content: "An error occurred while executing this command.",
      ephemeral: true
    };

    if (interaction.replied || interaction.deferred) {
      return interaction.followUp(response);
    }

    return interaction.reply(response);
  }
});

client.login(process.env.DISCORD_TOKEN);
