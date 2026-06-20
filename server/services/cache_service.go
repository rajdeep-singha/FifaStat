package services

import (
	"encoding/json"
	"os"
	"sync"
	"time"

	"cardclash/models"
)

type cacheEntry struct {
	Card      *models.Card
	ExpiresAt time.Time
}

type CacheService struct {
	mu      sync.RWMutex
	entries map[string]*cacheEntry
	ttl     time.Duration
}

func NewCacheService(ttl time.Duration) *CacheService {
	return &CacheService{
		entries: make(map[string]*cacheEntry),
		ttl:     ttl,
	}
}

func (c *CacheService) Get(key string) (*models.Card, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	e, ok := c.entries[key]
	if !ok || time.Now().After(e.ExpiresAt) {
		return nil, false
	}
	return e.Card, true
}

func (c *CacheService) Set(key string, card *models.Card) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.entries[key] = &cacheEntry{Card: card, ExpiresAt: time.Now().Add(c.ttl)}
}

func (c *CacheService) GetAll() []*models.Card {
	c.mu.RLock()
	defer c.mu.RUnlock()
	cards := make([]*models.Card, 0, len(c.entries))
	for _, e := range c.entries {
		if time.Now().Before(e.ExpiresAt) {
			cards = append(cards, e.Card)
		}
	}
	return cards
}

func (c *CacheService) LoadDemoPack(path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	var cards []models.Card
	if err := json.Unmarshal(data, &cards); err != nil {
		return err
	}
	for i := range cards {
		c.Set(cards[i].ID, &cards[i])
		c.Set(cards[i].PlayerName, &cards[i])
	}
	return nil
}
