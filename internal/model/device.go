package model

import "go.mongodb.org/mongo-driver/v2/bson"

type Device struct {
	ID             bson.ObjectID  `bson:"_id,omitempty" json:"id,omitempty"`
	ModelName      string         `bson:"model_name" json:"model_name" binding:"required"`
	ImageUrl       string         `bson:"imageUrl" json:"imageUrl" binding:"required"`
	Specifications Specifications `bson:"specifications" json:"specifications" binding:"required"`
}

type Specifications struct {
	Network      Network      `bson:"network" json:"network" binding:"required,min=1,max=100"`
	Launch       Launch       `bson:"launch" json:"launch" binding:"required,min=1,max=100"`
	Body         Body         `bson:"body" json:"body" binding:"required,min=1,max=100"`
	Display      Display      `bson:"display" json:"display" binding:"required,min=1,max=100"`
	Platform     Platform     `bson:"platform" json:"platform" binding:"required,min=1,max=100"`
	Memory       Memory       `bson:"memory" json:"memory" binding:"required,min=1,max=100"`
	MainCamera   MainCamera   `bson:"mainCamera" json:"mainCamera" binding:"required,min=1,max=100"`
	SelfieCamera SelfieCamera `bson:"selfieCamera" json:"selfieCamera" binding:"required,min=1,max=100"`
	Sound        Sound        `bson:"sound" json:"sound" binding:"required,min=1,max=100"`
	Comms        Comms        `bson:"comms" json:"comms" binding:"required,min=1,max=100"`
	Features     Features     `bson:"features" json:"features" binding:"required,min=1,max=100"`
	Battery      Battery      `bson:"battery" json:"battery" binding:"required,min=1,max=100"`
	Misc         Misc         `bson:"misc" json:"misc" binding:"required,min=1,max=100"`
}

type Network struct {
	Technology string `bson:"technology" json:"technology" binding:"required,min=1,max=100"`
	Bands2G    string `bson:"bands_2g" json:"bands_2g" binding:"required,min=1,max=100"`
	Bands3G    string `bson:"bands_3g" json:"bands_3g" binding:"required,min=1,max=100"`
	Bands4G    string `bson:"bands_4g" json:"bands_4g" binding:"required,min=1,max=100"`
	Bands5G    string `bson:"bands_5g" json:"bands_5g" binding:"required,min=1,max=100"`
	Speed      string `bson:"speed" json:"speed" binding:"required,min=1,max=100"`
}

type Launch struct {
	Announced string `bson:"announced" json:"announced" binding:"required,min=1,max=100"`
	Status    string `bson:"status" json:"status" binding:"required,min=1,max=100"`
}

type Body struct {
	Dimensions string `bson:"dimensions" json:"dimensions" binding:"required,min=1,max=100"`
	Weight     string `bson:"weight" json:"weight" binding:"required,min=1,max=100"`
	Build      string `bson:"build" json:"build" binding:"required,min=1,max=100"`
	SIM        string `bson:"sim" json:"sim" binding:"required,min=1,max=100"`
	IPRating   string `bson:"ip_rating" json:"ip_rating" binding:"required,min=1,max=100"`
}

type Display struct {
	Type       string `bson:"type" json:"type" binding:"required,min=1,max=100"`
	Size       string `bson:"size" json:"size" binding:"required,min=1,max=100"`
	Resolution string `bson:"resolution" json:"resolution" binding:"required,min=1,max=100"`
}

type Platform struct {
	OS      string `bson:"os" json:"os" binding:"required,min=1,max=100"`
	Chipset string `bson:"chipset" json:"chipset" binding:"required,min=1,max=100"`
	CPU     string `bson:"cpu" json:"cpu" binding:"required,min=1,max=100"`
	GPU     string `bson:"gpu" json:"gpu" binding:"required,min=1,max=100"`
}

type Memory struct {
	CardSlot string `bson:"card_slot" json:"card_lot" binding:"required,min=1,max=100"`
	Internal string `bson:"internal" json:"internal" binding:"required,min=1,max=100"`
}

type MainCamera struct {
	Triple   string `bson:"triple" json:"triple" binding:"required,min=1,max=100"`
	Features string `bson:"features" json:"features" binding:"required,min=1,max=100"`
	Single   string `bson:"single" json:"single" binding:"required,min=1,max=100"`
	Video    string `bson:"video" json:"video" binding:"required,min=1,max=100"`
}

type SelfieCamera struct {
	Single string `bson:"single" json:"single" binding:"required,min=1,max=100"`
	Video  string `bson:"video" json:"video" binding:"required,min=1,max=100"`
}

type Sound struct {
	Loudspeaker string `bson:"loudspeaker" json:"loudspeaker" binding:"required,min=1,max=100"`
	Jack35mm    string `bson:"jack_3.5mm" json:"jack_3.5mm" binding:"required,min=1,max=100"`
}

type Comms struct {
	WLAN        string `bson:"wlan" json:"wlan" binding:"required,min=1,max=100"`
	Bluetooth   string `bson:"bluetooth" json:"bluetooth" binding:"required,min=1,max=100"`
	Positioning string `bson:"positioning" json:"positioning" binding:"required,min=1,max=100"`
	NFC         string `bson:"nfc" json:"nfc" binding:"required,min=1,max=100"`
	Radio       string `bson:"radio" json:"radio" binding:"required,min=1,max=100"`
	USB         string `bson:"usb" json:"usb" binding:"required,min=1,max=100"`
}

type Features struct {
	Sensors string `bson:"sensors" json:"sensors" binding:"required,min=1,max=100"`
}

type Battery struct {
	Type     string `bson:"type" json:"type" binding:"required,min=1,max=100"`
	Charging string `bson:"charging" json:"charging" binding:"required,min=1,max=100"`
}

type Misc struct {
	Colors string `bson:"colors" json:"colors" binding:"required,min=1,max=100"`
	Models string `bson:"models" json:"models" binding:"required,min=1,max=100"`
	Price  string `bson:"price" json:"price" binding:"required,min=1,max=100"`
}
