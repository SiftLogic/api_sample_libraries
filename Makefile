# Example runs that assume you are on a unix machine and you have a specific folder layout and login details.
.PHONY: run-node run-php

run-node:
	./node/main.js -f /opt/api_sample_libraries/test_data.csv -l "${HOME}/Desktop/" -k TestKey -p e261742d-fe2f-4569-95e6-312689d04903 --poll 2

run-php:
	./php/main.php -f /opt/api_sample_libraries/test_data.csv -l "${HOME}/Desktop/" -k TestKey -p e261742d-fe2f-4569-95e6-312689d04903 --poll 2

# Standard zip that defines how files are loaded
.PHONY: zip-node zip-php zip-all

zip-node:
	zip -r node . -i node/\*.js -i node/README.md -i node/package.json && zip -r node -d node/node_modules/\*

zip-php:
	zip -r php.zip ./test_data.csv ./php -x "php/vendor/*"

zip-all: zip-node zip-php