#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read environment variables
const envPath = path.join(process.cwd(), '.env');
let envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
}

// Read HTML file
const htmlPath = path.join(process.cwd(), 'index.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Replace environment variable placeholders
Object.keys(envVars).forEach(key => {
  if (key.startsWith('VITE_')) {
    const placeholder = `%${key}%`;
    const value = envVars[key];
    htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
    console.log(`✅ Replaced ${placeholder} with ${value}`);
  }
});

// Write updated HTML file
fs.writeFileSync(htmlPath, htmlContent);
console.log('✅ Environment variables replaced in index.html');
