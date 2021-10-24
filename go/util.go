package main

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

type Options struct {
	Port         int
	CertPubPath  string
	CertPrivPath string
}

func GetOptionsFromArgs() (Options, error) {
	opt := Options{Port: 8000}
	if len(os.Args) <= 1 {
		return opt, nil
	}
	for i, a := range os.Args[1:] {
		kv := strings.Split(strings.ToLower(a), " ")
		switch strings.Trim(kv[0], " -") {
		case "p":
			p, err := strconv.Atoi(kv[1])
			if err != nil {
				fmt.Printf("arg %v -p %v (port) must be an int\n", i, kv[1])
				return Options{}, err
			}
			opt.Port = p
		case "certpriv":
			opt.CertPrivPath = kv[1]
		case "certpub":
			opt.CertPubPath = kv[1]
		default:
			fmt.Printf("arg %v not recognized", kv[0])
		}
	}
	return opt, nil
}
