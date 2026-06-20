package services

import (
	"context"
	"fmt"
	"math"
	"strings"
	"time"

	"cardclash/config"
	"cardclash/models"

	"github.com/google/uuid"
)

type CardBuilder struct {
	anakin *AnakinService
	cache  *CacheService
	cfg    *config.Config
}

func NewCardBuilder(anakin *AnakinService, cache *CacheService, cfg *config.Config) *CardBuilder {
	return &CardBuilder{anakin: anakin, cache: cache, cfg: cfg}
}

func (b *CardBuilder) BuildCard(ctx context.Context, playerName string) (*models.Card, error) {
	if card, ok := b.cache.Get(playerName); ok {
		return card, nil
	}

	// Step 1: fetch FIFA stats
	statsRaw, err := b.anakin.GenerateJSON(ctx, b.cfg.AnakinStatsAppID, map[string]string{
		"url": fmt.Sprintf("https://sofifa.com/players?keyword=%s", strings.ReplaceAll(playerName, " ", "+")),
	})
	if err != nil {
		return nil, fmt.Errorf("stats fetch failed: %w", err)
	}

	card := &models.Card{
		ID:         uuid.New().String(),
		PlayerName: playerName,
		CreatedAt:  time.Now(),
	}

	card.Club = stringVal(statsRaw, "club")
	card.Nation = stringVal(statsRaw, "nation")
	card.Position = models.Position(stringVal(statsRaw, "position"))
	card.Overall = intVal(statsRaw, "overall")
	card.BaseStats = models.Stats{
		PAC: intVal(statsRaw, "pac"),
		SHO: intVal(statsRaw, "sho"),
		PAS: intVal(statsRaw, "pas"),
		DRI: intVal(statsRaw, "dri"),
		DEF: intVal(statsRaw, "def"),
		PHY: intVal(statsRaw, "phy"),
	}

	// Step 2: fetch match photo
	photoResults, err := b.anakin.SearchWeb(ctx, b.cfg.AnakinSearchAppID,
		fmt.Sprintf("%s %s latest match action photo", playerName, card.Club))
	if err == nil && len(photoResults) > 0 {
		for _, r := range photoResults {
			if strings.Contains(r.URL, ".jpg") || strings.Contains(r.URL, ".jpeg") || strings.Contains(r.URL, ".png") {
				card.PhotoURL = r.URL
				break
			}
		}
		if card.PhotoURL == "" && len(photoResults) > 0 {
			card.PhotoURL = photoResults[0].URL
		}
	}

	// Step 3: fetch form (last 5 match ratings)
	formRaw, err := b.anakin.GenerateJSON(ctx, b.cfg.AnakinFormAppID, map[string]string{
		"url": fmt.Sprintf("https://www.sofascore.com/search#query=%s", strings.ReplaceAll(playerName, " ", "+")),
	})
	if err == nil {
		if ratings, ok := formRaw["ratings"].([]interface{}); ok {
			for _, r := range ratings {
				if rm, ok := r.(map[string]interface{}); ok {
					card.Form = append(card.Form, models.FormRating{
						MatchDate: stringVal(rm, "date"),
						Opponent:  stringVal(rm, "opponent"),
						Rating:    floatVal(rm, "rating"),
					})
				}
				if len(card.Form) >= 5 {
					break
				}
			}
		}
	}

	// Step 4: fetch meme tagline
	memeResults, err := b.anakin.SearchWeb(ctx, b.cfg.AnakinSearchAppID,
		fmt.Sprintf("%s football twitter viral meme", playerName))
	if err == nil && len(memeResults) > 0 {
		card.MemeTagline = truncate(memeResults[0].Snippet, 80)
	}

	// Compute form delta and effective stats
	card.FormDelta = computeFormDelta(card.Form)
	card.EffStats = computeEffStats(card.BaseStats, card.FormDelta)
	card.Overall = clamp(card.Overall+card.FormDelta, 1, 99)
	card.Rarity = computeRarity(card.Overall)

	b.cache.Set(playerName, card)
	b.cache.Set(card.ID, card)
	return card, nil
}

func computeFormDelta(form []models.FormRating) int {
	if len(form) == 0 {
		return 0
	}
	var sum float64
	for _, f := range form {
		sum += f.Rating
	}
	avg := sum / float64(len(form))
	if avg >= 7.5 {
		return 5
	}
	if avg <= 5.5 {
		return -5
	}
	// linear interpolation between 5.5 and 7.5
	return int(math.Round((avg-5.5)/(7.5-5.5)*10 - 5))
}

func computeEffStats(base models.Stats, delta int) models.Stats {
	boost := func(v int) int {
		return clamp(v+int(math.Round(float64(v)*float64(delta)/99.0)), 1, 99)
	}
	return models.Stats{
		PAC: boost(base.PAC),
		SHO: boost(base.SHO),
		PAS: boost(base.PAS),
		DRI: boost(base.DRI),
		DEF: boost(base.DEF),
		PHY: boost(base.PHY),
	}
}

func computeRarity(overall int) string {
	if overall >= 85 {
		return "gold"
	}
	if overall >= 75 {
		return "silver"
	}
	return "bronze"
}

func clamp(v, min, max int) int {
	if v < min {
		return min
	}
	if v > max {
		return max
	}
	return v
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n-3] + "..."
}

func stringVal(m map[string]interface{}, key string) string {
	if v, ok := m[key]; ok {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return ""
}

func intVal(m map[string]interface{}, key string) int {
	if v, ok := m[key]; ok {
		switch n := v.(type) {
		case float64:
			return int(n)
		case int:
			return n
		}
	}
	return 0
}

func floatVal(m map[string]interface{}, key string) float64 {
	if v, ok := m[key]; ok {
		if f, ok := v.(float64); ok {
			return f
		}
	}
	return 0
}
