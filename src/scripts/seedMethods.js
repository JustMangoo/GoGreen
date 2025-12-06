import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables from .env
dotenv.config({ path: ".env" });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  console.error("Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sampleMethods = [
  {
    title: "Quick Pickle Vegetables",
    description:
      "A fast and easy way to preserve fresh vegetables using vinegar brine. Perfect for cucumbers, carrots, and onions. This method extends shelf life for weeks while adding delicious tangy flavor.",
    category: "Pickling",
    duration: "30 min",
    image_url:
      "https://images.unsplash.com/photo-1641738219797-c814f6fab4d3?q=80&w=774&auto=format&fit=crop",
  },
  {
    title: "Water Bath Canning",
    description:
      "Traditional method for preserving high-acid foods like tomatoes, jams, and fruits. Creates shelf-stable jars that last for years. Essential technique for maximizing your harvest.",
    category: "Canning",
    duration: "2 hours",
    image_url:
      "https://images.unsplash.com/photo-1531928351158-2f736078e0a1?q=80&w=774&auto=format&fit=crop",
  },
  {
    title: "Dehydrate Fruit & Herbs",
    description:
      "Remove moisture to create dried fruits, herbs, and vegetables. Use a dehydrator or oven on low heat. Produces lightweight, portable snacks that store for months.",
    category: "Drying",
    duration: "6-12 hours",
    image_url:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=774&auto=format&fit=crop",
  },
  {
    title: "Fermented Vegetables",
    description:
      "Create probiotic-rich foods like sauerkraut and kimchi through natural fermentation. Salt and time transform vegetables into tangy, gut-healthy treats that improve with age.",
    category: "Fermenting",
    duration: "1-4 weeks",
    image_url:
      "https://images.unsplash.com/photo-1600555379765-c510d544bdbc?q=80&w=774&auto=format&fit=crop",
  },
  {
    title: "Pressure Canning",
    description:
      "Advanced method for low-acid foods like vegetables, meats, and soups. Requires special equipment but allows safe long-term storage of a wider variety of foods at room temperature.",
    category: "Canning",
    duration: "1-3 hours",
    image_url:
      "https://images.unsplash.com/photo-1568043210943-0ce4e915b02a?q=80&w=774&auto=format&fit=crop",
  },
  {
    title: "Jam & Jelly Making",
    description:
      "Turn fresh or frozen fruit into delicious spreads using sugar and pectin. Water bath canning makes them shelf-stable. Perfect for preserving summer berries year-round.",
    category: "Canning",
    duration: "1 hour",
    image_url:
      "https://images.unsplash.com/photo-1534639077088-d702bcf6857a?q=80&w=774&auto=format&fit=crop",
  },
];

async function seedMethods() {
  console.log("Starting to seed methods...");

  const { data, error } = await supabase
    .from("methods")
    .insert(sampleMethods)
    .select();

  if (error) {
    console.error("Error seeding methods:", error);
    return;
  }

  console.log("Successfully seeded methods:", data);
  console.log(`Added ${data.length} methods to the database`);
}

seedMethods();
