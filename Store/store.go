package Store

import "github.com/bwmarrin/discordgo"

type Club struct {
	Channel     *discordgo.Channel
	Name        string
	Description string
	Topic       string
	Members     []discordgo.Member
}

type Store struct {
	GuildID string
	Clubs   []Club
}

func (s *Store) AddClub(club Club) {
	s.Clubs = append(s.Clubs, club)
}

func (s *Store) RemoveClub(club Club) {
	for i, v := range s.Clubs {
		if v.Name == club.Name {
			s.Clubs = append(s.Clubs[:i], s.Clubs[i+1:]...)
		}
	}
}

func (s *Store) GetClubByName(name string) *Club {
	for _, v := range s.Clubs {
		if v.Name == name {
			return &v
		}
	}
	return nil
}

func (s *Store) GetClubByChannel(channel *discordgo.Channel) *Club {
	for _, v := range s.Clubs {
		if v.Channel.ID == channel.ID {
			return &v
		}
	}
	return nil
}

func (s *Store) GetAllClubs() []Club {
	return s.Clubs
}

// Make a global instance
var StoreInstance = Store{}
