package main

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/gorilla/websocket"
)

const PORT = 3000

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

type ChatMessage struct {
	Id   string
	Body []byte
}

func main() {
	msgCountChan := make(chan int)
	defer close(msgCountChan)

	privChan := make(chan ecdsa.PrivateKey)
	defer close(privChan)

	// buffered channel for each ID
	msgStore := make(map[string]chan []byte)

	go KeepFreshKey(msgCountChan, privChan, 5)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Access-Control-Allow-Origin", "*")

		idEncoded := strings.TrimLeft(r.URL.Path, "/")
		id, err := base64.RawURLEncoding.DecodeString(idEncoded)
		if err != nil {
			fmt.Println(err)
			return
		}

		if msgStore[idEncoded] == nil {
			msgStore[idEncoded] = make(chan []byte, 10)
		}

		// handle POST message
		if r.Method == "POST" {
			body, err := ioutil.ReadAll(r.Body)
			if err != nil {
				fmt.Println("Error reading body ", err)
				http.Error(w, "Error reading body", http.StatusBadRequest)
				return
			}
			fmt.Println(len(msgStore[idEncoded]), "<- msg ")
			msgStore[idEncoded] <- body
			fmt.Println(len(msgStore[idEncoded]), "<- msg ")
			r := ServerMessage{Message: "sent"}
			rj, err := json.Marshal(r)
			if err != nil {
				fmt.Println("failed to marshal response")
			}
			w.Write(rj)
			return
		}

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

			err = HandleSocketMessage(conn, &msg, msgCountChan, privChan, id, msgStore[idEncoded])
			if err != nil {
				fmt.Println("failed handling ws msg", err)
				break
			}
		}
		err = conn.Close()
		if err != nil {
			fmt.Println(err)
		}
	})
	fmt.Printf("Listening on :%v\n", PORT)
	http.ListenAndServe(fmt.Sprintf(":%v", PORT), nil)
}

func HandleSocketMessage(conn *websocket.Conn, msg *ClientMessage,
	msgCountChan chan int, priv chan ecdsa.PrivateKey,
	id []byte, msgChan chan []byte) error {

	if msg.Get == "challenge" {
		msgCountChan <- 1
		privKey := <-priv
		HandleChallengeRequest(conn, &privKey)
	} else if msg.Solution != "" {
		msgCountChan <- 0 // don't increment counter
		privKey := <-priv
		if !VerifySolution(msg, id, &privKey.PublicKey) {
			fmt.Println("unauthorized")
			return nil
		}
		fmt.Println("AUTHED")
		r := ServerMessage{Message: "handshake done"}
		rj, err := json.Marshal(r)
		if err != nil {
			return err
		}
		conn.WriteMessage(websocket.TextMessage, rj)
		for m := range msgChan {
			err = conn.WriteMessage(websocket.TextMessage, m)
			if err != nil {
				fmt.Println("handle this!!")
				msgChan <- m // ??!!
				return err
			}
		}
	} else {
		fmt.Println("invalid message")
	}
	return nil
}

// Refresh key after given limit for challenge count
func KeepFreshKey(msgCountChan chan int, privChan chan ecdsa.PrivateKey, limit int) {
	count := 0
	curKey, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		fmt.Println(err)
		return
	}
	for msgCount := range msgCountChan {
		count += msgCount
		if count >= limit {
			curKey, err = ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
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
