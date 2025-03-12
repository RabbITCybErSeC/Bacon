package main

import (
	"log"

	"github.com/RabbITCybErSeC/Bacon/server/api"
	"github.com/RabbITCybErSeC/Bacon/server/config"
	"github.com/RabbITCybErSeC/Bacon/server/db"
	"github.com/RabbITCybErSeC/Bacon/server/queue"
	"github.com/RabbITCybErSeC/Bacon/server/service"
	"github.com/RabbITCybErSeC/Bacon/server/store"
	"github.com/RabbITCybErSeC/Bacon/server/transport"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.NewServerConfig()

	agentRepo := db.NewAgentRepository(cfg.DB)
	agentStore := store.NewAgentStore(agentRepo)
	commandQueue := queue.NewMemoryCommandQueue()

	gin.SetMode(gin.ReleaseMode) // Set to release mode for production
	apiHandler := api.NewHandler(agentStore, commandQueue)

	server := service.NewServer(agentStore, commandQueue, cfg)

	if cfg.HTTPConfig.Enabled {
		httpTransport := transport.NewHTTPTransport(cfg.HTTPConfig, apiHandler)
		server.AddTransport(httpTransport)
	}
	// if cfg.UDPConfig.Enabled {
	// 	udpTransport := transport.NewUDPTransport(cfg.UDPConfig)
	// 	server.AddTransport(udpTransport)
	// }

	if err := server.Start(); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}

	log.Println("Server running. Press Ctrl+C to stop.")
	select {} // Block forever
}
