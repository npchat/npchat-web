package main

import (
	"bytes"
	"crypto"
	"crypto/ecdsa"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"

	"github.com/gorilla/websocket"
)

func GenRandomBytes(size int) (blk []byte, err error) {
	blk = make([]byte, size)
	_, err = rand.Read(blk)
	if err != nil {
		fmt.Println(err)
	}
	return
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
	resp := ServerChallenge{Challenge: chall}
	buf := new(bytes.Buffer)
	json.NewEncoder(buf).Encode(resp)
	err = conn.WriteMessage(websocket.TextMessage, buf.Bytes())
	if err != nil {
		fmt.Println(err)
		return
	}
}

func VerifySolution(msg *ClientMessage) bool {
	return true
}
