package main

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"fmt"
)

func GetFreshKeys() (*ecdsa.PrivateKey, error) {
	// generate ECDSA P-256 keys
	c := elliptic.P256()
	r := rand.Reader
	priv, err := ecdsa.GenerateKey(c, r)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println("Got fresh keys")
	return priv, err
}
