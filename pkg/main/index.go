package main

import (
	"appengine"
	"appengine/user"
	"fmt"
	"html/template"
	"net/http"
	"pkg/db"
)

func init() {
	http.HandleFunc("/", index)
	http.HandleFunc("/save", save)
	http.HandleFunc("/list", list)
}

func index(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	u := user.Current(c)
	if u == nil {
		url, err := user.LoginURL(c, r.URL.String())
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Location", url)
		w.WriteHeader(http.StatusFound)
		return
	}
	var mapTemplate = template.Must(template.ParseFiles("template/map.html"))
	if err := mapTemplate.Execute(w, nil); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func save(w http.ResponseWriter, r *http.Request) {
	var name = r.FormValue("name")
	var lat = r.FormValue("lat")
	var lng = r.FormValue("lng")
	var address = r.FormValue("address")
	c := appengine.NewContext(r)
	err := db.Save(name, address, lat, lng, c)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func list(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	gpsList, err := db.List(c)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	fmt.Fprintf(w, "%s", gpsList)
}
