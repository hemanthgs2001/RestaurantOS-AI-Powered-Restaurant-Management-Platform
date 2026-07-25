# RestaurantOS-AI-Powered-Restaurant-Management-Platform# RestaurantOS - AI Powered Restaurant Management Platform

## Overview

RestaurantOS is a comprehensive restaurant management platform that combines traditional restaurant operations with AI-powered features. Built with React.js, Node.js, and FastAPI, it provides a modern, scalable solution for restaurant management.

## Features

### Authentication & RBAC
- Secure JWT-based authentication
- Role-Based Access Control (RBAC)
- Roles: Owner, Manager, Chef, Waiter, Cashier, Store Manager

### Restaurant Operations
- Table Management
- Order Management
- Menu Management
- Recipe Management
- Ingredient Management
- Supplier Management
- Staff Management

### Inventory Management
- Product Management
- Category Management
- Warehouse/Store Management
- Stock In/Stock Out
- Purchase Orders

### Expense Management
- Expense Categories
- Expense Records
- Supplier Invoice Management
- Monthly Expense Tracking

### Dashboard
- Sales Overview
- Active Orders
- Table Occupancy
- Low Stock Items
- Monthly Expenses
- Purchase Summary
- Profit Overview
- Supplier Summary

### AI Features
- Predict ingredient shortages
- Recommend stock reorder quantities
- Suggest menu pricing
- Estimate food preparation time
- Analyze ingredient waste
- AI Invoice Processing (OCR)
- Expense Register Export (Excel)

## Tech Stack

### Frontend
- React.js
- React Router
- Chart.js / Recharts
- Axios
- React Hook Form
- React Hot Toast

### Backend (Node.js)
- Express.js
- PostgreSQL (Sequelize ORM)
- JWT Authentication
- Helmet, CORS, Compression

### AI Backend (FastAPI)
- FastAPI
- Tesseract OCR
- PDF2Image
- Pandas, NumPy
- Scikit-learn

### DevOps
- Docker / Docker Compose
- Git
- CI/CD Ready

## Installation

### Prerequisites
- Node.js (v16+)
- Python (3.9+)
- PostgreSQL (13+)
- Docker (optional)

### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/restaurantos.git
cd restaurantos