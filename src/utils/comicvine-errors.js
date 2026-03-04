/**
 * Comic Vine API Error Handling Utility
 * 
 * IMPORTANT: Comic Vine API returns HTTP 200 even on errors.
 * The actual status is indicated by the status_code field in the response body.
 * 
 * This utility function checks the status_code and either returns the results
 * data or throws an appropriate error.
 * 
 * @param {Object} response - Already-parsed JSON response object from Comic Vine API
 *                            (NOT a raw fetch Response object - parse with .json() first)
 * @returns {Array|Object} - The response.results field on success (status_code: 1)
 * @throws {Error} - Throws error with descriptive message on any non-success status code
 * 
 * Status Code Reference:
 * - 1:   OK (success)
 * - 100: Invalid API Key
 * - 101: Object Not Found
 * - 102: Error in URL Format
 * - 103: 'jsonp' format requires a 'json_callback' argument
 * - 104: Filter Error
 * - 105: Subscriber only video is for subscribers only
 * - 107: Object Not Found (alternate code)
 * 
 * Usage in service:
 * ```javascript
 * const response = await fetch(url);
 * const data = await response.json();
 * const results = checkComicVineResponse(data); // Returns data.results directly
 * ```
 */
export const checkComicVineResponse = (response) => {
	// Validate response structure
	if (!response || typeof response !== 'object') {
		throw new Error('Invalid response: expected Comic Vine JSON object');
	}

	const { status_code, error, results } = response;

	// Check status_code field (NOT HTTP status - Comic Vine always returns 200)
	switch (status_code) {
		case 1:
			// Success - return results directly for clean service method code
			return results;

		case 100:
			throw new Error('Invalid API Key - Please check your Comic Vine API credentials');

		case 101:
		case 107:
			throw new Error('Resource Not Found - The requested character, issue, or resource does not exist');

		case 102:
			throw new Error('Invalid URL Format - Check the API endpoint structure');

		case 103:
			throw new Error('JSONP format requires a json_callback argument');

		case 104:
			throw new Error('Filter Error - Invalid filter parameters in request');

		case 105:
			throw new Error('Subscriber Only Content - This resource requires a subscription');

		default:
			// Fallback for unknown status codes
			throw new Error(
				`Comic Vine API Error (status_code: ${status_code})${error ? ': ' + error : ''}`
			);
	}
};
