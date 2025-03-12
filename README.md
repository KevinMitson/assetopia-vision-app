# ZACL_INVENTORY

A comprehensive inventory management system for tracking and managing assets.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/zacl_inventory.git
   cd zacl_inventory
   ```

2. Install dependencies
   ```
   npm install
   # or
   yarn install
   ```

3. Start the development server
   ```
   npm run dev
   # or
   yarn dev
   ```

## Creating an Admin User

There are two ways to create an admin user:

### Method 1: Using the Admin Creation Script (Recommended)

1. Make sure you have Node.js installed
2. Open a terminal in the project root directory
3. Run the admin creation script:
   ```
   node create-admin.js
   ```
4. Follow the prompts to enter the admin email, password, and full name
5. The script will create the admin user and assign the admin role

### Method 2: Using the Mock Superadmin (Development Only)

For development and testing purposes, you can use the built-in mock superadmin:

- Email: kevin.mitson@example.com
- Password: password

**Note:** The mock superadmin doesn't create real data in the database. It's recommended to use Method 1 for creating real admin users.

## Features

- Asset tracking and management
- User management
- Department and location tracking
- Maintenance scheduling
- Asset assignment history
- Reporting and analytics

## Security

- Role-based access control
- Secure authentication with Supabase
- Data validation and sanitization

## License

This project is licensed under the MIT License - see the LICENSE file for details. 