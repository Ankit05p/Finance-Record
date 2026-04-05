# Finance Data Processing and Access Control Backend

## Project Description

This is a backend system designed to help users manage their personal financial records, including income and expenses.  
Users can track, update, and maintain a complete history of their financial activities in a structured way.

The system supports role-based access control with three roles: User (Viewer), Analyst, and Admin.  
- Users can manage and view their own financial data.  
- Analysts and Admins have elevated permissions, allowing them to access and manage data of all users.

It also includes features like category management and recent activity tracking, making it suitable for integration with a financial dashboard.


##  Features

- User authentication with JWT
- Role-based access control (Viewer, Analyst, Admin)
- Financial record management (income & expense)
- Category management
- Recent activity tracking
- Secure API with middleware


## Tech Stack

| Category            | Technology                          |
|--------------------|------------------------------------|
| Backend Framework  | Node.js, Express.js                |
| Database           | MongoDB (Atlas)                    |
| ODM                | Mongoose                           |
| Authentication     | JWT (jsonwebtoken)                 |
| Password Security  | Bcrypt                             |
| Email Service      | Nodemailer                         |
| OTP Handling       | otp-generator                      |
| Middleware         | cookie-parser                      |
| Environment Config | dotenv                             |
| Development Tool   | Nodemon                            |
| API Testing        | Postman                            |
| Version Control    | Git, GitHub                        |



##  Project Structure

project-root/
│
├── config/
│ └── database.js # Database connection
│
├── controller/
│ ├── Auth.js
│ ├── CategoryService.js
│ ├── FinancialService.js
│ ├── RecentActivityService.js
│ └── UserService.js
│
├── middlewares/
│ └── auth.js # Authentication & role middleware
│
├── models/
│ ├── Category.js
│ ├── FinancialRecord.js
│ ├── Otp.js
│ ├── RecentActivity.js
│ └── User.js
│
├── routes/
│ ├── CategoryRoute.js
│ ├── FinancialRoute.js
│ ├── RecentActivity.js
│ └── UserRoute.js
│
├── utils/
│ └── mailSender.js # Email/OTP utility
│
├── .env # Environment variables (not uploaded)
├── index.js # Entry point
├── package.json
└── package-lock.json


# Finance Dashboard Backend — Setup Guide

## Step 1 — Create project folder
```bash
mkdir finance-backend
cd finance-backend
```

## Step 2 — Initialize package.json
```bash
npm init -y
```

## Step 3 — Install all dependencies
```bash
npm install bcrypt cookie-parser cors dotenv express jsonwebtoken mongoose nodemailer nodemon otp-generator
```

## Step 4 — Install dev dependency
```bash
npm install --save-dev nodemon
```

## Step 6 — Start dev server
```bash
npm run dev
```

## step 7 — Data in .env file
```bash
PORT=4000

DATABASE_URL=your_mongodb_url

MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password

JWT_SECRET=your_secret_key
```


## Role Permissions

| Feature / Action                 | Viewer          | Analyst | Admin |
|---------------------------------|-----------------|---------|-------|
| View all users                  | ✓               | ✓       | ✓     |
| View user by ID                 | Self only       | ✓       | ✓     |
| Update user                     | Self only       | ✓       | ✓     |
| Delete user                     | Self only       | ✓       | ✓     |
| Create category                 | ✗               | ✓       | ✓     |
| View all categories             | ✓               | ✓       | ✓     |
| View category details           | ✓               | ✓       | ✓     |
| Create financial record         | Self only       | ✓       | ✓     |
| View all financial records      | ✗               | ✓       | ✓     |
| View financial records by user  | Self only       | ✓       | ✓     |
| Update financial record         | Self only       | ✓       | ✓     |
| Delete financial record         | Self only       | ✓       | ✓     |
| View all recent activity        | ✓               | ✓       | ✓     |
| View activity by user           | Self only       | ✓       | ✓     |
| Change password                 | ✓               | ✓       | ✓     |
| Logout                          | ✓               | ✓       | ✓     |

---

> 🔸 **Self only** means the user can access only their own data using authentication.  
> 🔸 **Analyst and Admin** roles have access to manage all users' data.






##  API Reference

Base URL: http://localhost:4000

---

###  Auth Routes (`/api/v1/auth`)

| Method | Endpoint                  | Description                  |
|--------|---------------------------|------------------------------|
| POST   | /auth/sendotp             | Send OTP for signup          |
| POST   | /auth/signup              | Register new user            |
| POST   | /auth/login               | Login user                   |
| POST   | /auth/changePassword      | Change password (Auth)       |
| POST   | /auth/logout              | Logout user (Auth)           |
| GET    | /auth/getAllUsers         | Get all users                |
| GET    | /auth/getUserById/:id     | Get user by ID               |
| PUT    | /auth/updateUser/:id      | Update user                  |
| DELETE | /auth/deleteUser/:id      | Delete user                  |

---

###  Category Routes (`/api/v1/category`)

| Method | Endpoint                              | Description                |
|--------|----------------------------------------|----------------------------|
| POST   | /category/createCategory              | Create new category        |
| GET    | /category/showAllCategory             | Get all categories         |
| GET    | /category/categoryPageDetails/:id     | Get category details       |

---

###  Financial Routes (`/api/v1/finance`)

| Method | Endpoint                                      | Description                    |
|--------|-----------------------------------------------|--------------------------------|
| POST   | /finance/createFinancialRecore               | Create financial record        |
| GET    | /finance/getAllFinanceRecore                 | Get all records (Admin/Analyst)|
| GET    | /finance/getFinanceByUserId/:id              | Get records by user            |
| POST   | /finance/updateFinancialRecore               | Update record                  |
| POST   | /finance/deleteFinancialRecord               | Delete record                  |

---

###  Recent Activity Routes (`/api/v1/recent`)

| Method | Endpoint                                      | Description                    |
|--------|-----------------------------------------------|--------------------------------|
| GET    | /recent/getAllRecentActivity                 | Get all activities             |
| GET    | /recent/ActivityOfUserById/:id               | Get activity by user           |

---


##  API Testing

All APIs can be tested using the Postman collection.

👉 Download / Import the collection from below:

🔗 [Open Postman Collection](https://go.postman.co/collection/46701484-dc47e39d-43ac-4701-9726-ea6d1fc41887?source=collection_link)

OR

 Import the JSON file from:

---

###  Steps to Use

1. Open Postman  
2. Click on **Import**  
3. Upload the collection JSON file  
4. Set environment variables (Base URL, Token)  
5. Test all APIs  

---

### Authorization

For protected routes, add token in headers:



## Error Responses

| Scenario              | Status | Error message example              |
|-----------------------|--------|------------------------------------|
| Missing/invalid token | 401    | Access denied. No token provided.  |
| Token expired         | 401    | Token expired. Please refresh.     |
| Insufficient role     | 403    | Access denied. Required role: admin|
| Not found             | 404    | Financial record not found         |
| Validation failure    | 400    | Validation failed + field details  |
| Duplicate email       | 409    | email already exists               |
| Server error          | 500    | Internal Server Error              |

---