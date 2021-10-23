package main

import (
	"bytes"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"math/big"

	"github.com/gorilla/websocket"
)

const CHALLENGE_LEN = 32

func GenRandomBytes(size int) (blk []byte, err error) {
	blk = make([]byte, size)
	_, err = rand.Read(blk)
	if err != nil {
		fmt.Println(err)
	}
	return
}

func HandleChallengeRequest(conn *websocket.Conn, priv *ecdsa.PrivateKey) {
	randBytes, err := GenRandomBytes(CHALLENGE_LEN)
	if err != nil {
		fmt.Println(err)
		return
	}
	txt := base64.RawURLEncoding.EncodeToString(randBytes)
	r := rand.Reader
	sig, err := ecdsa.SignASN1(r, priv, randBytes)
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

func VerifySolution(msg *ClientMessage, id []byte, sPub *ecdsa.PublicKey) bool {
	txt, err := base64.RawURLEncoding.DecodeString(msg.Challenge.Txt)
	if err != nil {
		fmt.Println(err)
		return false
	}

	// decode client public key
	cPubBytes, err := base64.RawURLEncoding.DecodeString(msg.PublicKey)
	if err != nil {
		fmt.Println(err)
		return false
	}

	// check id equals SHA-256 of public Key
	h := sha256.New()
	h.Write(cPubBytes)
	cPubHash := h.Sum(nil)
	if !bytes.Equal(id, cPubHash) {
		fmt.Println("public key does not match id", id, cPubHash)
		return false
	}

	// verify server signature
	sSig, err := base64.RawURLEncoding.DecodeString(msg.Challenge.Sig)
	if err != nil {
		fmt.Println(err)
		return false
	}
	sValid := ecdsa.VerifyASN1(sPub, txt, sSig)
	if !sValid {
		fmt.Println("server signature invalid")
		return false
	}

	// unmarshal client public key
	x, y := elliptic.Unmarshal(elliptic.P256(), cPubBytes)
	cPub := ecdsa.PublicKey{Curve: elliptic.P256(), X: x, Y: y}

	// decode client signature
	cSig, err := base64.RawURLEncoding.DecodeString(msg.Solution)
	if err != nil {
		fmt.Println(err)
		return false
	}
	cSigR := new(big.Int).SetBytes(cSig[:32])
	cSigS := new(big.Int).SetBytes(cSig[32:])

	// verify client signature
	return ecdsa.Verify(&cPub, txt, cSigR, cSigS)
}
