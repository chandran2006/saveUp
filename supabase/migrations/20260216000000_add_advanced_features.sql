-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES transactions(id) ON DELETE SET NULL,
  image_url text NOT NULL,
  extracted_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Financial health scores table
CREATE TABLE IF NOT EXISTS financial_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month text NOT NULL,
  score numeric NOT NULL CHECK (score >= 0 AND score <= 100),
  factors jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month)
);

-- Spending predictions table
CREATE TABLE IF NOT EXISTS spending_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month text NOT NULL,
  predicted_amount numeric NOT NULL,
  category text NOT NULL,
  confidence numeric,
  created_at timestamptz DEFAULT now()
);

-- Daily limits table
CREATE TABLE IF NOT EXISTS daily_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  limit_amount numeric NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE spending_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own receipts" ON receipts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own scores" ON financial_scores FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own predictions" ON spending_predictions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own limits" ON daily_limits FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX notifications_user_id_idx ON notifications(user_id);
CREATE INDEX receipts_user_id_idx ON receipts(user_id);
CREATE INDEX financial_scores_user_id_idx ON financial_scores(user_id);
CREATE INDEX spending_predictions_user_id_idx ON spending_predictions(user_id);
CREATE INDEX daily_limits_user_id_idx ON daily_limits(user_id);
