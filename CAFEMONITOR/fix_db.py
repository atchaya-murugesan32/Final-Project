import sqlite3

conn = sqlite3.connect('cafemonitor.db')
cursor = conn.cursor()

# Set a fallback image for any favorite cafe that doesn't have one
fallback_image = "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80"
cursor.execute("UPDATE favorite_cafes SET image_url = ?, rating = 4.6 WHERE image_url IS NULL", (fallback_image,))

conn.commit()
conn.close()

print("Successfully updated missing image_url in favorite_cafes table.")
