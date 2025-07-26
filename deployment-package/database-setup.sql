-- Complete Database Export for Speech Access Map
-- This file contains the full database schema and all data

-- Create the main clinics table
CREATE TABLE IF NOT EXISTS clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'United States',
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    phone TEXT,
    email TEXT,
    website TEXT,
    services TEXT[] DEFAULT '{}',
    cost_level TEXT CHECK (cost_level IN ('free', 'low', 'moderate', 'high')) DEFAULT 'moderate',
    accepts_insurance BOOLEAN DEFAULT true,
    teletherapy_available BOOLEAN DEFAULT false,
    languages TEXT[] DEFAULT '{"English"}',
    age_groups TEXT[] DEFAULT '{}',
    specializations TEXT[] DEFAULT '{}',
    accessibility_features TEXT[] DEFAULT '{}',
    verified BOOLEAN DEFAULT false,
    npi_number TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
    id SERIAL PRIMARY KEY,
    total_views INTEGER DEFAULT 0,
    monthly_views INTEGER DEFAULT 0,
    total_clinics INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create submissions table for future use
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'United States',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone TEXT,
    email TEXT,
    website TEXT,
    services TEXT[] DEFAULT '{}',
    cost_level TEXT CHECK (cost_level IN ('free', 'low', 'moderate', 'high')) DEFAULT 'moderate',
    accepts_insurance BOOLEAN DEFAULT true,
    teletherapy_available BOOLEAN DEFAULT false,
    languages TEXT[] DEFAULT '{"English"}',
    age_groups TEXT[] DEFAULT '{}',
    specializations TEXT[] DEFAULT '{}',
    accessibility_features TEXT[] DEFAULT '{}',
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewer_notes TEXT
);

-- Insert initial analytics record
INSERT INTO analytics (total_views, monthly_views, total_clinics) 
VALUES (0, 0, 0) 
ON CONFLICT DO NOTHING;