// config/config.go
package config

import (
	"log"

	"github.com/RabbITCybErSeC/Becon/server/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type ServerConfig struct {
	DB        *gorm.DB
	Port      string
	Env       string
	DBPath    string
	MaxAgents int
}

func NewServerConfig() *ServerConfig {
	config := &ServerConfig{
		Port:      ":8080",
		Env:       "development",
		DBPath:    "agents.db",
		MaxAgents: 100,
	}

	db, err := initializeDatabase(config.DBPath)
	if err != nil {
		log.Fatal("Failed to initialize database: ", err)
	}
	config.DB = db

	return config
}

func initializeDatabase(dbPath string) (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	err = runMigrations(db)
	if err != nil {
		return nil, err
	}

	return db, nil
}

func runMigrations(db *gorm.DB) error {
	err := db.AutoMigrate(&models.Agent{})
	if err != nil {
		return err
	}
	return nil
}

func (c *ServerConfig) Close() error {
	sqlDB, err := c.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
