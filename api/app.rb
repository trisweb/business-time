require 'net/http'
require './config'

# Time to cache in seconds (a maximum of one request per POLL_TIME will be made
# to the upstream server)
POLL_TIME = 2

# Expire the in-progress request after this many seconds, in case something goes wrong
EXPIRE_TIME = 120

get "/" do
	# cache = Cache
	cache = settings.cache
	result = nil
	# If a cached key exists and it's less than POLL_TIME ms old, use it
	result_updated_at = cache.get('result_updated_at') rescue 0
	request_in_progress = cache.get('request_in_progress') rescue false
	result_valid = Time.now.to_f - result_updated_at <= POLL_TIME
	request_valid = Time.now.to_f - result_updated_at <= EXPIRE_TIME

	if result_valid || (request_in_progress && request_valid)
		response.headers['Cached-Response'] = "true"
		result = cache.get 'result' rescue nil
	else
		cache.set 'request_in_progress', true
		puts "=== Requesting from external API ==="
		begin
			uri = URI(BusinessTimeConfig.api_endpoint + "&callback=")
			content_type 'application/json', :charset => 'utf-8'
			result = Net::HTTP.get(uri)
			cache.set 'result', result.to_s
			cache.set 'result_updated_at', Time.now.to_f
		rescue StandardError => e
			puts "An error occurred while trying to contact the API"
		ensure
			cache.set 'request_in_progress', false
		end
	end
	if !params['callback'].nil?
		# Prepend the requested callback for JSONP (Angular rotates it, so we can't cache)
		result = params['callback'].to_s + result
		content_type 'application/javascript'
	else
		# If no callback is specified, return straight up JSON
		result = result[1..-2]
		content_type 'application/json'
	end
	result
end