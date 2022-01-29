package main

import (
	"log"
	"net/http"
)

func main() {
	fs := http.FileServer(http.Dir("./www"))
	log.Println("Listening on :8001...")
	err := http.ListenAndServeTLS(":8001", "cert.pem", "key.pem", fs)
	if err != nil {
		log.Fatal(err)
	}
}
