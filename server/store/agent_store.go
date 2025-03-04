package store

import (
	"github.com/RabbITCybErSeC/Becon/server/models"
)

type AgentStore interface {
	Register(agent *models.Agent) error
	Get(id string) (*models.Agent, bool)
	List() []*models.Agent
	UpdateLastSeen(id string) error
	UpdateAgentCommands(id string, cmd models.Command) error
}
