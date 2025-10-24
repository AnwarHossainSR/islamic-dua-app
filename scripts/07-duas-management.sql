-- Create duas table
CREATE TABLE IF NOT EXISTS duas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_bn TEXT NOT NULL,
  title_ar TEXT,
  title_en TEXT,
  dua_text_ar TEXT NOT NULL,
  translation_bn TEXT,
  translation_en TEXT,
  transliteration TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  source TEXT,
  reference TEXT,
  benefits TEXT,
  is_important BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  audio_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dua categories table
CREATE TABLE IF NOT EXISTS dua_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_bn TEXT NOT NULL,
  name_ar TEXT,
  name_en TEXT,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#10b981',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO dua_categories (name_bn, name_ar, name_en, description, icon) VALUES
('সকালের দোয়া', 'أدعية الصباح', 'Morning Duas', 'Duas to recite in the morning', '🌅'),
('সন্ধ্যার দোয়া', 'أدعية المساء', 'Evening Duas', 'Duas to recite in the evening', '🌆'),
('খাবারের দোয়া', 'أدعية الطعام', 'Food Duas', 'Duas before and after eating', '🍽️'),
('ভ্রমণের দোয়া', 'أدعية السفر', 'Travel Duas', 'Duas for traveling', '✈️'),
('ঘুমের দোয়া', 'أدعية النوم', 'Sleep Duas', 'Duas before sleeping', '😴'),
('নামাজের দোয়া', 'أدعية الصلاة', 'Prayer Duas', 'Duas related to prayer', '🕌'),
('সাধারণ দোয়া', 'أدعية عامة', 'General Duas', 'General purpose duas', '🤲')
ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_duas_category ON duas(category);
CREATE INDEX IF NOT EXISTS idx_duas_is_important ON duas(is_important);
CREATE INDEX IF NOT EXISTS idx_duas_is_active ON duas(is_active);
CREATE INDEX IF NOT EXISTS idx_duas_tags ON duas USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_duas_created_at ON duas(created_at DESC);

-- Enable RLS
ALTER TABLE duas ENABLE ROW LEVEL SECURITY;
ALTER TABLE dua_categories ENABLE ROW LEVEL SECURITY;

-- Duas policies
CREATE POLICY "Anyone can view active duas" ON duas
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can view all duas" ON duas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admin can insert duas" ON duas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admin can update duas" ON duas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admin can delete duas" ON duas
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Categories policies
CREATE POLICY "Anyone can view active categories" ON dua_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage categories" ON dua_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_duas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_duas_updated_at
  BEFORE UPDATE ON duas
  FOR EACH ROW
  EXECUTE FUNCTION update_duas_updated_at();