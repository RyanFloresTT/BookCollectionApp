package models

import (
	"time"

	"gorm.io/gorm"
)

type Book struct {
	gorm.Model
	Title      string     `json:"title" gorm:"not null"`
	Author     string     `json:"author" gorm:"not null"`
	CoverImage string     `json:"coverImage"`
	Rating     float64    `json:"rating"`
	PageCount  uint       `json:"page_count"`
	Genre      string     `json:"genre"`
	UserID     uint       `json:"user_id"`
	StartedAt  *time.Time `json:"started_at"`
	FinishedAt *time.Time `json:"finished_at"`
}

type GoogleBookResponse struct {
	Kind       string       `json:"kind"`
	TotalItems int          `json:"totalItems"`
	Items      []GoogleBook `json:"items"`
}

type GoogleBook struct {
	Kind       string `json:"kind"`
	ID         string `json:"id"`
	Etag       string `json:"etag"`
	SelfLink   string `json:"selfLink"`
	VolumeInfo struct {
		Title               string   `json:"title"`
		Authors             []string `json:"authors"`
		Publisher           string   `json:"publisher"`
		PublishedDate       string   `json:"publishedDate"`
		Description         string   `json:"description"`
		IndustryIdentifiers []struct {
			Type       string `json:"type"`
			Identifier string `json:"identifier"`
		} `json:"industryIdentifiers"`
		ReadingModes struct {
			Text  bool `json:"text"`
			Image bool `json:"image"`
		} `json:"readingModes"`
		PageCount           int      `json:"pageCount"`
		PrintType           string   `json:"printType"`
		Categories          []string `json:"categories"`
		AverageRating       float64  `json:"averageRating"`
		RatingsCount        int      `json:"ratingsCount"`
		MaturityRating      string   `json:"maturityRating"`
		AllowAnonLogging    bool     `json:"allowAnonLogging"`
		ContentVersion      string   `json:"contentVersion"`
		PanelizationSummary struct {
			ContainsEpubBubbles  bool `json:"containsEpubBubbles"`
			ContainsImageBubbles bool `json:"containsImageBubbles"`
		} `json:"panelizationSummary"`
		ImageLinks struct {
			SmallThumbnail string `json:"smallThumbnail"`
			Thumbnail      string `json:"thumbnail"`
		} `json:"imageLinks"`
		Language            string `json:"language"`
		PreviewLink         string `json:"previewLink"`
		InfoLink            string `json:"infoLink"`
		CanonicalVolumeLink string `json:"canonicalVolumeLink"`
	} `json:"volumeInfo,omitempty"`
	SaleInfo struct {
		Country     string `json:"country"`
		Saleability string `json:"saleability"`
		IsEbook     bool   `json:"isEbook"`
		ListPrice   struct {
			Amount       float64 `json:"amount"`
			CurrencyCode string  `json:"currencyCode"`
		} `json:"listPrice"`
		RetailPrice struct {
			Amount       float64 `json:"amount"`
			CurrencyCode string  `json:"currencyCode"`
		} `json:"retailPrice"`
		BuyLink string `json:"buyLink"`
		Offers  []struct {
			FinskyOfferType int `json:"finskyOfferType"`
			ListPrice       struct {
				AmountInMicros int    `json:"amountInMicros"`
				CurrencyCode   string `json:"currencyCode"`
			} `json:"listPrice"`
			RetailPrice struct {
				AmountInMicros int    `json:"amountInMicros"`
				CurrencyCode   string `json:"currencyCode"`
			} `json:"retailPrice"`
			Giftable bool `json:"giftable"`
		} `json:"offers"`
	} `json:"saleInfo,omitempty"`
	AccessInfo struct {
		Country                string `json:"country"`
		Viewability            string `json:"viewability"`
		Embeddable             bool   `json:"embeddable"`
		PublicDomain           bool   `json:"publicDomain"`
		TextToSpeechPermission string `json:"textToSpeechPermission"`
		Epub                   struct {
			IsAvailable  bool   `json:"isAvailable"`
			AcsTokenLink string `json:"acsTokenLink"`
		} `json:"epub"`
		Pdf struct {
			IsAvailable bool `json:"isAvailable"`
		} `json:"pdf"`
		WebReaderLink       string `json:"webReaderLink"`
		AccessViewStatus    string `json:"accessViewStatus"`
		QuoteSharingAllowed bool   `json:"quoteSharingAllowed"`
	} `json:"accessInfo"`
	SearchInfo struct {
		TextSnippet string `json:"textSnippet"`
	} `json:"searchInfo"`
}

func (bk *GoogleBook) IsValid() bool {

	if bk.VolumeInfo.ImageLinks.Thumbnail == "" || bk.VolumeInfo.ImageLinks.SmallThumbnail == "" || bk.VolumeInfo.AverageRating == 0 {
		return false
	}

	return true
}

type OpenLibraryResponse struct {
	NumFound      int  `json:"numFound"`
	Start         int  `json:"start"`
	NumFoundExact bool `json:"numFoundExact"`
	Docs          []struct {
		AuthorName          []string `json:"author_name"`
		CoverI              int      `json:"cover_i"`
		FirstPublishYear    int      `json:"first_publish_year"`
		FirstSentence       []string `json:"first_sentence,omitempty"`
		Key                 string   `json:"key"`
		NumberOfPagesMedian int      `json:"number_of_pages_median"`
		Title               string   `json:"title"`
		Place               []string `json:"place,omitempty"`
		Time                []string `json:"time,omitempty"`
		Person              []string `json:"person,omitempty"`
		RatingsAverage      float64  `json:"ratings_average"`
	} `json:"docs"`
	NumFound0 int    `json:"num_found"`
	Q         string `json:"q"`
	Offset    int    `json:"offset"`
}
