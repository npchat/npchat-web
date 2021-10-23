package main

import (
	"bytes"
	"crypto"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"encoding/base64"
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

func main() {

	challenges := make(chan int)
	defer close(challenges)
	privChan := make(chan ecdsa.PrivateKey)
	defer close(privChan)

	go KeepFreshKeys(challenges, privChan, 10)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		conn, _ := upgrader.Upgrade(w, r, nil)

		for {
			var data map[string]interface{}
			err := conn.ReadJSON(&data)
			if err != nil {
				fmt.Println(err)
				return
			}

			if data["get"] == "challenge" {
				challenges <- 1
				priv := <-privChan
				HandleChallengeRequest(conn, &priv)
			}

			idEncoded := strings.TrimLeft(r.URL.Path, "/")
			/*id, err := base64.RawURLEncoding.DecodeString(idEncoded)
			if err != nil {
				fmt.Println(err)
				return
			}*/

			fmt.Println(conn.RemoteAddr(), idEncoded)
		}
	})
	http.ListenAndServe(":3000", nil)
}

func HandleChallengeRequest(conn *websocket.Conn, priv *ecdsa.PrivateKey) {
	randBytes, err := GenRandomBytes(32)
	if err != nil {
		fmt.Println(err)
		return
	}
	txt := base64.RawURLEncoding.EncodeToString(randBytes)

	// sign
	r := rand.Reader
	sig, err := priv.Sign(r, randBytes, crypto.BLAKE2b_256)
	if err != nil {
		fmt.Println(err)
		return
	}
	sigStr := base64.RawURLEncoding.EncodeToString(sig)
	chall := Challenge{txt, sigStr}
	buf := new(bytes.Buffer)
	json.NewEncoder(buf).Encode(chall)
	err = conn.WriteMessage(websocket.TextMessage, buf.Bytes())
	if err != nil {
		fmt.Println(err)
		return
	}
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

func GetFreshKeys() (*ecdsa.PrivateKey, error) {
	// generate ECDSA P-256 keys
	c := elliptic.P256()
	r := rand.Reader
	priv, err := ecdsa.GenerateKey(c, r)
	if err != nil {
		fmt.Println(err)
	}
	return priv, err
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func GenRandomBytes(size int) (blk []byte, err error) {
	blk = make([]byte, size)
	_, err = rand.Read(blk)
	if err != nil {
		fmt.Println(err)
	}
	return
}
