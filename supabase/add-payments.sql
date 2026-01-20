-- Эски таблицаны өчүрүү
DROP TABLE IF EXISTS payments CASCADE;

-- Төлөмдөр таблицасы
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Төлөм маалыматы
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'KGS',
  method VARCHAR(50) NOT NULL, -- mbank, elsom, odengi, balance, cash

  -- Статус
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed, refunded

  -- Провайдер маалыматы
  provider_id VARCHAR(255), -- Транзакция ID провайдерден
  provider_response JSONB DEFAULT '{}',

  -- Кошумча
  description TEXT,
  metadata JSONB DEFAULT '{}',

  -- Убакыттар
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индекстер
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_method ON payments(method);
CREATE INDEX idx_payments_created ON payments(created_at DESC);

-- RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Orders таблицасына payment колонкаларын кошуу
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_id') THEN
    ALTER TABLE orders ADD COLUMN payment_id UUID REFERENCES payments(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_method') THEN
    ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_status') THEN
    ALTER TABLE orders ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending';
  END IF;
END $$;
