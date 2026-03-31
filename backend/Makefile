.PHONY: setup ingest run-api

setup:
	python -m venv .venv
	.venv/Scripts/python -m pip install --upgrade pip
	.venv/Scripts/python -m pip install -e .

ingest:
	.venv/Scripts/python src/pipelines/ingest.py

run-api:
	.venv/Scripts/uvicorn src.entrypoint.api:app --reload
