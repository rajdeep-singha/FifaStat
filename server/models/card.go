package models

import "time"

type Card struct {
	ID          string       `json:"id"`
	PlayerName  string       `json:"player_name"`
	Club        string       `json:"club"`
	Nation      string       `json:"nation"`
	Position    Position     `json:"position"`
	PhotoURL    string       `json:"photo_url"`
	BaseStats   Stats        `json:"base_stats"`
	Overall     int          `json:"overall"`
	Form        []FormRating `json:"form"`
	FormDelta   int          `json:"form_delta"`
	EffStats    Stats        `json:"eff_stats"`
	MemeTagline string       `json:"meme_tagline"`
	Rarity      string       `json:"rarity"`
	CreatedAt   time.Time    `json:"created_at"`
}
