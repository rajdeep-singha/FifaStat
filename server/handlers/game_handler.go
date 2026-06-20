package handlers

import (
	"net/http"

	"cardclash/ws"

	"github.com/gin-gonic/gin"
)

func CreateRoom(hub *ws.Hub) gin.HandlerFunc {
	return func(c *gin.Context) {
		roomID := hub.CreateRoom()
		c.JSON(http.StatusOK, gin.H{"room_id": roomID})
	}
}

func GetRoom(hub *ws.Hub) gin.HandlerFunc {
	return func(c *gin.Context) {
		roomID := c.Param("roomID")
		room, ok := hub.GetRoom(roomID)
		if !ok {
			c.JSON(http.StatusNotFound, gin.H{"error": "room not found"})
			return
		}
		c.JSON(http.StatusOK, room.Session)
	}
}
