package handlers

import (
	"context"
	"net/http"
	"sync"

	"cardclash/services"

	"github.com/gin-gonic/gin"
)

func GetCard(builder *services.CardBuilder) gin.HandlerFunc {
	return func(c *gin.Context) {
		playerName := c.Param("playerName")
		card, err := builder.BuildCard(context.Background(), playerName)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, card)
	}
}

func BuildPack(builder *services.CardBuilder) gin.HandlerFunc {
	return func(c *gin.Context) {
		var body struct {
			Players []string `json:"players"`
		}
		if err := c.ShouldBindJSON(&body); err != nil || len(body.Players) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "provide players array"})
			return
		}

		cards := make([]interface{}, len(body.Players))
		errs := make([]string, len(body.Players))
		var wg sync.WaitGroup
		for i, p := range body.Players {
			wg.Add(1)
			go func(idx int, name string) {
				defer wg.Done()
				card, err := builder.BuildCard(context.Background(), name)
				if err != nil {
					errs[idx] = err.Error()
					return
				}
				cards[idx] = card
			}(i, p)
		}
		wg.Wait()

		result := make([]interface{}, 0)
		for _, card := range cards {
			if card != nil {
				result = append(result, card)
			}
		}
		c.JSON(http.StatusOK, gin.H{"cards": result, "errors": errs})
	}
}

func GetDemoPack(cache *services.CacheService) gin.HandlerFunc {
	return func(c *gin.Context) {
		cards := cache.GetAll()
		c.JSON(http.StatusOK, gin.H{"cards": cards})
	}
}
