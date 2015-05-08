require 'sinatra'
require 'memcached'

cache = Memcached.new("localhost:11211")
set :cache, cache

require './app'
run Sinatra::Application