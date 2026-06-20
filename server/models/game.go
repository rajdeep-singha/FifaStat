package models

import "time"

type RoundChoice struct {
	CardID  string `json:"card_id"`
	StatKey string `json:"stat_key"`
}

type RoundResult struct {
	Round        int         `json:"round"`
	P1Choice     RoundChoice `json:"p1_choice"`
	P2Choice     RoundChoice `json:"p2_choice"`
	P1EffValue   float64     `json:"p1_eff_value"`
	P2EffValue   float64     `json:"p2_eff_value"`
	WinnerPlayer int         `json:"winner_player"` // 1 or 2
	CounterBonus bool        `json:"counter_bonus"`
}

type GameSession struct {
	RoomID       string        `json:"room_id"`
	P1ID         string        `json:"p1_id"`
	P2ID         string        `json:"p2_id"`
	P1Hand       []Card        `json:"p1_hand"`
	P2Hand       []Card        `json:"p2_hand"`
	P1Score      int           `json:"p1_score"`
	P2Score      int           `json:"p2_score"`
	CurrentRound int           `json:"current_round"`
	Rounds       []RoundResult `json:"rounds"`
	Status       string        `json:"status"`
	CreatedAt    time.Time     `json:"created_at"`
}
