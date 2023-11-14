package Clubs

import (
	"asuka/Store"
	"github.com/bwmarrin/discordgo"
	"log"
)

var (
	ListClubs = func(s *discordgo.Session, i *discordgo.InteractionCreate) {
		clubs := Store.StoreInstance.GetAllClubs()
		reply := ""

		for _, v := range clubs {
			reply += v.Name + "\n"
		}

		err := s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: reply,
			},
		})
		if err != nil {
			log.Println("Error responding to interaction: ", err)
		}
	}
)
