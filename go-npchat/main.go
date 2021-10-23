package main

import (
	"crypto/ecdsa"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

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

	challenges := make(chan int)
	defer close(challenges)
	privChan := make(chan ecdsa.PrivateKey)
	defer close(privChan)

	go KeepFreshKeys(challenges, privChan, 10)

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

			if msg.Get == "challenge" {
				challenges <- 1
				priv := <-privChan
				HandleChallengeRequest(conn, &priv)
			} else if msg.Solution != "" {
				fmt.Println("verify")
				if VerifySolution(&msg) {
					fmt.Println("AUTHED")
					r := ServerMessage{Message: "handshake done"}
					rj, err := json.Marshal(r)
					if err != nil {
						fmt.Println(err)
						break
					}
					conn.WriteMessage(websocket.TextMessage, rj)
				} else {
					fmt.Println("unauthorized")
				}
			} else {
				fmt.Println("invalid message")
			}

			idEncoded := strings.TrimLeft(r.URL.Path, "/")
			/*id, err := base64.RawURLEncoding.DecodeString(idEncoded)
			if err != nil {
				fmt.Println(err)
				return
			}*/

			fmt.Println(conn.RemoteAddr(), idEncoded)
		}
		err = conn.Close()
		if err != nil {
			fmt.Println(err)
		}
	})
	http.ListenAndServe(":3000", nil)
}

func KeepFreshKeys(challenges chan int, priv chan ecdsa.PrivateKey, limit int) {
	count := 0
	currentKey, err := GetFreshKeys()
	if err != nil {
		fmt.Println(err)
		return
	}
	for {
		count += <-challenges
		fmt.Println("c", count)
		if count >= limit {
			time.Sleep(time.Millisecond * 2000)
			currentKey, err = GetFreshKeys()
			if err != nil {
				fmt.Println(err)
				return
			}
			count = 0
		}
		priv <- *currentKey
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
