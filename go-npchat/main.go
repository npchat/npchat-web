package main

import (
	"encoding/base64"
	"fmt"
	"net/http"
	"strings"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

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
			err = conn.WriteMessage(websocket.TextMessage, []byte("challenge accepted!"))
			if err != nil {
				fmt.Println(err)
			}
			return
		} else {
			fmt.Printf("data:  %s\n", data)
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
