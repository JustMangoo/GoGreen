-- Run this SQL in your Supabase SQL Editor to seed the methods table

-- First, temporarily disable RLS to insert data (or add proper policies)
-- Option 1: Disable RLS (for development only)
ALTER TABLE methods DISABLE ROW LEVEL SECURITY;

-- Option 2: Add a policy to allow inserts (recommended)
-- CREATE POLICY "Allow public inserts" ON methods FOR INSERT TO anon WITH CHECK (true);

-- Insert sample data
INSERT INTO methods (title, description, category, duration, image_url) VALUES
  ('Quick Pickle Vegetables', 'A fast and easy way to preserve fresh vegetables using vinegar brine. Perfect for cucumbers, carrots, and onions. This method extends shelf life for weeks while adding delicious tangy flavor.', 'Pickling', '30 min', 'https://images.unsplash.com/photo-1641738219797-c814f6fab4d3?q=80&w=774&auto=format&fit=crop'),
  ('Water Bath Canning', 'Traditional method for preserving high-acid foods like tomatoes, jams, and fruits. Creates shelf-stable jars that last for years. Essential technique for maximizing your harvest.', 'Canning', '2 hours', 'https://images.unsplash.com/photo-1531928351158-2f736078e0a1?q=80&w=774&auto=format&fit=crop'),
  ('Dehydrate Fruit & Herbs', 'Remove moisture to create dried fruits, herbs, and vegetables. Use a dehydrator or oven on low heat. Produces lightweight, portable snacks that store for months.', 'Drying', '6-12 hours', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=774&auto=format&fit=crop'),
  ('Fermented Vegetables', 'Create probiotic-rich foods like sauerkraut and kimchi through natural fermentation. Salt and time transform vegetables into tangy, gut-healthy treats that improve with age.', 'Fermenting', '1-4 weeks', 'https://images.unsplash.com/photo-1600555379765-c510d544bdbc?q=80&w=774&auto=format&fit=crop'),
  ('Pressure Canning', 'Advanced method for low-acid foods like vegetables, meats, and soups. Requires special equipment but allows safe long-term storage of a wider variety of foods at room temperature.', 'Canning', '1-3 hours', 'https://images.unsplash.com/photo-1568043210943-0ce4e915b02a?q=80&w=774&auto=format&fit=crop'),
  ('Jam & Jelly Making', 'Turn fresh or frozen fruit into delicious spreads using sugar and pectin. Water bath canning makes them shelf-stable. Perfect for preserving summer berries year-round.', 'Canning', '1 hour', 'https://images.unsplash.com/photo-1534639077088-d702bcf6857a?q=80&w=774&auto=format&fit=crop');

-- If you disabled RLS, you can re-enable it after inserting:
-- ALTER TABLE methods ENABLE ROW LEVEL SECURITY;

-- Then add proper RLS policies for your app:
-- For reading (allow everyone to read):
CREATE POLICY "Allow public reads" ON methods FOR SELECT TO anon USING (true);

-- For inserts (adjust based on your auth needs):
-- CREATE POLICY "Allow authenticated inserts" ON methods FOR INSERT TO authenticated WITH CHECK (true);
