package commands

import "github.com/bwmarrin/discordgo"

var (
	PingSettings = discordgo.ApplicationCommand{
		Name:        "ping",
		Description: "Ping the bot",
	}
	PingCommand = func(s *discordgo.Session, i *discordgo.InteractionCreate) {
		err := s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: "Pong!",
			},
		})
		if err != nil {
			return
		}
	}
)
