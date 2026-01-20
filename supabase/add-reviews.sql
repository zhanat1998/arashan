-- Эски таблицаларды өчүрүү (эгер бар болсо)
DROP TABLE IF EXISTS review_helpful CASCADE;
DROP TABLE IF EXISTS review_replies CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;

-- Пикирлер таблицасы
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  order_item_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  images TEXT[] DEFAULT '{}',
  selected_options JSONB DEFAULT '{}',
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT TRUE,
  helpful_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_product_review UNIQUE (user_id, product_id)
);

-- Пикирге жооптор (дүкөндөн)
CREATE TABLE review_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Пикирге "пайдалуу" басуу
CREATE TABLE review_helpful (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Индекстер
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);
CREATE INDEX idx_review_replies_review ON review_replies(review_id);

-- RLS иштетүү
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Anyone can view visible reviews" ON reviews FOR SELECT USING (is_visible = true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- Review replies policies
CREATE POLICY "Anyone can view replies" ON review_replies FOR SELECT USING (true);
CREATE POLICY "Shop owners can reply" ON review_replies FOR INSERT WITH CHECK (auth.uid() = user_id AND shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));

-- Review helpful policies
CREATE POLICY "Anyone can view helpful" ON review_helpful FOR SELECT USING (true);
CREATE POLICY "Users can mark helpful" ON review_helpful FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove helpful" ON review_helpful FOR DELETE USING (auth.uid() = user_id);
