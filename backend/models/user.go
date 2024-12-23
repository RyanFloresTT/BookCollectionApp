package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Auth0ID string `json:"auth0Id" gorm:"uniqueIndex;not null"`
	Email   string `json:"email" gorm:"uniqueIndex;not null"`
	Books   []Book `json:"books" gorm:"foreignKey:UserID"`
}
