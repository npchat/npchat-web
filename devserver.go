package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

type spaHandler struct {
	rootDir   string
	indexFile string
}

func (h *spaHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	p := filepath.Join(h.rootDir, filepath.Clean(r.URL.Path))

	if info, err := os.Stat(p); err != nil {
		http.ServeFile(w, r, filepath.Join(h.rootDir, h.indexFile))
		return
	} else if info.IsDir() {
		http.ServeFile(w, r, filepath.Join(h.rootDir, h.indexFile))
		return
	}

	http.ServeFile(w, r, p)
}

func main() {
	var port int
	var certFile string
	var keyFile string
	flag.IntVar(&port, "port", 8001, "must be an int")
	flag.StringVar(&certFile, "cert", "", "must be a file path")
	flag.StringVar(&keyFile, "key", "", "must be a file path")
	flag.Parse()

	addr := fmt.Sprintf(":%v", port)
	log.Println("listening on " + addr)

	spaHandler := spaHandler{
		rootDir:   "www",
		indexFile: "index.html",
	}

	var err error

	if certFile != "" && keyFile != "" {
		log.Println("expecting HTTPS connections")
		err = http.ListenAndServeTLS(addr, certFile, keyFile, &spaHandler)
	} else {
		err = http.ListenAndServe(addr, &spaHandler)
	}

	if err != nil {
		log.Fatal(err)
	}
}
