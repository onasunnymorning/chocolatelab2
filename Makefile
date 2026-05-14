.PHONY: dev stop help

## dev: Start the Next.js development server
dev:
	npm run dev

## stop: (no-op — no background services)
stop:
	@echo "Nothing to stop."

## help: Show available targets
help:
	@grep -E '^## ' Makefile | sed 's/## //' | column -t -s ':'
