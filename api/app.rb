require 'sinatra'
require 'net/http'
require 'memcached'
require './config'

# Time to cache in seconds (a maximum of one request per POLL_TIME will be made
# to the upstream server)
POLL_TIME = 1

class Cache
	@@cache = {}

	def self.set(k, v)
		#puts "Cache.set(#{k}, #{v})"
		@@cache[k] = v
	end

	def self.get(k)
		#puts "Cache.get(#{k}) => #{@@cache[k]}"
		@@cache[k]
	end
end

get "/" do
	# cache = Cache
	cache = Memcached.new("localhost:11211")
	content_type :json
	result = nil
	# If a cached key exists and it's less than POLL_TIME ms old, use it
	response_updated_at = cache.get('response_updated_at') || 0
	response_valid = Time.now.to_f - response_updated_at <= POLL_TIME
	if response_valid || cache.get('request_in_progress')
		response.headers[:CachedResponse] = "true"
		result = cache.get 'response'
	else
		cache.set 'request_in_progress', true
	    uri = URI(BusinessTimeConfig.api_endpoint + "&callback=")
	    content_type 'application/json', :charset => 'utf-8'
	    result = Net::HTTP.get(uri)
	    cache.set 'response', response
	    cache.set 'response_updated_at', Time.now.to_f
	    cache.set 'request_in_progress', false
	end
	# Prepend the requested callback (Angular rotates it)
	if callback = params['callback'].to_s
		result = callback + result
	end
	result
end