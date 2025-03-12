// Script to create a real superadmin user in Supabase for ZACL_INVENTORY
// Run this with Node.js: node create-admin.js

import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

// Supabase configuration
const SUPABASE_URL = "https://hcdqlbuuybjjcvqxcscp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjZHFsYnV1eWJqamN2cXhjc2NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNTU0MjksImV4cCI6MjA1NjkzMTQyOX0.IlYygkr_b8HwxxCo4Q-krbQwFxJ5eausm0d0NZ-EnbE";

// Initialize readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Function to prompt user for input
const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

async function createAdmin() {
  try {
    console.log("\n=== ZACL_INVENTORY Admin Creation Tool ===\n");
    
    // Get admin details from user input
    const email = await prompt("Enter admin email: ");
    const password = await prompt("Enter admin password (min 8 characters): ");
    const fullName = await prompt("Enter admin full name: ");
    
    // Validate inputs
    if (!email.includes('@') || !email.includes('.')) {
      throw new Error("Please enter a valid email address");
    }
    
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }
    
    if (!fullName || fullName.trim().length < 3) {
      throw new Error("Please enter a valid full name (at least 3 characters)");
    }
    
    console.log("\nCreating admin user...");
    
    // 1. Sign up the admin user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
          is_admin: true // Add admin flag to user metadata
        }
      }
    });
    
    if (authError) {
      throw authError;
    }
    
    console.log("User created successfully:", authData.user.id);
    
    // Try to create a profile for the user if the profiles table exists
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: fullName,
          email: email,
          is_admin: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (!profileError) {
        console.log("User profile created successfully");
      }
    } catch (profileErr) {
      // Silently handle profile creation errors - the table might not exist
      console.log("Note: Could not create user profile. This is normal if the profiles table doesn't exist.");
    }
    
    console.log("\n✅ SUCCESS! Your admin account has been created:");
    console.log("Email:", email);
    console.log("Name:", fullName);
    console.log("User ID:", authData.user.id);
    
    console.log("\n⚠️ IMPORTANT: Due to Row-Level Security (RLS) policies in Supabase, you need to manually set this user as an admin.");
    console.log("\nTo complete the admin setup, follow these steps:");
    console.log("1. Log in to your Supabase dashboard: https://app.supabase.com");
    console.log("2. Go to the SQL Editor");
    console.log("3. Run the following SQL commands (replace USER_ID with the ID shown above):");
    console.log("\n-- Create roles table if it doesn't exist");
    console.log("CREATE TABLE IF NOT EXISTS roles (");
    console.log("  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),");
    console.log("  name TEXT NOT NULL UNIQUE,");
    console.log("  description TEXT,");
    console.log("  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),");
    console.log("  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()");
    console.log(");");
    console.log("\n-- Create user_roles table if it doesn't exist");
    console.log("CREATE TABLE IF NOT EXISTS user_roles (");
    console.log("  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),");
    console.log("  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,");
    console.log("  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,");
    console.log("  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),");
    console.log("  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),");
    console.log("  UNIQUE(user_id, role_id)");
    console.log(");");
    console.log("\n-- Disable RLS for these tables (or configure appropriate policies)");
    console.log("ALTER TABLE roles DISABLE ROW LEVEL SECURITY;");
    console.log("ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;");
    console.log("\n-- Insert Admin role if it doesn't exist");
    console.log("INSERT INTO roles (name, description)");
    console.log("VALUES ('Admin', 'System Administrator with full access')");
    console.log("ON CONFLICT (name) DO NOTHING;");
    console.log("\n-- Assign Admin role to the user");
    console.log("INSERT INTO user_roles (user_id, role_id)");
    console.log("VALUES ('" + authData.user.id + "', (SELECT id FROM roles WHERE name = 'Admin'))");
    console.log("ON CONFLICT (user_id, role_id) DO NOTHING;");
    
    console.log("\nAfter running these commands, you can log in with your new admin credentials.");
    
  } catch (error) {
    console.error("\n❌ Error creating admin user:", error.message || error);
  } finally {
    rl.close();
  }
}

createAdmin(); 