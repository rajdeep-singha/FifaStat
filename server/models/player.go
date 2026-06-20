package models

type Position string

const (
	ATK Position = "ATK"
	MID Position = "MID"
	DEF Position = "DEF"
)

type Stats struct {
	PAC int `json:"pac"`
	SHO int `json:"sho"`
	PAS int `json:"pas"`
	DRI int `json:"dri"`
	DEF int `json:"def"`
	PHY int `json:"phy"`
}

type FormRating struct {
	MatchDate string  `json:"match_date"`
	Opponent  string  `json:"opponent"`
	Rating    float64 `json:"rating"`
}
