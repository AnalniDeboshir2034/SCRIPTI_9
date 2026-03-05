const Application = require('./framework');
const fs = require('fs').promises;
const path = require('path');

const app = new Application();
const PORT = 3000;

// Пути к файлам с данными
const PATTERNS_FILE = path.join(__dirname, 'data', 'patterns.json');
const EXAMPLES_FILE = path.join(__dirname, 'data', 'examples.json');

// Вспомогательные функции для работы с файлами
async function readData(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

async function writeData(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Middleware для логирования
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware для обработки ошибок
app.use((req, res, next) => {
  try {
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= PATTERNS ROUTES =============

// GET все паттерны
app.get('/patterns', async (req, res) => {
  console.log('🎯 Handling GET /patterns');
  const patterns = await readData(PATTERNS_FILE);
  res.json(patterns);
});

// GET паттерн по ID
app.get('/patterns/:id', async (req, res) => {
  console.log(`🎯 Handling GET /patterns/${req.params.id}`);
  const patterns = await readData(PATTERNS_FILE);
  const pattern = patterns.find(p => p.id === req.params.id);
  
  if (!pattern) {
    return res.status(404).json({ error: 'Pattern not found' });
  }
  
  res.json(pattern);
});

// GET паттерны по категории
app.get('/patterns/category/:category', async (req, res) => {
  console.log(`🎯 Handling GET /patterns/category/${req.params.category}`);
  const patterns = await readData(PATTERNS_FILE);
  const filtered = patterns.filter(p => 
    p.category.toLowerCase() === req.params.category.toLowerCase()
  );
  res.json(filtered);
});

// POST создать новый паттерн
app.post('/patterns', async (req, res) => {
  console.log('🎯 Handling POST /patterns');
  console.log('📦 Request body:', req.body);
  
  const patterns = await readData(PATTERNS_FILE);
  
  const newPattern = {
    id: Date.now().toString(),
    name: req.body.name || `Pattern-${Math.floor(Math.random() * 1000)}`,
    category: req.body.category || 'Поведенческий',
    complexity: req.body.complexity || Math.floor(Math.random() * 5) + 1,
    isGof: req.body.isGof !== undefined ? req.body.isGof : true,
    year: req.body.year || 2000 + Math.floor(Math.random() * 23),
    description: req.body.description || 'Описание паттерна',
    examples: req.body.examples || ['Пример использования'],
    popularity: req.body.popularity || Math.floor(Math.random() * 50) + 50,
    createdAt: new Date().toISOString()
  };
  
  patterns.push(newPattern);
  await writeData(PATTERNS_FILE, patterns);
  
  res.status(201).json(newPattern);
});

// ... остальные маршруты (PUT, PATCH, DELETE, EXAMPLES)

console.log('📋 Registering routes...');

// Запуск сервера
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 Сервер запущен на http://localhost:' + PORT);
  console.log('📚 Тема: Паттерны программирования');
  console.log('='.repeat(50));
  
  console.log('\n📌 Зарегистрированные маршруты:');
  console.log('\n🔷 PATTERNS:');
  console.log('  GET    /patterns');
  console.log('  GET    /patterns/:id');
  console.log('  GET    /patterns/category/:category');
  console.log('  POST   /patterns');
  console.log('  PUT    /patterns/:id');
  console.log('  PATCH  /patterns/:id');
  console.log('  DELETE /patterns/:id');
  
  console.log('\n🔶 EXAMPLES:');
  console.log('  GET    /examples');
  console.log('  GET    /examples/:id');
  console.log('  GET    /examples/pattern/:patternId');
  console.log('  GET    /examples/language/:lang');
  console.log('  POST   /examples');
  console.log('  PUT    /examples/:id');
  console.log('  PATCH  /examples/:id');
  console.log('  DELETE /examples/:id');
  
  console.log('\n' + '='.repeat(50));
});