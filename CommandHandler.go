package main

import (
	"asuka/commands"
	"github.com/bwmarrin/discordgo"
)

// Command Handler
var (
	cmds = []discordgo.ApplicationCommand{
		commands.PingSettings,
	}

	cmdHandlers = map[string]func(s *discordgo.Session, i *discordgo.InteractionCreate){
		"ping": commands.PingCommand,
	}
)
