package main

import (
	"github.com/RabbITCybErSeC/Becon/server/models"
	"gorm.io/gorm"
)

type AgentRepository struct {
	db *gorm.DB
}

type AgentRepositoryInterface interface {
	Save(agent *models.Agent) error
	Get(id string) (*models.Agent, error)
}

func NewAgentRepository(db *gorm.DB) *AgentRepository {
	return &AgentRepository{db: db}
}

func (r *AgentRepository) Save(agent *models.Agent) error {
	return r.db.Save(agent).Error
}

func (r *AgentRepository) Get(id string) (*models.Agent, error) {
	var agent models.Agent
	err := r.db.First(&agent, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &agent, nil
}
