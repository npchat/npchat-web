package main

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"net/http"
	"strings"

	"github.com/gorilla/websocket"
)

func main() {
	http.HandleFunc("/", handleRequest)
	http.ListenAndServe(":3000", nil)
}

func handleRequest(w http.ResponseWriter, r *http.Request) {
	conn, _ := upgrader.Upgrade(w, r, nil)

	for {
		idEncoded := strings.TrimLeft(r.URL.Path, "/")

		var data map[string]interface{}
		err := conn.ReadJSON(&data)
		if err != nil {
			fmt.Println(err)
			return
		}

		if data["get"] == "challenge" {
			handleChallengeRequest(conn)
		}

		id, err := base64.RawURLEncoding.DecodeString(idEncoded)
		if err != nil {
			fmt.Println(err)
			return
		}

		fmt.Printf("%s sent %s %s\n",
			conn.RemoteAddr(),
			idEncoded,
			data["get"])

		err = conn.WriteMessage(websocket.BinaryMessage, id)
		if err != nil {
			fmt.Println(err)
			return
		}
	}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func genRandomBytes(size int) (blk []byte, err error) {
	blk = make([]byte, size)
	_, err = rand.Read(blk)
	return
}

func handleChallengeRequest(conn *websocket.Conn) {
	r, err := genRandomBytes(32)
	if err != nil {
		fmt.Println(err)
		return
	}
	str := base64.RawURLEncoding.EncodeToString(r)

	// sign

	err = conn.WriteMessage(websocket.TextMessage, []byte(str))
	if err != nil {
		fmt.Println(err)
		return
	}
}
