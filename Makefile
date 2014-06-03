# Example runs that assume you are on a unix machine and you have a specific folder layout and login details.
.PHONY: run-node run-php

# dotnet e.g.: dotnet\CSharpFTPExample\bin\Release\CSharpFTPExample.exe -f test.csv -l C:\Users\aUser\Desktop -u aUsername -p af314cdd-ec92-4bb1-86ba-33e5536bda6f --poll 10

run-node:
	./node/main.js -f test.csv -l "${HOME}/Desktop/" -u aUsername -p af314cdd-ec92-4bb1-86ba-33e5536bda6f --poll 10

run-php:
	./php/main.php -f test.csv -l "${HOME}/Desktop/" -u aUsername -p de301572-3e27-42bc-a6df-02b4ba5ec89c --poll 10

# Standard zip that defines how files are loaded
.PHONY: zip-node zip-php zip-all

zip-dotnet:
	# Since we are running this on Linux we don't need to worry about temporary files that Visual Studio could add
	zip -r dotnet dotnet -x "dotnet/.gitignore"

zip-node:
	zip -r node . -i node/\*.js -i node/README.md -i node/package.json -x node/node_modules/\*

zip-php:
	zip -r php.zip ./test_data.csv ./php -x "php/vendor/*" -x "php/composer.phar"

zip-all: zip-node zip-php zip-dotnet
