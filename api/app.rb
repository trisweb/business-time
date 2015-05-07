require 'sinatra'
require 'net/http'
require './config'

# Time to cache in seconds (a maximum of one request per POLL_TIME will be made
# to the upstream server)
POLL_TIME = 1

class Cache
	@@cache = {}

	def self.put(k, v)
		#puts "Cache.put(#{k}, #{v})"
		@@cache[k] = v
	end

	def self.get(k)
		#puts "Cache.get(#{k}) => #{@@cache[k]}"
		@@cache[k]
	end
end

get "/api" do
	content_type :json
	response = nil
	# If a cached key exists and it's less than POLL_TIME ms old, use it
	response_updated_at = Cache.get('response_updated_at') || 0
	response_valid = Time.now.to_f - response_updated_at <= POLL_TIME
	if response_valid || Cache.get('request_in_progress')
		response = Cache.get 'response'
	else
		Cache.put 'request_in_progress', true
	    uri = URI(BusinessTimeConfig.api_endpoint + "&callback=" + params['callback'].to_s)
	    content_type 'application/json', :charset => 'utf-8'
	    response = Net::HTTP.get(uri)
	    Cache.put 'response', response
	    Cache.put 'response_updated_at', Time.now.to_f
	    Cache.put 'request_in_progress', false
	end
	response
end