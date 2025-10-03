# Islamic Dua App - Sample Data

This directory contains CSV files with popular Islamic duas that can be imported into the app.

## Files

- `popular-duas.csv` - Contains 16 popular duas including:
  - Ayatul Kursi (complete)
  - Surah Al-Ikhlas (112)
  - Surah Al-Falaq (113)
  - Surah An-Nas (114)
  - Dua-e-Qunoot
  - Tasbih of Fatimah
  - Morning and Evening Duas
  - Sleep and Waking Duas
  - Eating Duas
  - Entering/Leaving Home Duas
  - Entering/Leaving Masjid Duas

## How to Import

1. Go to Admin Panel > Import/Export
2. Select "CSV" as the import format
3. Upload the `popular-duas.csv` file
4. The duas will be imported with their categories

## CSV Format

The CSV includes the following required columns:
- **title_bn**: Bangla title of the dua (required)
- **title_ar**: Arabic title
- **arabic_text**: Full Arabic text (required)
- **transliteration_bn**: Bangla transliteration
- **translation_bn**: Bangla translation (required)
- **reference**: Source reference (Quran/Hadith)
- **category_slug**: Category slug (required) - must match existing category
- **is_featured**: true/false - whether to feature the dua
- **is_active**: true/false - whether the dua is active

## Prerequisites

Before importing, make sure these categories exist in your database:
- `quran` - For Quranic duas
- `salah` - For prayer-related duas
- `dhikr` - For dhikr and tasbih
- `daily` - For daily duas

You can create these categories from the Admin Panel > Categories page, or run the seed data script.

## Note

The import function will automatically map category slugs to category IDs. If a category doesn't exist, the dua will be imported without a category.
