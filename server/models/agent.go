package models

import (
	"sync"
	"time"
)

type Command struct {
	ID      string `json:"id"`
	Command string `json:"command"`
	Status  string `json:"status"`
	Output  string `json:"output,omitempty"`
}

type Agent struct {
	ID        string    `json:"id"`
	Hostname  string    `json:"hostname"`
	IP        string    `json:"ip"`
	LastSeen  time.Time `json:"lastSeen"`
	OS        string    `json:"os"`
	IsActive  bool      `json:"isActive"`
	Protocol  string    `json:"protocol"`
	Commands  []Command `json:"-"`
	CommandMu sync.Mutex
}
