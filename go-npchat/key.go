package main

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"fmt"
)

// Generate ECDSA P-256 key
func GetFreshKey() (*ecdsa.PrivateKey, error) {
	c := elliptic.P256()
	r := rand.Reader
	priv, err := ecdsa.GenerateKey(c, r)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println("Got fresh key")
	return priv, err
}
