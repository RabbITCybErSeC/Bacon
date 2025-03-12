package service

import (
	"log"

	"github.com/RabbITCybErSeC/Bacon/server/config"
	"github.com/RabbITCybErSeC/Bacon/server/queue"
	"github.com/RabbITCybErSeC/Bacon/server/store"
	"github.com/RabbITCybErSeC/Bacon/server/transport"
)

type Server struct {
	agentStore   store.AgentStore
	commandQueue queue.CommandQueue
	protocols    map[string]transport.TransportProtocol
	config       *config.ServerConfig
}

func NewServer(agentStore store.AgentStore, commandQueue queue.CommandQueue, config *config.ServerConfig) *Server {
	return &Server{
		agentStore:   agentStore,
		commandQueue: commandQueue,
		protocols:    make(map[string]transport.TransportProtocol),
		config:       config,
	}
}

func (s *Server) AddTransport(tp transport.TransportProtocol) {
	s.protocols[tp.Name()] = tp
}

func (s *Server) Start() error {
	for name, protocol := range s.protocols {
		log.Printf("Starting %s transport", name)
		if err := protocol.Start(); err != nil {
			return err
		}
	}
	return nil
}

func (s *Server) Stop() {
	for name, protocol := range s.protocols {
		log.Printf("Stopping %s transport", name)
		if err := protocol.Stop(); err != nil {
			log.Printf("Error stopping %s transport: %v", name, err)
		}
	}

	if err := s.config.Close(); err != nil {
		log.Printf("Error closing database connection: %v", err)
	}
}
