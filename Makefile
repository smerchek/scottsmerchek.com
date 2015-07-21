build:
	jekyll build

push: build
	surge _site/ scottsmerchek.com
