build:
	jekyll build

push: test
	surge _site/ scottsmerchek.com

test: build
	bundle exec htmlproof ./_site --href-ignore https://www.facebook.com/scott.smerchek