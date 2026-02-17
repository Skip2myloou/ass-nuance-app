PYTHON ?= python3
VENV   := .venv
BIN    := $(VENV)/bin

.PHONY: install dev test

install:
	$(PYTHON) -m venv $(VENV)
	$(BIN)/pip install --upgrade pip
	$(BIN)/pip install -r requirements.txt
	@echo "\n✓ Installed. Now copy .env.example → .env and add your ANTHROPIC_API_KEY."

dev:
	$(BIN)/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

test:
	$(BIN)/pytest tests/ -v
