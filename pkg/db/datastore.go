package db

import (
    "appengine"
    "appengine/datastore"
    "time"
    "encoding/json"
)

type Aquarium struct {
	Key	*datastore.Key       `json:"key"` 
    Name     string       `json:"name"` 
    Address string       `json:"address"`
    Lat     string       `json:"lat"`
    Lng		string       `json:"lng"`
    Date time.Time       `json:"date"`
}

func Save(name string, address string, lat string, lng string, c appengine.Context)(err error) {
	aquarium := Get(name,c)
	if(aquarium==nil) {
	    aquarium := Aquarium{
	        Name:     name,
	        Lat:     lat,
	        Lng:	lng,
	        Address: address,
	        Date: time.Now(),
	    }
	    _, err = datastore.Put(c, datastore.NewIncompleteKey(c, "Aquarium", nil), &aquarium)
	    if err != nil {
	        c.Infof("insert error %v", err.Error())
	        return err
	    }
	    return nil
	}
	aquarium.Date = time.Now()
	aquarium.Address = address
	aquarium.Lat = lat
	aquarium.Lng = lng
	aquarium.Name = name
	_, err = datastore.Put(c, aquarium.Key, &aquarium)
    if err != nil {
        c.Infof("update error %v", err.Error())
        return err
    }
	return nil
}

func Get(name string, c appengine.Context) *Aquarium {
	q := datastore.NewQuery("Aquarium").Filter("Name =", name).Limit(1)
    var aquarium []*Aquarium
    if _, err := q.GetAll(c, &aquarium); err != nil {
        c.Infof("error %v", err.Error())
        return nil
    }
    if len(aquarium)>0 {
    	return aquarium[0]
    }
    return nil
}

func List(c appengine.Context)(resultJson []byte, err error) {
    q := datastore.NewQuery("Aquarium").Order("-Date")
    gpsList := make([]Aquarium, 0, 200)
    c.Infof("list size(1): %v", len(gpsList));
    if _, err := q.GetAll(c, &gpsList); err != nil {
        return nil, err
    }
    c.Infof("list size(2): %v", len(gpsList));
    resultJson, err = json.Marshal(gpsList)
    if err != nil {
        return nil, err
    }
    return resultJson, nil
}