package main

import (
	"bytes"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"math/big"

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
	sigR, sigS, err := ecdsa.Sign(r, priv, randBytes)
	if err != nil {
		fmt.Println(err)
		return
	}

	buf := bytes.NewBuffer(sigR.Bytes())
	buf.Write(sigS.Bytes())

	sigStr := base64.RawURLEncoding.EncodeToString(buf.Bytes())
	chall := Challenge{txt, sigStr}
	resp := ServerChallenge{Challenge: chall}
	buf = new(bytes.Buffer)
	json.NewEncoder(buf).Encode(resp)
	err = conn.WriteMessage(websocket.TextMessage, buf.Bytes())
	if err != nil {
		fmt.Println(err)
		return
	}
}

func VerifySolution(msg *ClientMessage, id []byte, sPub *ecdsa.PublicKey) bool {
	// verify server sig
	sSig, err := base64.RawURLEncoding.DecodeString(msg.Challenge.Sig)
	if err != nil {
		fmt.Println(err)
		return false
	}
	txt, err := base64.RawURLEncoding.DecodeString(msg.Challenge.Txt)
	if err != nil {
		fmt.Println(err)
		return false
	}
	sR := new(big.Int).SetBytes(sSig[:len(sSig)/2])
	sS := new(big.Int).SetBytes(sSig[len(sSig)/2:])
	sValid := ecdsa.Verify(sPub, txt, sR, sS)
	if !sValid {
		fmt.Println("server sig not valid")
		return false
	}

	fmt.Println("server sig valid")

	// verify client sig
	cSig, err := base64.RawURLEncoding.DecodeString(msg.Solution)

	fmt.Println("Client sig ", string(cSig))

	if err != nil {
		fmt.Println(err)
		return false
	}
	cPubBytes, err := base64.RawURLEncoding.DecodeString(msg.PublicKey)
	if err != nil {
		fmt.Println(err)
		return false
	}
	cX := new(big.Int).SetBytes(cPubBytes[:len(cPubBytes)/2])
	cY := new(big.Int).SetBytes(cPubBytes[len(cPubBytes)/2:])

	cPub := new(ecdsa.PublicKey)
	cPub.Curve = elliptic.P256()
	cPub.X = cX
	cPub.Y = cY

	cR := new(big.Int).SetBytes(cSig[:len(cSig)/2])
	cS := new(big.Int).SetBytes(cSig[len(cSig)/2:])
	cValid := ecdsa.Verify(cPub, txt, cR, cS)

	return cValid
}
