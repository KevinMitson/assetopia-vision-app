// Script to check user status in Supabase for ZACL_INVENTORY
// Run this with Node.js: node check-user.js

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

async function checkUser() {
  try {
    console.log("\n=== ZACL_INVENTORY User Check Tool ===\n");
    
    // Get user email or ID
    const userIdentifier = await prompt("Enter the user email or ID to check: ");
    
    // Validate input
    if (!userIdentifier || userIdentifier.trim() === '') {
      throw new Error("Please enter a valid email or user ID");
    }
    
    console.log("\nChecking user status...");
    
    // Try to sign in with the user to check if they exist
    try {
      // Check if the input looks like an email
      if (userIdentifier.includes('@')) {
        const { data, error } = await supabase.auth.signInWithOtp({
          email: userIdentifier,
          options: {
            shouldCreateUser: false
          }
        });
        
        if (error) {
          if (error.message.includes('not found')) {
            console.log(`\n❌ User with email ${userIdentifier} does not exist in auth.users table.`);
          } else if (error.message.includes('Email not confirmed')) {
            console.log(`\n⚠️ User with email ${userIdentifier} exists but email is not verified.`);
          } else {
            console.log(`\n⚠️ Error checking user: ${error.message}`);
          }
        } else {
          console.log(`\n✅ User with email ${userIdentifier} exists and a magic link has been sent.`);
        }
      }
    } catch (authError) {
      console.log(`\n⚠️ Error checking user through auth: ${authError.message}`);
    }
    
    // Generate SQL to check user in auth.users table
    console.log("\n=== SQL Commands to Check User in Supabase ===");
    console.log("\n-- Check if user exists in auth.users table");
    
    if (userIdentifier.includes('@')) {
      console.log(`SELECT id, email, email_confirmed_at, last_sign_in_at FROM auth.users WHERE email = '${userIdentifier}';`);
    } else {
      console.log(`SELECT id, email, email_confirmed_at, last_sign_in_at FROM auth.users WHERE id = '${userIdentifier}';`);
    }
    
    console.log("\n-- Check if user has a profile");
    if (userIdentifier.includes('@')) {
      console.log(`SELECT p.* FROM profiles p JOIN auth.users u ON p.id = u.id WHERE u.email = '${userIdentifier}';`);
    } else {
      console.log(`SELECT * FROM profiles WHERE id = '${userIdentifier}';`);
    }
    
    console.log("\n-- Check if user has roles assigned");
    if (userIdentifier.includes('@')) {
      console.log(`
SELECT r.name as role_name, r.description
FROM roles r
JOIN user_roles ur ON r.id = ur.role_id
JOIN auth.users u ON ur.user_id = u.id
WHERE u.email = '${userIdentifier}';`);
    } else {
      console.log(`
SELECT r.name as role_name, r.description
FROM roles r
JOIN user_roles ur ON r.id = ur.role_id
WHERE ur.user_id = '${userIdentifier}';`);
    }
    
    console.log("\n=== SQL Commands to Fix Common Issues ===");
    
    console.log("\n-- Verify user's email (if not confirmed)");
    if (userIdentifier.includes('@')) {
      console.log(`UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = '${userIdentifier}';`);
    } else {
      console.log(`UPDATE auth.users SET email_confirmed_at = NOW() WHERE id = '${userIdentifier}';`);
    }
    
    console.log("\n-- Create profile for user (if missing)");
    if (userIdentifier.includes('@')) {
      console.log(`
INSERT INTO profiles (id, full_name, email, is_admin)
SELECT id, '', email, false FROM auth.users WHERE email = '${userIdentifier}'
ON CONFLICT (id) DO NOTHING;`);
    } else {
      console.log(`
INSERT INTO profiles (id, full_name, email, is_admin)
SELECT id, '', email, false FROM auth.users WHERE id = '${userIdentifier}'
ON CONFLICT (id) DO NOTHING;`);
    }
    
    console.log("\n-- Assign Admin role to user");
    if (userIdentifier.includes('@')) {
      console.log(`
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id 
FROM auth.users u, roles r 
WHERE u.email = '${userIdentifier}' AND r.name = 'Admin'
ON CONFLICT (user_id, role_id) DO NOTHING;`);
    } else {
      console.log(`
INSERT INTO user_roles (user_id, role_id)
SELECT '${userIdentifier}', id FROM roles WHERE name = 'Admin'
ON CONFLICT (user_id, role_id) DO NOTHING;`);
    }
    
  } catch (error) {
    console.error("\n❌ Error:", error.message || error);
  } finally {
    rl.close();
  }
}

checkUser(); 