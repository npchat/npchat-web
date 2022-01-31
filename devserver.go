package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
)

func main() {
	var port int
	var certFile string
	var keyFile string
	flag.IntVar(&port, "port", 8001, "must be an int")
	flag.StringVar(&certFile, "cert", "", "must be a file path")
	flag.StringVar(&keyFile, "key", "", "must be a file path")
	flag.Parse()

	addr := fmt.Sprintf(":%v", port)
	log.Println("Listening on " + addr)

	fs := http.FileServer(http.Dir("www"))

	var err error

	if certFile != "" && keyFile != "" {
		log.Println("Expecting HTTPS connections")
		err = http.ListenAndServeTLS(addr, certFile, keyFile, fs)
	} else {
		err = http.ListenAndServe(addr, fs)
	}

	if err != nil {
		log.Fatal(err)
	}
}
