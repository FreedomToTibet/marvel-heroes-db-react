/**
 * HTML Sanitization Utility
 * 
 * Comic Vine API returns description fields containing HTML markup
 * (e.g., <p>, <figure>, <h2>, <ul>, etc.). This utility safely extracts
 * plain text content and optionally truncates it to a specified length.
 * 
 * @param {string} htmlString - HTML-formatted string from Comic Vine API
 * @param {number} [maxLength] - Optional maximum length. If omitted, returns full plain text without truncation.
 * @returns {string} - Plain text, truncated to maxLength on word boundary (if maxLength provided), with "..." if truncated
 * 
 * Features:
 * - Removes <script> and <style> elements to prevent their content from appearing
 * - Extracts plain text using DOMParser
 * - Optionally truncates on word boundaries (not mid-word)
 * - Trims whitespace
 * - Handles null/undefined input safely
 * 
 * Example:
 * ```javascript
 * const html = '<p>Superman is a <strong>superhero</strong>.</p>';
 * const text = stripHtmlTags(html, 20);
 * // Returns: "Superman is a..."
 * 
 * const fullText = stripHtmlTags(html);
 * // Returns: "Superman is a superhero."
 * ```
 */
export const stripHtmlTags = (htmlString, maxLength) => {
	// Handle null, undefined, or empty input
	if (!htmlString || typeof htmlString !== 'string') {
		return '';
	}

	// Parse HTML string using DOMParser
	const doc = new DOMParser().parseFromString(htmlString, 'text/html');
	
	// Remove script and style elements to prevent their content from leaking into plain text
	doc.querySelectorAll('script, style').forEach(el => el.remove());
	
	// Extract plain text content
	const text = doc.body.textContent || '';
	
	// Trim and normalize whitespace
	const trimmed = text.trim().replace(/\s+/g, ' ');

	// If no maxLength specified, return full text
	if (maxLength === undefined || maxLength === null) {
		return trimmed;
	}

	// If text is shorter than maxLength, return as-is
	if (trimmed.length <= maxLength) {
		return trimmed;
	}

	// Truncate to maxLength
	const truncated = trimmed.slice(0, maxLength);
	
	// Cut back to last space to avoid breaking words
	const lastSpaceIndex = truncated.lastIndexOf(' ');
	
	// If there's a space to break on, use it; otherwise use full truncation
	const wordSafe = lastSpaceIndex > 0 ? truncated.slice(0, lastSpaceIndex) : truncated;
	
	return wordSafe + '...';
};

/**
 * Image Validation Utility
 * 
 * Checks if a Comic Vine image URL is valid and not a placeholder.
 * Comic Vine returns 'default_cover' placeholder URLs when no image exists.
 * 
 * @param {string} url - Image URL from Comic Vine API
 * @returns {boolean} - True if valid image, false if placeholder or missing
 * 
 * Example:
 * ```javascript
 * const isValid = isValidImage('https://comicvine.com/default_cover.jpg');
 * // Returns: false
 * 
 * const isValid = isValidImage('https://comicvine.com/uploads/scale_medium/12/123.jpg');
 * // Returns: true
 * ```
 */
export const isValidImage = (url) => {
	return url && !url.includes('default_cover');
};

/**
 * Test cases (for verification):
 * 
 * stripHtmlTags('<p>Short text</p>', 100)
 * // Expected: "Short text"
 * 
 * stripHtmlTags('<p>This is a very long description that needs truncation</p>', 20)
 * // Expected: "This is a very long..." (truncated at word boundary)
 * 
 * stripHtmlTags('<figure><img src="x"/></figure><p>Text after image</p>', 50)
 * // Expected: "Text after image"
 * 
 * stripHtmlTags('<script>alert("bad")</script><p>Safe content</p>', 50)
 * // Expected: "Safe content" (script content removed)
 * 
 * stripHtmlTags(null, 100)
 * // Expected: ""
 * 
 * stripHtmlTags('<p>Word</p>', 3)
 * // Expected: "Word" (shorter than maxLength)
 */
