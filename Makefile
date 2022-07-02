default:
	@echo 'this make fiile has cli utilities'

docker-dev:
	docker compose -f ./docker-compose-dev.yml up -d

docker-dev-down:
	docker compose -f ./docker-compose-dev.yml down

npm-run-dev:
	npm run dev-server-docker   

npm-collect-once:
	npm run collect-once

npm-collect-one:
	npm run collect-one