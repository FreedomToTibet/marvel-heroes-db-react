/**
 * COMIC VINE API SERVICE
 * 
 * CRITICAL NOTES:
 * 
 * 1. RESOURCE PREFIXES:
 *    - Required in direct URL calls: /character/4005-{id}/
 *    - NOT used in filter parameters: filter=id:12345
 * 
 * 2. ERROR HANDLING:
 *    - Comic Vine returns HTTP 200 even on errors
 *    - Always check response.status_code field
 *    - Use checkComicVineResponse() utility for all responses
 * 
 * 3. IMAGE STRUCTURE:
 *    - Response contains image object with multiple sizes
 *    - Use .medium_url for lists, .super_url for detail views
 * 
 * 4. REQUEST FLOW:
 *    - fetch(url) → response.json() → checkComicVineResponse(json) → return data
 */

import { useHttp } from '../hooks/http-hook';
import { checkComicVineResponse } from '../utils/comicvine-errors';
import { stripHtmlTags, isValidImage } from '../utils/html-utils';

// Cache version for API migration - invalidates old Marvel API cache
const CACHE_VERSION = 'cv_v1';

// SessionStorage cache keys used by this service
const CACHE_KEYS = [
  'storageCharList',
  'storageCharOffset',
  'storageComicsList',
  'storageComicsOffset',
  'lastSelectedCharIndex',
  'scrollCharPosition',
  'scrollComicPosition'
];

// Flag to ensure cache validation runs only once per app session
let cacheValidated = false;

/**
 * Validates cache version and clears old Marvel API cache if needed.
 * This function runs once on first service initialization to ensure
 * old Marvel-structured cache doesn't break the migrated Comic Vine app.
 */
const validateAndClearOldCache = () => {
  const storedVersion = sessionStorage.getItem('apiCacheVersion');
  
  if (storedVersion !== CACHE_VERSION) {
    // Clear all API-related cache keys
    CACHE_KEYS.forEach(key => sessionStorage.removeItem(key));
    
    // Set new cache version
    sessionStorage.setItem('apiCacheVersion', CACHE_VERSION);
    
    console.log(`Cache cleared: migrated from ${storedVersion || 'Marvel API'} to ${CACHE_VERSION}`);
  }
};

const useComicVineService = () => {
  // Validate and clear old cache once on first initialization
  if (!cacheValidated) {
    validateAndClearOldCache();
    cacheValidated = true;
  }

  const { request, clearError, process, setProcess } = useHttp();

  // Use proxy to avoid CORS issues - setupProxy.js routes /api/vine to Comic Vine API
  const _apiBase = '/api/vine/';
  const _apiKey = window._env_?.REACT_APP_COMICVINE_API_KEY;

  /**
   * Returns authentication parameters as an object for URLSearchParams.
   * Comic Vine uses simple API key authentication (no MD5 hashing required).
   */
  const _getAuthParams = () => ({
    api_key: _apiKey,
    format: 'json'
  });

  /**
   * Get paginated list of characters.
   * Includes explicit sort to ensure stable pagination (prevents duplicates across pages).
   * @param {number} offset - Starting offset for pagination (default: 0)
   * @returns {Promise<Object>} Object with results array and total count: {results: Array, total: number}
   */
  const getAllCharacters = async (offset = 0) => {
    const params = new URLSearchParams({
      ..._getAuthParams(),
      limit: 9,
      offset: offset,
      sort: 'name:asc',
      field_list: 'id,name,image,deck'
    });
    const url = `${_apiBase}characters/?${params.toString()}`;
    
    const json = await request(url);
    const data = checkComicVineResponse(json);
    
    // Return both results and total for pagination
    return {
      results: data.map(_transformCharacter),
      total: json.number_of_total_results || 0
    };
  };

  /**
   * Search for character by exact name match.
   * Uses Comic Vine's /search endpoint with character resource filter.
   * @param {string} name - Character name to search for
   * @returns {Promise<Object>} Object with results array and total count: {results: Array, total: number}
   */
  const getCharacterByName = async (name) => {
    const params = new URLSearchParams({
      ..._getAuthParams(),
      query: name,
      resources: 'character',
      field_list: 'id,name,deck,image'
    });
    const url = `${_apiBase}search/?${params.toString()}`;
    
    const json = await request(url);
    const total = json.number_of_total_results || 0;
    const results = checkComicVineResponse(json);
    
    return {
      results: results.map(_transformCharacter),
      total
    };
  };

  /**
   * Autocomplete search for characters by name prefix.
   * Uses /search endpoint with max 10 results for dropdown suggestions.
   * Component should enforce: minimum 2 characters, 300ms debounce.
   * @param {string} prefix - Character name prefix (minimum 2 characters)
   * @returns {Promise<Object>} Object with results array and total count: {results: Array, total: number}
   */
  const getCharacterbyNameInput = async (prefix) => {
    const params = new URLSearchParams({
      ..._getAuthParams(),
      query: prefix,
      resources: 'character',
      limit: 10, // Comic Vine /search max limit is 10
      field_list: 'id,name,image'
    });
    const url = `${_apiBase}search/?${params.toString()}`;
    
    const json = await request(url);
    const total = json.number_of_total_results || 0;
    const results = checkComicVineResponse(json);
    
    return {
      results: results.map(_transformCharacter),
      total
    };
  };

  /**
   * Get single character by ID with full details.
   * Comic Vine detail endpoint returns results as an OBJECT (not array).
   * @param {number} id - Character ID (without prefix)
   * @returns {Promise<Object>} Transformed character object
   */
  const getCharacter = async (id) => {
    // Comic Vine requires 4005- prefix for characters in URL path
    const params = new URLSearchParams({
      ..._getAuthParams(),
      field_list: 'id,name,deck,description,image,issue_credits,powers'
    });
    const url = `${_apiBase}character/4005-${id}/?${params.toString()}`;
    
    const json = await request(url);
    // For detail endpoints, checkComicVineResponse returns results object directly (not array)
    const data = checkComicVineResponse(json);
    const transformed = _transformCharacterDetail(data);
    
    // Verification logging for Step 8
    console.log('🔍 getCharacter verification:', {
      characterId: id,
      descriptionType: typeof transformed.description,
      descriptionSample: transformed.description.substring(0, 100) + '...',
      hasHtmlTags: /<[^>]*>/.test(transformed.description),
      powersType: Array.isArray(transformed.powers) ? 'array' : typeof transformed.powers,
      powersCount: transformed.powers.length,
      powersSample: transformed.powers.slice(0, 3),
      allPowersAreStrings: transformed.powers.every(p => typeof p === 'string'),
      comicsCount: transformed.comics.length,
      comicsSample: transformed.comics.slice(0, 2)
    });
    
    return transformed;
  };

  /**
   * Get a random character for display.
   * Uses random offset approach (single request) instead of querying total count first.
   * This is faster and more reliable than two sequential requests.
   * @returns {Promise<Object>} Transformed character object with full details
   */
  const getRandomCharacter = async () => {
    // Random offset from ~50k characters; single request is faster than checking total first
    const randomOffset = Math.floor(Math.random() * 50000);
    const params = new URLSearchParams({
      ..._getAuthParams(),
      limit: 1,
      offset: randomOffset,
      field_list: 'id,name,deck,description,image,issue_credits,powers'
    });
    const url = `${_apiBase}characters/?${params.toString()}`;
    
    const json = await request(url);
    const data = checkComicVineResponse(json);
    
    // Handle case where offset exceeds total (max one retry with lower offset cap)
    if (!data || data.length === 0) {
      // Retry with offset 0-10000 range as fallback to avoid infinite loops
      const fallbackOffset = Math.floor(Math.random() * 10000);
      const fallbackParams = new URLSearchParams({
        ..._getAuthParams(),
        limit: 1,
        offset: fallbackOffset,
        field_list: 'id,name,deck,description,image,issue_credits,powers'
      });
      const retryUrl = `${_apiBase}characters/?${fallbackParams.toString()}`;
      const retryRes = await request(retryUrl);
      const retryData = checkComicVineResponse(retryRes);
      
      // If retry also fails, throw error and let UI handle it
      if (!retryData || retryData.length === 0) {
        throw new Error('Could not load random character');
      }
      
      return _transformCharacterDetail(retryData[0]);
    }
    
    return _transformCharacterDetail(data[0]);
  };

  /**
   * Get paginated list of issues (Comic Vine's equivalent of Marvel's comics).
   * @param {number} offset - Starting offset for pagination (default: 0)
   * @returns {Promise<Object>} Object with results array and total count: {results: Array, total: number}
   */
  const getAllComics = async (offset = 0) => {
    const params = new URLSearchParams({
      ..._getAuthParams(),
      limit: 8,
      offset: offset,
      sort: 'cover_date:desc',
      field_list: 'id,name,image,deck,issue_number,volume'
    });
    const url = `${_apiBase}issues/?${params.toString()}`;
    
    const json = await request(url);
    const total = json.number_of_total_results || 0;
    const results = checkComicVineResponse(json);
    
    return {
      results: results.map(_transformIssue),
      total
    };
  };

  /**
   * Get single issue by ID with full details.
   * Comic Vine detail endpoint returns results as an OBJECT (not array).
   * @param {number} id - Issue ID (without prefix)
   * @returns {Promise<Object>} Transformed issue object
   */
  const getComic = async (id) => {
    // Comic Vine requires 4000- prefix for issues in URL path
    const params = new URLSearchParams({
      ..._getAuthParams(),
      field_list: 'id,name,deck,description,image,issue_number,cover_date,store_date,volume'
    });
    const url = `${_apiBase}issue/4000-${id}/?${params.toString()}`;
    
    const json = await request(url);
    const data = checkComicVineResponse(json);
    return _transformIssueDetail(data);
  };

  /**
   * Transform Comic Vine character data for LIST endpoints.
   * Used by: getAllCharacters, getCharacterByName, getCharacterbyNameInput
   * 
   * List endpoints return limited fields:
   * - Uses 'deck' for description (already plain text, no HTML stripping needed)
   * - No comics/issue_credits field in list response
   * - No powers field in list response
   */
  const _transformCharacter = (char) => {
    // Check for valid images, excluding Comic Vine's default_cover placeholders
    const thumbnail = isValidImage(char.image?.medium_url)
      ? char.image.medium_url
      : isValidImage(char.image?.small_url)
        ? char.image.small_url
        : '/placeholder.jpg';

    return {
      id: char.id,
      name: char.name,
      // Comic Vine uses 'deck' for brief summary (plain text, no HTML)
      description: char.deck || 'Character has no description',
      thumbnail
    };
  };

  /**
   * Transform Comic Vine character data for DETAIL endpoint.
   * Used by: getCharacter
   * 
   * Detail endpoint returns full fields:
   * - Uses 'description' (HTML content) with fallback to 'deck'
   * - Includes issue_credits array (deduplicated by ID)
   * - Includes powers array
   */
  const _transformCharacterDetail = (char) => {
    // Deduplicate comics by ID - Comic Vine can return duplicate issue_credits
    const uniqueComics = [];
    const seenIds = new Set();
    
    (char.issue_credits || []).forEach(issue => {
      if (issue.id && !seenIds.has(issue.id)) {
        seenIds.add(issue.id);
        uniqueComics.push({
          resourceURI: issue.api_detail_url || '',
          name: issue.name || 'Unknown Issue',
          id: issue.id
        });
      }
    });

    // Check for valid images, excluding Comic Vine's default_cover placeholders
    const fullSizeImage = isValidImage(char.image?.super_url)
      ? char.image.super_url
      : isValidImage(char.image?.medium_url)
        ? char.image.medium_url
        : null;

    const thumbnail = isValidImage(char.image?.medium_url)
      ? char.image.medium_url
      : isValidImage(char.image?.small_url)
        ? char.image.small_url
        : '/placeholder.jpg';

    return {
      id: char.id,
      name: char.name,
      // Comic Vine 'description' contains HTML, needs stripping; fallback to 'deck' (plain text)
      description: stripHtmlTags(char.description, 400) || char.deck || 'Character has no description',
      thumbnail,
      fullSizeImage,
      // Use deduplicated comics array
      comics: uniqueComics,
      // NEW FEATURE: Comic Vine provides character powers (Marvel didn't have this)
      // Extract and deduplicate power names for display
      powers: [...new Set(char.powers?.map(p => p.name) || [])]
    };
  };

  /**
   * Transform Comic Vine issue data for LIST endpoints.
   * Used by: getAllComics
   * 
   * List endpoints return limited fields:
   * - Uses 'deck' for description (already plain text, no HTML stripping needed)
   * - Basic thumbnail (medium_url)
   */
  const _transformIssue = (issue) => {
    // Check for valid images, excluding Comic Vine's default_cover placeholders
    const thumbnail = isValidImage(issue.image?.medium_url)
      ? issue.image.medium_url
      : isValidImage(issue.image?.small_url)
        ? issue.image.small_url
        : '/placeholder.jpg';

    return {
      id: issue.id,
      title: issue.name || 'Untitled Issue',
      // Comic Vine uses 'deck' for brief summary (plain text, no HTML)
      description: issue.deck || 'No description available',
      thumbnail,
      issueNumber: issue.issue_number || 'N/A',
      volume: issue.volume?.name || 'Unknown Series'
    };
  };

  /**
   * Transform Comic Vine issue data for DETAIL endpoint.
   * Used by: getComic
   * 
   * Detail endpoint returns full fields:
   * - Uses 'description' (HTML content) with fallback to 'deck' - NO TRUNCATION for detail view
   * - Higher quality thumbnail (super_url)
   * - Includes cover_date and store_date
   */
  const _transformIssueDetail = (issue) => {
    // Check for valid images, excluding Comic Vine's default_cover placeholders
    const fullSizeImage = isValidImage(issue.image?.super_url)
      ? issue.image.super_url
      : isValidImage(issue.image?.medium_url)
        ? issue.image.medium_url
        : null;

    const thumbnail = isValidImage(issue.image?.super_url)
      ? issue.image.super_url
      : isValidImage(issue.image?.medium_url)
        ? issue.image.medium_url
        : isValidImage(issue.image?.small_url)
          ? issue.image.small_url
          : '/placeholder.jpg';

    return {
      id: issue.id,
      title: issue.name || 'Untitled Issue',
      // Comic Vine 'description' contains HTML, needs stripping; fallback to 'deck' (plain text)
      // Detail view gets full description without truncation
      description: stripHtmlTags(issue.description) || issue.deck || 'No description available',
      thumbnail,
      fullSizeImage,
      issueNumber: issue.issue_number || 'N/A',
      volume: issue.volume?.name || 'Unknown Series',
      coverDate: issue.cover_date || 'Unknown',
      storeDate: issue.store_date || null
    };
  };

  return {
    clearError,
    process,
    setProcess,
    getAllCharacters,
    getCharacterByName,
    getCharacterbyNameInput,
    getCharacter,
    getRandomCharacter,
    getAllComics,
    getComic,
  };
};

export default useComicVineService;
