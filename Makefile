install:
	npm install

build:
	npm run build

test:
	npx playwright test

start:
	npx frontend-flight-booking-server start -s dist
