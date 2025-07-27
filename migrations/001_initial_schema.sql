-- Initial database schema for D Directory
-- Contractors table
CREATE TABLE IF NOT EXISTS contractors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  location TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  image_url TEXT,
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  years_experience INTEGER DEFAULT 0,
  project_types TEXT, -- JSON array as text
  service_radius INTEGER DEFAULT 50,
  free_estimate BOOLEAN DEFAULT true,
  licensed BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users table for admin authentication
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Project types table
CREATE TABLE IF NOT EXISTS project_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Plans table for subscription management
CREATE TABLE IF NOT EXISTS plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  monthly_leads INTEGER NOT NULL,
  features TEXT, -- JSON array as text
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Contractor subscriptions table
CREATE TABLE IF NOT EXISTS contractor_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contractor_id INTEGER NOT NULL,
  plan_id INTEGER NOT NULL,
  leads_used INTEGER DEFAULT 0,
  billing_cycle_start DATE NOT NULL,
  billing_cycle_end DATE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contractor_id) REFERENCES contractors(id),
  FOREIGN KEY (plan_id) REFERENCES plans(id)
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contractor_id INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  project_type TEXT NOT NULL,
  project_description TEXT,
  budget TEXT,
  timeline TEXT,
  status TEXT DEFAULT 'new',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contractor_id) REFERENCES contractors(id)
);

-- Session storage table
CREATE TABLE IF NOT EXISTS sessions (
  sid TEXT PRIMARY KEY,
  sess TEXT NOT NULL,
  expire DATETIME NOT NULL
);

-- Insert default admin user (password: password123)
INSERT OR IGNORE INTO users (id, username, password_hash, role) 
VALUES (1, 'admin', '$2a$10$rQZc8pZXuZNYxNOV7kqZPOp5V8zJJ0YQYj8X3q8zQ2gXKGzQlZJ.K', 'manager');

-- Insert default project types
INSERT OR IGNORE INTO project_types (id, name, icon, description) VALUES
(1, 'Bathroom Remodeling', 'Bath', 'Complete bathroom renovation and remodeling services'),
(2, 'Kitchen Remodeling', 'ChefHat', 'Kitchen renovation, cabinet installation, and appliance fitting'),
(3, 'Custom Homes', 'Home', 'Custom home construction from design to completion'),
(4, 'Roofing', 'Hammer', 'Roof repair, replacement, and installation services'),
(5, 'Flooring', 'Square', 'Hardwood, tile, carpet, and laminate flooring installation'),
(6, 'Home Additions', 'Plus', 'Room additions, extensions, and home expansions'),
(7, 'Electrical Work', 'Zap', 'Electrical installation, repair, and maintenance'),
(8, 'Plumbing', 'Droplets', 'Plumbing installation, repair, and maintenance services');

-- Insert default subscription plans
INSERT OR IGNORE INTO plans (id, name, price, monthly_leads, features) VALUES
(1, 'Basic', 29.99, 5, '["Basic listing", "Email notifications", "Lead tracking"]'),
(2, 'Professional', 79.99, 15, '["Enhanced listing", "Priority placement", "Advanced analytics", "Phone support"]'),
(3, 'Premium', 149.99, 50, '["Premium listing", "Top placement", "Unlimited project types", "24/7 support", "Custom branding"]');