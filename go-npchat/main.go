package main

import (
	"crypto/ecdsa"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/gorilla/websocket"
)

type Challenge struct {
	Txt string `json:"txt"`
	Sig string `json:"sig"`
}

type ServerMessage struct {
	Message string `json:"message"`
}

type ServerChallenge struct {
	Challenge Challenge `json:"challenge"`
}

type ClientMessage struct {
	Get       string    `json:"get"`
	Challenge Challenge `json:"challenge"`
	PublicKey string    `json:"publicKey"`
	Solution  string    `json:"solution"`
}

func main() {
	msgCountChan := make(chan int)
	defer close(msgCountChan)
	privChan := make(chan ecdsa.PrivateKey)
	defer close(privChan)

	go KeepFreshKeys(msgCountChan, privChan, 5)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			fmt.Println(err)
			return
		}
		for {
			msgType, msgTxt, err := conn.ReadMessage()
			if err != nil {
				fmt.Println(err)
				break
			}
			if msgType != websocket.TextMessage {
				fmt.Println("send only json")
				break
			}

			var msg ClientMessage
			err = json.Unmarshal(msgTxt, &msg)
			if err != nil {
				fmt.Println(err)
				break
			}

			idEncoded := strings.TrimLeft(r.URL.Path, "/")
			id, err := base64.RawURLEncoding.DecodeString(idEncoded)
			if err != nil {
				fmt.Println(err)
				return
			}

			err = HandleMessage(conn, &msg, msgCountChan, privChan, id)
			if err != nil {
				fmt.Println(err)
				break
			}

		}
		err = conn.Close()
		if err != nil {
			fmt.Println(err)
		}
	})
	http.ListenAndServe(":3000", nil)
}

func HandleMessage(conn *websocket.Conn, msg *ClientMessage,
	msgCountChan chan int, priv chan ecdsa.PrivateKey,
	id []byte) error {

	if msg.Get == "challenge" {
		msgCountChan <- 1
		privKey := <-priv
		HandleChallengeRequest(conn, &privKey)
	} else if msg.Solution != "" {
		msgCountChan <- 0 // don't increment counter
		privKey := <-priv
		if VerifySolution(msg, id, &privKey.PublicKey) {
			fmt.Println("AUTHED")
			r := ServerMessage{Message: "handshake done"}
			rj, err := json.Marshal(r)
			if err != nil {
				return err
			}
			conn.WriteMessage(websocket.TextMessage, rj)
		} else {
			fmt.Println("unauthorized")
		}
	} else {
		fmt.Println("invalid message")
	}
	return nil
}

// Refresh keys after given limit for challenge count
func KeepFreshKeys(msgCountChan chan int, privChan chan ecdsa.PrivateKey, limit int) {
	count := 0
	curKey, err := GetFreshKey()
	if err != nil {
		fmt.Println(err)
		return
	}
	for {
		count += <-msgCountChan
		if count >= limit {
			curKey, err = GetFreshKey()
			if err != nil {
				fmt.Println(err)
				return
			}
			count = 0
		}
		privChan <- *curKey
	}
}

func CheckOrigin(r *http.Request) bool {
	return true
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     CheckOrigin,
}
