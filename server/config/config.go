package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AnakinAPIKey      string
	AnakinBaseURL     string
	AnakinStatsAppID  string
	AnakinFormAppID   string
	AnakinSearchAppID string
	Port              string
	AllowedOrigins    string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}
	return &Config{
		AnakinAPIKey:      getEnv("ANAKIN_API_KEY", ""),
		AnakinBaseURL:     "https://api.anakin.ai/v1",
		AnakinStatsAppID:  getEnv("ANAKIN_STATS_APP_ID", ""),
		AnakinFormAppID:   getEnv("ANAKIN_FORM_APP_ID", ""),
		AnakinSearchAppID: getEnv("ANAKIN_SEARCH_APP_ID", ""),
		Port:              getEnv("PORT", "8080"),
		AllowedOrigins:    getEnv("ALLOWED_ORIGINS", "http://localhost:5173"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
