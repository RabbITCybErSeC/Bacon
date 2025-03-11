package transport

type TransportProtocol interface {
	Start() error
	Stop() error
	Name() string
}
