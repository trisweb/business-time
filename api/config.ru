require './app'

cache = Memcached.new("localhost:11211")
set :cache, cache

run Sinatra::Application