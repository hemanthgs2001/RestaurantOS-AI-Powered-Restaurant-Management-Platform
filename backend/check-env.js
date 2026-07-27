require('dotenv').config();

const key = process.env.GEMINI_API_KEY;

console.log('Current directory:', process.cwd());
console.log('GEMINI_API_KEY present:', Boolean(key));
if (key) {
  console.log('Key starts with:', key.slice(0, 8) + '...');
  console.log('Key length:', key.length);
}