# Example runs that assume you are on a unix machine and you have a specific folder layout and login details.
.PHONY: test-node
test-node:
	./node/main.js -f /opt/api_sample_libraries/test_data.csv -l "${HOME}/Desktop/" -k TestKey -p e261742d-fe2f-4569-95e6-312689d04903 --poll 2

test-php:
	./php/main.php -f /opt/api_sample_libraries/test_data.csv -l "${HOME}/Desktop/" -k TestKey -p e261742d-fe2f-4569-95e6-312689d04903 --poll 2