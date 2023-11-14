package commands

import (
	"asuka/Store"
	"asuka/commands/Clubs"
	"github.com/bwmarrin/discordgo"
)

var (
	ListClubsChoices []discordgo.ApplicationCommandOptionChoice
	ClubsSettings    = discordgo.ApplicationCommand{
		Name:        "clubs",
		Description: "The commands related to clubs",
		Options: []*discordgo.ApplicationCommandOption{
			{
				Type:        discordgo.ApplicationCommandOptionSubCommandGroup,
				Name:        "list",
				Description: "List all clubs",
			},
			{
				Type:        discordgo.ApplicationCommandOptionSubCommand,
				Name:        "create",
				Description: "Create a club",
				Options: []*discordgo.ApplicationCommandOption{
					{
						Type:        discordgo.ApplicationCommandOptionString,
						Name:        "name",
						Description: "The name of the club",
						Required:    true,
					},
					{
						Type:        discordgo.ApplicationCommandOptionString,
						Name:        "description",
						Description: "The description of the club",
						Required:    true,
					},
					{
						Type:        discordgo.ApplicationCommandOptionString,
						Name:        "topic",
						Description: "The topic of the club",
						Required:    true,
					},
				},
			},
			{
				Type:        discordgo.ApplicationCommandOptionSubCommand,
				Name:        "join",
				Description: "Join a club",
				Options: []*discordgo.ApplicationCommandOption{
					{
						Type:        discordgo.ApplicationCommandOptionString,
						Name:        "name",
						Description: "The name of the club",
						Required:    true,
						// Add choices with code
					},
				},
			},
			{
				Type:        discordgo.ApplicationCommandOptionSubCommand,
				Name:        "leave",
				Description: "Leave a club",
				Options: []*discordgo.ApplicationCommandOption{
					{
						Type:        discordgo.ApplicationCommandOptionString,
						Name:        "name",
						Description: "The name of the club",
						Required:    true,
						Choices:     ListClubsChoices, // FIXME
					},
				},
			},
		},
	}

	ClubsCommand = func(s *discordgo.Session, i *discordgo.InteractionCreate) {
		switch i.ApplicationCommandData().Options[0].Name {
		case "list":
			Clubs.ListClubs(s, i)
			//case "create":
		}
	}
)

func init() {
	ListClubsChoices = make([]discordgo.ApplicationCommandOptionChoice, len(Store.StoreInstance.GetAllClubs()))
	for i, v := range Store.StoreInstance.GetAllClubs() {
		ListClubsChoices[i] = discordgo.ApplicationCommandOptionChoice{
			Name:  v.Name,
			Value: v.Name,
		}
	}
}
