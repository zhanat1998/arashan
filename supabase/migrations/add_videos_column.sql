-- Add videos column to products table
-- This allows storing multiple video URLs per product (up to 3)

ALTER TABLE products
ADD COLUMN IF NOT EXISTS videos TEXT[] DEFAULT '{}';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_videos ON products USING GIN (videos);

-- Comment for documentation
COMMENT ON COLUMN products.videos IS 'Array of video URLs for product (max 3 videos)';