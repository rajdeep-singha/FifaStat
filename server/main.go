package main

import (
	"log"
	"time"

	"cardclash/config"
	"cardclash/handlers"
	"cardclash/middleware"
	"cardclash/services"
	ws "cardclash/ws"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	cache := services.NewCacheService(30 * time.Minute)
	if err := cache.LoadDemoPack("data/demo_pack.json"); err != nil {
		log.Printf("Warning: could not load demo pack: %v", err)
	}

	anakin := services.NewAnakinService(cfg)
	builder := services.NewCardBuilder(anakin, cache, cfg)
	hub := ws.NewHub(cache)
	go hub.Run()

	r := gin.Default()
	r.Use(middleware.CORS(cfg))

	api := r.Group("/api")
	{
		api.GET("/cards/demo", handlers.GetDemoPack(cache))
		api.GET("/cards/:playerName", handlers.GetCard(builder))
		api.POST("/cards/pack", handlers.BuildPack(builder))
		api.POST("/rooms", handlers.CreateRoom(hub))
		api.GET("/rooms/:roomID", handlers.GetRoom(hub))
	}

	r.GET("/ws", handlers.HandleWS(hub))

	log.Printf("CardClash server starting on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
