GO = go
BINARY_NAME = bacon-server
SRC_DIR = ./server
BIN_DIR = ./bin

LDFLAGS = -s -w
TAGS = go_sqlite,server
BUILD_FLAGS = -trimpath -tags "$(TAGS)" -ldflags "$(LDFLAGS)"

.PHONY: all clean compile-servers

all: compile-servers

$(BIN_DIR):
	@mkdir -p $(BIN_DIR)

compile-servers: $(BIN_DIR)
	@echo "Building server for darwin/arm64..."
	@cd $(SRC_DIR) && GOOS=darwin GOARCH=arm64 CGO_ENABLED=0 $(GO) build $(BUILD_FLAGS) -o ../$(BIN_DIR)/$(BINARY_NAME)_darwin-arm64
	@echo "Build completed."

clean:
	@echo "Cleaning up..."
	@rm -rf $(BIN_DIR)
	@echo "Clean completed."

