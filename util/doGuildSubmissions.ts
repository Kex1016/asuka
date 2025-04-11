import type { Client, TextChannel } from "discord.js";
import AsukaDatabase from "../database/database";
import AsukaEmbeds from "./embeds";
import AsukaI18n from "../i18n/i18n";

export async function doGuildSubmissions(client: Client) {
  const guilds = client.guilds.cache;

  for (const guild of guilds) {
    const [id, _] = guild;
    console.log(`Checking guild ${id}`);

    const settings = await AsukaDatabase.getSettings(id);
    if (!settings) {
      console.log("Invalid settings for guild", id);
      continue;
    }

    if (!settings.voting_enabled) {
      console.log("Voting disabled for guild", id);
      continue;
    }

    if (!settings.voting_channel) {
      console.log("No voting channel for guild", id);
      continue;
    }

    if (!settings.name_template) {
      console.log("No name template for guild", id);
      continue;
    }

    if (!settings.announce_channel) {
      console.log("No announce channel for guild", id);
      continue;
    }

    const announceChannel = client.channels.cache.get(
      settings.announce_channel,
    ) as TextChannel;
    if (!announceChannel) {
      console.log("Invalid announce channel for guild", id);
      continue;
    }

    const votingChannel = client.channels.cache.get(
      settings.voting_channel,
    ) as TextChannel;
    if (!votingChannel) {
      console.log("Invalid voting channel for guild", id);
      continue;
    }

    console.log("Guild", id, "is ready for voting.");

    const submissions = await AsukaDatabase.getThisWeeksSubmissions(id);
    if (!submissions) {
      console.log("No submissions for guild", id);
      continue;
    }

    if (submissions.length === 0) {
      console.log("No submissions for guild", id);
      continue;
    }

    // Get all the messages in the voting channel
    const messages = [];
    for (const submission of submissions) {
      if (!submission.message_id || !submission.accepted) {
        continue;
      }

      const message = await votingChannel.messages.fetch(submission.message_id);
      messages.push(message);
    }

    // Get the thumbs up and thumbs down reactions for each message
    const scores = new Map<string, number>();
    for (const message of messages) {
      const reactions = message.reactions.cache;
      const thumbsUp = reactions.get("👍");
      const thumbsDown = reactions.get("👎");

      if (!thumbsUp || !thumbsDown) {
        console.log("Missing reactions for message", message.id);
        continue;
      }

      const thumbsUpCount = thumbsUp.count - 1;
      const thumbsDownCount = thumbsDown.count - 1;
      const score = thumbsUpCount - thumbsDownCount;
      scores.set(message.id, score);
    }

    // Sort the messages by score
    const sortedMessages = messages.sort((a, b) => {
      const aScore = scores.get(a.id);
      const bScore = scores.get(b.id);
      if (!aScore || !bScore) {
        return 0;
      }
      return bScore - aScore;
    });

    // Get the #1 submission
    const winner = sortedMessages[0];
    if (!winner) {
      console.log("No winner for guild", id);

      // Announce that there is no winner
      const embed = AsukaEmbeds.submissionNoWinner();
      await announceChannel.send({ embeds: [embed] });

      continue;
    }

    // Get the name of the winner
    const winnerSubmission = submissions.find(
      (s) => s.message_id === winner.id,
    );
    if (!winnerSubmission || !winnerSubmission.user) {
      console.log("No winner submission for guild", id);
      const embed = AsukaEmbeds.submissionNoWinner();
      await announceChannel.send({ embeds: [embed] });
      continue;
    }

    // Set the server icon to the winning submission
    if (!winnerSubmission.icon) {
      console.log("Invalid icon for winner submission", winnerSubmission.id);
      continue;
    }
    guild[1].setIcon(winnerSubmission.icon);

    // Set the server name to the winning submission
    if (!winnerSubmission.name) {
      console.log("Invalid name for winner submission", winnerSubmission.id);
      continue;
    }
    await guild[1].setName(
      settings.name_template.replace("%C%", winnerSubmission.name),
    );

    // Announce the winner
    const score = scores.get(winner.id);
    if (!score) {
      console.log("Invalid score for winner", winner.id);
      continue;
    }
    const embed = AsukaEmbeds.submissionWinner(
      winnerSubmission,
      score,
      settings.name_template,
    );

    const announcementMessage = await announceChannel.send({
      embeds: [embed],
    });

    // Send a message to the user who submitted the winning submission
    const user = await client.users.fetch(winnerSubmission.user);
    if (!user) {
      console.log("Invalid user for winner submission", winnerSubmission.user);
    }

    const userDM = await user.createDM();
    if (!userDM) {
      console.log("Invalid DM channel for user", user.id);
    }

    await userDM.send(
      AsukaI18n.t("submit.user.winner", "en-US", {
        submission: winnerSubmission.name || "Unknown",
        channel: announcementMessage.url,
        image:
          winnerSubmission.icon ||
          "https://haiiro.moe/~asuka/icons/default.png",
      }),
    );

    // Update the database
    await AsukaDatabase.updateSubmission(winnerSubmission.id, {
      winner: true,
    });

    // Delete all the messages
    for (const message of messages) {
      await message.delete();
    }

    // Archive the submissions
    for (const submission of submissions) {
      await AsukaDatabase.updateSubmission(submission.id, { archived: true });
    }

    console.log("Winner announced for guild", id);
  }
}
