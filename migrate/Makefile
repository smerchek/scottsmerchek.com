build:
	bundle exec jekyll build

push: test
	surge _site/ scottsmerchek.com

test: build
	bundle exec htmlproof ./_site \
		--href-ignore https://www.facebook.com/scott.smerchek \
		--href-ignore https://msdn.microsoft.com/en-us/library/cc280372.aspx \
		--disable-external