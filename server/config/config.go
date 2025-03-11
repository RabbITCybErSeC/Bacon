package config

import (
	"flag"
	"log"

	"github.com/RabbITCybErSeC/Bacon/server/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type ServerConfig struct {
	DB         *gorm.DB
	Port       string
	Env        string
	DBPath     string
	MaxAgents  int
	HTTPConfig HTTPConfig
	UDPConfig  UDPConfig
}

type HTTPConfig struct {
	Port    int
	Enabled bool
}

type UDPConfig struct {
	Port    int
	Enabled bool
}

func NewServerConfig() *ServerConfig {
	httpPort := flag.Int("http-port", 8080, "HTTP server port")
	udpPort := flag.Int("udp-port", 8081, "UDP server port")
	enableUDP := flag.Bool("enable-udp", false, "Enable UDP transport")
	flag.Parse()

	config := &ServerConfig{
		Port:      ":8080", // Default port for HTTP server
		Env:       "development",
		DBPath:    "agents.db",
		MaxAgents: 100,
		HTTPConfig: HTTPConfig{
			Port:    *httpPort,
			Enabled: true, // Always enable HTTP for admin interface
		},
		UDPConfig: UDPConfig{
			Port:    *udpPort,
			Enabled: *enableUDP,
		},
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
