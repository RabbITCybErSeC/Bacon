package transport

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/RabbITCybErSeC/Bacon/server/api"
	"github.com/RabbITCybErSeC/Bacon/server/config"
)

type HTTPTransport struct {
	server     *http.Server
	httpConfig config.HTTPConfig
}

func NewHTTPTransport(httpConfig config.HTTPConfig, apiHandler *api.Handler) *HTTPTransport {
	return &HTTPTransport{
		httpConfig: httpConfig,
		server: &http.Server{
			Addr:    fmt.Sprintf(":%d", httpConfig.Port),
			Handler: apiHandler.GinEngine(),
		},
	}
}

func (t *HTTPTransport) Start() error {
	log.Printf("Starting HTTP transport on port %d", t.httpConfig.Port)
	go func() {
		if err := t.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Printf("HTTP server error: %v", err)
		}
	}()
	return nil
}

func (t *HTTPTransport) Stop() error {
	if t.server != nil {
		return t.server.Shutdown(context.Background())
	}
	return nil
}

func (t *HTTPTransport) Name() string {
	return "http"
}
