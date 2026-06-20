package ws

import (
	"encoding/json"
	"log"
	"math/rand"
	"sync"

	"cardclash/models"
	"cardclash/services"

	"github.com/google/uuid"
)

type IncomingMsg struct {
	Client *Client
	Data   []byte
}

type Room struct {
	ID      string
	Session *models.GameSession
	P1      *Client
	P2      *Client
	mu      sync.Mutex
	// pending choices for current round
	pendingP1Choice *models.RoundChoice
	pendingP2Choice *models.RoundChoice
}

func (r *Room) broadcast(msg WSMessage) {
	data, _ := json.Marshal(msg)
	if r.P1 != nil {
		select {
		case r.P1.Send <- data:
		default:
		}
	}
	if r.P2 != nil {
		select {
		case r.P2.Send <- data:
		default:
		}
	}
}

type Hub struct {
	rooms      map[string]*Room
	register   chan *Client
	unregister chan *Client
	incoming   chan IncomingMsg
	mu         sync.RWMutex
	cache      *services.CacheService
}

func NewHub(cache *services.CacheService) *Hub {
	return &Hub{
		rooms:      make(map[string]*Room),
		register:   make(chan *Client, 64),
		unregister: make(chan *Client, 64),
		incoming:   make(chan IncomingMsg, 256),
		cache:      cache,
	}
}

func (h *Hub) Register(c *Client) {
	h.register <- c
}

func (h *Hub) CreateRoom() string {
	id := uuid.New().String()[:8]
	h.mu.Lock()
	h.rooms[id] = &Room{
		ID:      id,
		Session: &models.GameSession{RoomID: id, Status: "waiting"},
	}
	h.mu.Unlock()
	return id
}

func (h *Hub) GetRoom(id string) (*Room, bool) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	r, ok := h.rooms[id]
	return r, ok
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.handleRegister(client)
		case client := <-h.unregister:
			h.handleUnregister(client)
		case msg := <-h.incoming:
			h.handleIncoming(msg)
		}
	}
}

func (h *Hub) handleRegister(c *Client) {
	h.mu.Lock()
	room, ok := h.rooms[c.RoomID]
	h.mu.Unlock()
	if !ok {
		c.SendMsg(WSMessage{Type: MsgError, Payload: ErrorPayload{Message: "room not found"}})
		return
	}

	room.mu.Lock()
	defer room.mu.Unlock()

	if room.P1 == nil {
		room.P1 = c
		c.Slot = 1
		room.Session.P1ID = c.ID
		log.Printf("P1 joined room %s", c.RoomID)
	} else if room.P2 == nil {
		room.P2 = c
		c.Slot = 2
		room.Session.P2ID = c.ID
		log.Printf("P2 joined room %s", c.RoomID)
		// Both players ready — deal hands
		h.startGame(room)
	} else {
		c.SendMsg(WSMessage{Type: MsgError, Payload: ErrorPayload{Message: "room is full"}})
		return
	}
	// Notify P1 that opponent joined (if P2 just connected)
	if c.Slot == 2 && room.P1 != nil {
		room.P1.SendMsg(WSMessage{Type: MsgOpponentReady, Payload: nil})
	}
}

func (h *Hub) startGame(room *Room) {
	// Get all demo cards from cache
	allCards := h.cache.GetAll()
	if len(allCards) < 10 {
		log.Printf("Not enough cards in cache for room %s", room.ID)
		room.broadcast(WSMessage{Type: MsgError, Payload: ErrorPayload{Message: "not enough cards"}})
		return
	}

	// Shuffle and deal 5 each
	perm := rand.Perm(len(allCards))
	p1Hand := make([]models.Card, 0, 5)
	p2Hand := make([]models.Card, 0, 5)
	for i, idx := range perm {
		if i < 5 {
			p1Hand = append(p1Hand, *allCards[idx])
		} else if i < 10 {
			p2Hand = append(p2Hand, *allCards[idx])
		} else {
			break
		}
	}

	room.Session.P1Hand = p1Hand
	room.Session.P2Hand = p2Hand
	room.Session.Status = "active"
	room.Session.CurrentRound = 1

	room.broadcast(WSMessage{Type: MsgRoomReady, Payload: nil})
	room.P1.SendMsg(WSMessage{Type: MsgDealHand, Payload: DealHandPayload{Hand: p1Hand, PlayerSlot: 1}})
	room.P2.SendMsg(WSMessage{Type: MsgDealHand, Payload: DealHandPayload{Hand: p2Hand, PlayerSlot: 2}})
}

func (h *Hub) handleUnregister(c *Client) {
	h.mu.RLock()
	room, ok := h.rooms[c.RoomID]
	h.mu.RUnlock()
	if !ok {
		return
	}
	close(c.Send)
	room.mu.Lock()
	defer room.mu.Unlock()
	if room.P1 == c {
		room.P1 = nil
		if room.P2 != nil {
			room.P2.SendMsg(WSMessage{Type: MsgError, Payload: ErrorPayload{Message: "opponent disconnected"}})
		}
	} else if room.P2 == c {
		room.P2 = nil
		if room.P1 != nil {
			room.P1.SendMsg(WSMessage{Type: MsgError, Payload: ErrorPayload{Message: "opponent disconnected"}})
		}
	}
}

func (h *Hub) handleIncoming(im IncomingMsg) {
	var msg WSMessage
	if err := json.Unmarshal(im.Data, &msg); err != nil {
		return
	}
	switch msg.Type {
	case MsgSubmitChoice:
		h.handleChoice(im.Client, msg)
	}
}

func (h *Hub) handleChoice(c *Client, msg WSMessage) {
	h.mu.RLock()
	room, ok := h.rooms[c.RoomID]
	h.mu.RUnlock()
	if !ok {
		return
	}

	var payload SubmitChoicePayload
	data, _ := json.Marshal(msg.Payload)
	if err := json.Unmarshal(data, &payload); err != nil {
		return
	}
	choice := models.RoundChoice{CardID: payload.CardID, StatKey: payload.StatKey}

	room.mu.Lock()
	defer room.mu.Unlock()

	if c.Slot == 1 {
		room.pendingP1Choice = &choice
	} else {
		room.pendingP2Choice = &choice
	}

	// Both choices received
	if room.pendingP1Choice == nil || room.pendingP2Choice == nil {
		return
	}

	p1Choice := *room.pendingP1Choice
	p2Choice := *room.pendingP2Choice
	room.pendingP1Choice = nil
	room.pendingP2Choice = nil

	// Find the cards played
	var p1Card, p2Card *models.Card
	for i := range room.Session.P1Hand {
		if room.Session.P1Hand[i].ID == p1Choice.CardID {
			p1Card = &room.Session.P1Hand[i]
			break
		}
	}
	for i := range room.Session.P2Hand {
		if room.Session.P2Hand[i].ID == p2Choice.CardID {
			p2Card = &room.Session.P2Hand[i]
			break
		}
	}
	if p1Card == nil || p2Card == nil {
		log.Printf("Card not found in hand")
		return
	}

	result := services.ResolveRound(*p1Card, *p2Card, p1Choice, p2Choice, room.Session.CurrentRound)
	if result.WinnerPlayer == 1 {
		room.Session.P1Score++
	} else if result.WinnerPlayer == 2 {
		room.Session.P2Score++
	}
	room.Session.Rounds = append(room.Session.Rounds, result)
	room.Session.CurrentRound++

	room.broadcast(WSMessage{
		Type: MsgRoundResult,
		Payload: RoundResultPayload{
			Result:  result,
			P1Score: room.Session.P1Score,
			P2Score: room.Session.P2Score,
		},
	})

	// Check game over: best of 3 (first to 2 wins, or after 3 rounds)
	p1 := room.Session.P1Score
	p2 := room.Session.P2Score
	roundsDone := len(room.Session.Rounds)
	gameOver := p1 == 2 || p2 == 2 || roundsDone == 3

	if gameOver {
		winnerSlot := 0
		if p1 > p2 {
			winnerSlot = 1
		} else if p2 > p1 {
			winnerSlot = 2
		}
		room.Session.Status = "finished"
		room.broadcast(WSMessage{
			Type: MsgGameOver,
			Payload: GameOverPayload{
				WinnerSlot:   winnerSlot,
				FinalP1Score: p1,
				FinalP2Score: p2,
			},
		})
	}
}
