package handlers

import (
	"log"
	"net/http"

	"cardclash/ws"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	gorillaws "github.com/gorilla/websocket"
)

var upgrader = gorillaws.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func HandleWS(hub *ws.Hub) gin.HandlerFunc {
	return func(c *gin.Context) {
		roomID := c.Query("room_id")
		if roomID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "room_id required"})
			return
		}

		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("ws upgrade error: %v", err)
			return
		}

		client := &ws.Client{
			ID:     uuid.New().String(),
			RoomID: roomID,
			Hub:    hub,
			Conn:   conn,
			Send:   make(chan []byte, 256),
		}
		hub.Register(client)

		go client.WritePump()
		go client.ReadPump()
	}
}
