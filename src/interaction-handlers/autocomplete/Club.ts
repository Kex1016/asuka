import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import type { AutocompleteInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { PrismaClient } from "@prisma/client";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Autocomplete,
})
export class ClubAutocomplete extends InteractionHandler {
  public override async run(interaction: AutocompleteInteraction, result: InteractionHandler.ParseResult<this>) {
    return await interaction.respond(result);
  }

  public override async parse(interaction: AutocompleteInteraction) {
    const commands = await this.container.client.application?.commands.fetch();
    if (!commands) return this.none();

    // Only run this interaction for the command with name "club"
    const command = commands.find((command) => command.name === "club");
    if (!command) return this.none();

    if (interaction.commandId !== command.id) return this.none();

    const focusedOption = interaction.options.getFocused(true);
    const prisma = new PrismaClient();

    switch (focusedOption.name) {
      case "name": {
        const searchResult = await prisma.club.findMany({
          where: {
            name: {
              contains: focusedOption.value as string,
            },
          },
          select: {
            name: true,
            id: true,
          },
        });

        return this.some(searchResult.map((match) => ({ name: match.name, value: `${match.id}` })));
      }
      case "topics": {
        const topicsRaw = focusedOption.value as string;
        const topics = topicsRaw.split(",").map((topic) => topic.trim());

        if (topics.length > 4) return this.none();

        const currentTopic = topics[topics.length - 1];
        const searchResult = await prisma.club.findMany({
          where: {
            topics: {
              contains: currentTopic,
            },
          },
          select: {
            topics: true, // This is just a comma separated string. We need to filter it ourselves.
          },
        });

        // Clubs can have max 2 topics in common, so we need to filter to unique topics
        const uniqueTopics = [...new Set(searchResult.map((club) => club.topics.split(",")))].flat();
        return this.some(uniqueTopics.map((match) => ({ name: match, value: match })));
      }
      default:
        return this.none();
    }
  }
}
