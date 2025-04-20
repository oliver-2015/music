source "https://rubygems.org"

gem "jekyll", "~> 3.9.3"
gem "webrick", "~> 1.8"
gem "kramdown-parser-gfm"

# 添加 three.js 支持
gem 'jekyll-assets'
gem 'sprockets', '~> 3.7'

group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.12"
  gem "jekyll-seo-tag", "~> 2.8"
end

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library.
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end 