package services

import (
	"strings"

	"cardclash/models"
)

// CounterMultiplier returns 1.2 if attacker's position counters defender's, else 1.0
// ATK > MID > DEF > ATK
func CounterMultiplier(attacker, defender models.Position) float64 {
	counters := map[models.Position]models.Position{
		models.ATK: models.MID,
		models.MID: models.DEF,
		models.DEF: models.ATK,
	}
	if counters[attacker] == defender {
		return 1.2
	}
	return 1.0
}

func GetStatValue(stats models.Stats, statKey string) int {
	switch strings.ToLower(statKey) {
	case "pac":
		return stats.PAC
	case "sho":
		return stats.SHO
	case "pas":
		return stats.PAS
	case "dri":
		return stats.DRI
	case "def":
		return stats.DEF
	case "phy":
		return stats.PHY
	}
	return 0
}

// ResolveRound: P1 is always the challenger (picks stat), P2 defends with same stat.
// Counter bonus applies based on P1's card position vs P2's card position.
func ResolveRound(
	p1Card, p2Card models.Card,
	p1Choice, p2Choice models.RoundChoice,
	roundNum int,
) models.RoundResult {
	// Use p1's chosen stat key for both (challenger picks the stat)
	statKey := p1Choice.StatKey

	p1StatVal := GetStatValue(p1Card.EffStats, statKey)
	p2StatVal := GetStatValue(p2Card.EffStats, statKey)

	p1Mult := CounterMultiplier(p1Card.Position, p2Card.Position)
	p1Eff := float64(p1StatVal) * p1Mult
	p2Eff := float64(p2StatVal) // defender gets no multiplier

	winner := 2
	if p1Eff > p2Eff {
		winner = 1
	} else if p1Eff == p2Eff {
		winner = 0 // draw - nobody gets the point
	}

	return models.RoundResult{
		Round:        roundNum,
		P1Choice:     p1Choice,
		P2Choice:     p2Choice,
		P1EffValue:   p1Eff,
		P2EffValue:   p2Eff,
		WinnerPlayer: winner,
		CounterBonus: p1Mult > 1.0,
	}
}
