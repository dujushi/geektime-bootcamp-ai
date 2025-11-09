# Makefile for AI Bootcamp Presentations
# Provides convenient access to the presentations app

.PHONY: help install dev build preview clean status

# Default target - show help
help:
	@echo "════════════════════════════════════════════════════════════"
	@echo "  AI Bootcamp - Presentations Management"
	@echo "════════════════════════════════════════════════════════════"
	@echo ""
	@echo "Available targets:"
	@echo ""
	@echo "  make install    - Install dependencies"
	@echo "  make dev        - Start development server (http://localhost:3000)"
	@echo "  make build      - Build for production"
	@echo "  make preview    - Preview production build"
	@echo "  make clean      - Clean build artifacts and dependencies"
	@echo "  make status     - Show project status"
	@echo "  make help       - Show this help message"
	@echo ""
	@echo "════════════════════════════════════════════════════════════"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	@cd presentations && yarn
	@echo "✅ Dependencies installed successfully!"

# Start development server
dev:
	@echo "🚀 Starting development server..."
	@echo "📍 Opening http://localhost:3000"
	@cd presentations && yarn dev

# Build for production
build:
	@echo "🔨 Building for production..."
	@cd presentations && yarn build
	@echo "✅ Build completed! Output in presentations/dist/"

# Preview production build
preview:
	@echo "👀 Starting preview server..."
		@cd presentations && yarn preview

# Clean build artifacts and node_modules
clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf presentations/dist
	@rm -rf presentations/node_modules
	@echo "✅ Cleaned successfully!"

# Show project status
status:
	@echo "════════════════════════════════════════════════════════════"
	@echo "  Project Status"
	@echo "════════════════════════════════════════════════════════════"
	@echo ""
	@echo "📂 Project Directory: presentations/"
	@echo ""
	@if [ -d "presentations/node_modules" ]; then \
		echo "✅ Dependencies: Installed"; \
	else \
		echo "❌ Dependencies: Not installed (run 'make install')"; \
	fi
	@echo ""
	@if [ -d "presentations/dist" ]; then \
		echo "✅ Build: Exists"; \
	else \
		echo "ℹ️  Build: Not built yet"; \
	fi
	@echo ""
	@echo "📝 Available Presentations:"
	@find presentations/src/presentations -name "*.mdx" 2>/dev/null | sed 's/.*\//  - /' || echo "  No presentations found"
	@echo ""
	@echo "════════════════════════════════════════════════════════════"

# Quick start (install + dev)
start: install dev

# Rebuild (clean + install + build)
rebuild: clean install build
