// Step-by-step guide to enable image uploads to Supabase Storage

## Setup Supabase Storage Bucket

1. Go to your Supabase Dashboard → Storage
2. Create a new bucket named "method-images"
3. Set bucket to PUBLIC (or configure RLS policies)
4. Enable file size limits (recommended: 5MB max)

## RLS Policies for Storage

Run this SQL in your Supabase SQL Editor:

```sql
-- Allow public uploads to method-images bucket
CREATE POLICY "Allow public uploads"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'method-images');

-- Allow public reads from method-images bucket
CREATE POLICY "Allow public reads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'method-images');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'method-images');
```

## Usage Examples

### Example 1: Create new method with image

```tsx
import { createMethod } from "../services/methods";
import { uploadMethodImage } from "../services/storage";

async function handleCreateMethod(formData: FormData) {
  const imageFile = formData.get("image") as File;

  // Upload image first
  const imageUrl = await uploadMethodImage(imageFile);

  // Create method with image URL
  const method = await createMethod({
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    category: formData.get("category") as string,
    duration: formData.get("duration") as string,
    image_url: imageUrl,
  });

  return method;
}
```

### Example 2: Using the ImageUpload component

```tsx
import ImageUpload from "../components/Tools/ImageUpload";
import { useState } from "react";

function CreateMethodForm() {
  const [imageUrl, setImageUrl] = useState<string>("");

  return (
    <form>
      <ImageUpload onImageUploaded={setImageUrl} />

      {/* Other form fields */}

      <input type="hidden" name="image_url" value={imageUrl} />
    </form>
  );
}
```

### Example 3: Update existing method's image

```tsx
import { updateMethodImage } from "../services/storage";

async function handleUpdateImage(
  methodId: string,
  newImageFile: File,
  oldImageUrl?: string
) {
  const newImageUrl = await updateMethodImage(
    methodId,
    newImageFile,
    oldImageUrl
  );
  console.log("Image updated:", newImageUrl);
}
```

## Files Created

1. `src/services/storage.ts` - Core storage functions
2. `src/components/Tools/ImageUpload.tsx` - Reusable upload component
3. `src/lib/supabaseClient.d.ts` - TypeScript declarations

## Next Steps

1. Create the "method-images" bucket in Supabase Storage
2. Apply the RLS policies above
3. Import and use ImageUpload component in your forms
4. Test uploading an image
