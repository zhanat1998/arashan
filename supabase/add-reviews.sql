-- Пикирлер таблицасы (товарлар жана видеолор үчүн)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Товар же видео үчүн (бирөө гана болот)
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,

  -- Буйрутма менен байланыш (товар пикири үчүн)
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  order_item_id UUID,

  -- Пикир маалыматы
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,

  -- Сүрөттөр (JSON массиви)
  images TEXT[] DEFAULT '{}',

  -- Тандалган варианттар (түс, өлчөм)
  selected_options JSONB DEFAULT '{}',

  -- Статус
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT TRUE,

  -- Статистика
  helpful_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Бир колдонуучу бир товарга/видеого бир гана пикир жаза алат
  CONSTRAINT unique_user_product_review UNIQUE (user_id, product_id),
  CONSTRAINT unique_user_video_review UNIQUE (user_id, video_id),

  -- Товар же видео болушу керек
  CONSTRAINT review_target_check CHECK (
    (product_id IS NOT NULL AND video_id IS NULL) OR
    (product_id IS NULL AND video_id IS NOT NULL)
  )
);

-- Пикирге жооптор (дүкөндөн)
CREATE TABLE IF NOT EXISTS review_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Пикирге "пайдалуу" басуу
CREATE TABLE IF NOT EXISTS review_helpful (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Индекстер
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_video ON reviews(video_id) WHERE video_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_replies_review ON review_replies(review_id);

-- RLS иштетүү
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Anyone can view visible reviews"
  ON reviews FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Review replies policies
CREATE POLICY "Anyone can view replies"
  ON review_replies FOR SELECT
  USING (true);

CREATE POLICY "Shop owners can reply"
  ON review_replies FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
  );

-- Review helpful policies
CREATE POLICY "Anyone can view helpful"
  ON review_helpful FOR SELECT
  USING (true);

CREATE POLICY "Users can mark helpful"
  ON review_helpful FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove helpful"
  ON review_helpful FOR DELETE
  USING (auth.uid() = user_id);

-- Helpful count триггери
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reviews SET helpful_count = helpful_count - 1 WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_helpful_count
  AFTER INSERT OR DELETE ON review_helpful
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpful_count();

-- Reply count триггери
CREATE OR REPLACE FUNCTION update_review_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE reviews SET reply_count = reply_count + 1 WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reviews SET reply_count = reply_count - 1 WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reply_count
  AFTER INSERT OR DELETE ON review_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_review_reply_count();

-- Товардын рейтингин жаңыртуу триггери
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE products
    SET
      rating = (SELECT COALESCE(AVG(rating)::DECIMAL(2,1), 0) FROM reviews WHERE product_id = NEW.product_id AND is_visible = true),
      review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id AND is_visible = true)
    WHERE id = NEW.product_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products
    SET
      rating = (SELECT COALESCE(AVG(rating)::DECIMAL(2,1), 0) FROM reviews WHERE product_id = OLD.product_id AND is_visible = true),
      review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = OLD.product_id AND is_visible = true)
    WHERE id = OLD.product_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  WHEN (NEW.product_id IS NOT NULL OR OLD.product_id IS NOT NULL)
  EXECUTE FUNCTION update_product_rating();

-- Products таблицасына review_count колонкасын кошуу (эгер жок болсо)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'review_count'
  ) THEN
    ALTER TABLE products ADD COLUMN review_count INTEGER DEFAULT 0;
  END IF;
END $$;
