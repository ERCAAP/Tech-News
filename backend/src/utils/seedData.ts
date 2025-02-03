const categories = ['ai', 'app', 'technology'];

const sampleNews = categories.map(category => ({
  title: `Sample ${category.toUpperCase()} News`,
  content: `This is a sample news article for ${category}`,
  category: category,
  // ... diğer gerekli alanlar
})); 