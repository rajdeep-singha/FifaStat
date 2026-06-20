package ws

import "cardclash/models"

type MessageType string

const (
	MsgJoinRoom      MessageType = "join_room"
	MsgRoomReady     MessageType = "room_ready"
	MsgDealHand      MessageType = "deal_hand"
	MsgSubmitChoice  MessageType = "submit_choice"
	MsgRoundResult   MessageType = "round_result"
	MsgGameOver      MessageType = "game_over"
	MsgOpponentReady MessageType = "opponent_ready"
	MsgError         MessageType = "error"
)

type WSMessage struct {
	Type    MessageType `json:"type"`
	Payload interface{} `json:"payload"`
}

type JoinRoomPayload struct {
	RoomID string `json:"room_id"`
}

type DealHandPayload struct {
	Hand       []models.Card `json:"hand"`
	PlayerSlot int           `json:"player_slot"` // 1 or 2
}

type SubmitChoicePayload struct {
	CardID  string `json:"card_id"`
	StatKey string `json:"stat_key"`
}

type RoundResultPayload struct {
	Result  models.RoundResult `json:"result"`
	P1Score int                `json:"p1_score"`
	P2Score int                `json:"p2_score"`
}

type GameOverPayload struct {
	WinnerSlot      int          `json:"winner_slot"` // 1 or 2
	TransferredCard *models.Card `json:"transferred_card,omitempty"`
	FinalP1Score    int          `json:"final_p1_score"`
	FinalP2Score    int          `json:"final_p2_score"`
}

type ErrorPayload struct {
	Message string `json:"message"`
}
