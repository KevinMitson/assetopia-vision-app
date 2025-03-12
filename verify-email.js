// Script to verify a user's email in Supabase for ZACL_INVENTORY
// Run this with Node.js: node verify-email.js

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

async function verifyEmail() {
  try {
    console.log("\n=== ZACL_INVENTORY Email Verification Tool ===\n");
    
    // Get user email
    const email = await prompt("Enter the email address to verify: ");
    
    // Validate email
    if (!email.includes('@') || !email.includes('.')) {
      throw new Error("Please enter a valid email address");
    }
    
    console.log("\nAttempting to verify email...");
    
    // First, we need to get the user ID for this email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (userError) {
      console.log("Could not find user in profiles table. Trying auth.users table...");
      
      // Try to get the user from auth.users (requires admin access)
      console.log("\n⚠️ To verify this email, you'll need to run the following SQL in the Supabase dashboard:");
      console.log("\n-- Update email_confirmed_at for the user");
      console.log(`UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = '${email}';`);
      console.log("\n-- Verify that the update was successful");
      console.log(`SELECT email, email_confirmed_at FROM auth.users WHERE email = '${email}';`);
      
      console.log("\nAfter running these commands, the user should be able to log in.");
      rl.close();
      return;
    }
    
    console.log(`User found with ID: ${userData.id}`);
    console.log("\n⚠️ To verify this email, you'll need to run the following SQL in the Supabase dashboard:");
    console.log("\n-- Update email_confirmed_at for the user");
    console.log(`UPDATE auth.users SET email_confirmed_at = NOW() WHERE id = '${userData.id}';`);
    console.log("\n-- Verify that the update was successful");
    console.log(`SELECT email, email_confirmed_at FROM auth.users WHERE id = '${userData.id}';`);
    
    console.log("\nAfter running these commands, the user should be able to log in.");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message || error);
  } finally {
    rl.close();
  }
}

verifyEmail(); 