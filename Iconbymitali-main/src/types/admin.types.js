/**
 * TypeScript type definitions for Icon by Mitali Admin
 * Production-grade types with JSDoc comments for autocomplete in JS/JSX
 */

/**
 * @typedef {Object} Collection
 * @property {number} id - Collection ID (Primary Key)
 * @property {string} name - Collection name (Unique)
 * @property {string} [description] - Collection description
 * @property {string} [image_url] - Collection image URL
 * @property {number} [display_order] - Display order for sorting
 * @property {boolean} [is_active] - Whether collection is active
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} Product
 * @property {number} id - Product ID (Primary Key)
 * @property {string} name - Product name
 * @property {string} [description] - Product description
 * @property {number} price - Current selling price (₹)
 * @property {number} [original_price] - Original/MRP price for strikethrough display
 * @property {string} sku - Stock keeping unit (Unique)
 * @property {string} [category] - Product category (knitwear, outerwear, accessories)
 * @property {number} [collection_id] - Foreign key reference to collections table
 * @property {Collection} [collection] - Populated collection object (for queries with join)
 * @property {Array<string>} [images] - Array of image URLs (JSONB)
 * @property {Array<string>} [videos] - Array of video URLs (JSONB)
 * @property {Array<string>} [sizes] - Available sizes (JSONB, default: XS, S, M, L, XL)
 * @property {string} [size_chart_image_url] - URL to size chart image
 * @property {number} [stock] - Current stock quantity
 * @property {boolean} [featured] - Whether product is featured
 * @property {boolean} [show_in_lookbook] - Whether to show in lookbook
 * @property {Array<number>} [related_products] - Array of related product IDs (JSONB)
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} ProductFormData
 * @property {string} name - Product name
 * @property {string} [description] - Product description
 * @property {string|number} price - Selling price
 * @property {string|number} [original_price] - Original/MRP price
 * @property {string} [sku] - Stock keeping unit
 * @property {string} category - Category (knitwear, outerwear, accessories)
 * @property {string|number} [collection_id] - Collection ID foreign key
 * @property {Array<string>} [images] - Image URLs
 * @property {Array<string>} [videos] - Video URLs
 * @property {Array<string>} [sizes] - Available sizes
 * @property {string} [size_chart_image_url] - Size chart image URL
 * @property {string|number} [stock] - Stock quantity
 * @property {boolean} [featured] - Featured flag
 * @property {boolean} [show_in_lookbook] - Lookbook flag
 * @property {Array<number>} [related_products] - Related product IDs
 */

/**
 * @typedef {Object} KnitwearItem
 * @property {number} id - Item ID (Primary Key)
 * @property {string} title - Item title
 * @property {string} [description] - Item description
 * @property {string} image - Item image URL
 * @property {number} [collection_id] - Foreign key reference to collections table
 * @property {Collection} [collection] - Populated collection object (for queries with join)
 * @property {number} [sort_order] - Display order
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} SaveResult
 * @property {boolean} success - Whether save was successful
 * @property {Product|KnitwearItem|Object} [data] - Returned data from save operation
 * @property {Error} [error] - Error if save failed
 * @property {string} [message] - Success or error message for user display
 */

/**
 * @typedef {Object} DraftMetadata
 * @property {ProductFormData|Object} data - The draft data
 * @property {string} savedAt - ISO timestamp of when draft was saved
 * @property {string} expiresAt - ISO timestamp of when draft expires (7 days default)
 */

/**
 * API error response type
 * @typedef {Object} ApiError
 * @property {string} code - Supabase error code
 * @property {string} message - Error message
 * @property {Object} [details] - Additional error details
 */

// Export type definitions for documentation
export const TypeDefinitions = {
  Collection: {},
  Product: {},
  ProductFormData: {},
  KnitwearItem: {},
  SaveResult: {},
  DraftMetadata: {},
  ApiError: {},
};
