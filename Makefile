build:
	jekyll build

push:
	surge _site/ scottsmerchek.com
