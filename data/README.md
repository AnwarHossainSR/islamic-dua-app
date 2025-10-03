# Islamic Dua App - Sample Data

This directory contains CSV files with popular Islamic duas that can be imported into the app.

## Files

- `popular-duas.csv` - Contains popular duas including:
  - Ayatul Kursi
  - Surah Al-Ikhlas (112)
  - Surah Al-Falaq (113)
  - Surah An-Nas (114)
  - Dua-e-Qunoot
  - Tasbih of Fatimah
  - Morning and Evening Duas
  - Sleep and Waking Duas

## How to Import

1. Go to Admin Panel > Import/Export
2. Convert the CSV to JSON format (or use the provided conversion tool)
3. Upload the JSON file
4. The duas will be imported with their categories and tags

## CSV Format

The CSV includes the following columns:
- title: English title of the dua
- arabic: Arabic text
- transliteration: Romanized pronunciation
- translation_en: English translation
- translation_bn: Bangla translation
- category: Category name
- tags: Pipe-separated tags (e.g., "morning|protection")
- reference: Source reference (Quran/Hadith)
- benefits: Benefits and when to recite

## Note

Before importing, make sure the referenced categories exist in your database. You may need to create categories first.
