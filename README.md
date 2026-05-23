# 🏦 Banking Application

## 📌 Overview

This is a full-stack Banking System Application that allows users to perform secure banking operations such as deposit, withdraw, and transfer money between accounts. The system is built using Spring Boot (backend) and React (frontend) with JWT-based authentication for security.

## 🚀 Features

### 👤 User Features
- User registration and login
- JWT-based authentication
- Secure session handling

### 🏦 Banking Operations
- 💰 Deposit money into account
- 💸 Withdraw money from account
- 🔄 Transfer money between accounts
- 📊 View account balance

### 🔐 Security
- JWT authentication
- Spring Security integration
- Protected REST APIs

## 🛠️ Tech Stack

### Backend
- Java
- Spring Boot
- Spring Security
- JWT (JSON Web Token)
- Hibernate / JPA

### Frontend
- React (Vite)
- HTML, CSS, JavaScript
- Axios (API calls)

### Database
- MySQL (or your DB)
- 
## 📂 Project Structure
Banking-Application/
│
├── banking-frontend/
│   └── vite-project/   (React UI)
│
├── banking/
│   ├── controller/
│   ├── entity/
│   ├── repository/
│   ├── security/
│   ├── config/
│
└── README.md

## ⚙️ How It Works

1. User registers and logs in
2. Backend generates JWT token
3. Frontend stores token and sends it in API requests
4. User performs banking operations:
   - Deposit
   - Withdraw
   - Transfer
5. Backend updates account balances securely
6. Transaction data is processed and stored

## 🔐 JWT Authentication Flow

1. User logs in with credentials
2. Server validates and generates JWT token
3. Token is sent to frontend
4. Frontend includes token in request headers:
Authorization: Bearer <token>
5. Backend validates token before processing requests

---

## 🔄 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get token |
| POST | `/account/deposit` | Deposit money |
| POST | `/account/withdraw` | Withdraw money |
| POST | `/account/transfer` | Transfer between accounts |
| GET | `/account/balance` | View account balance |

## 💡 Future Enhancements

- 📜 Transaction history tracking
- 👨‍💼 Admin dashboard
- 📊 Account statements (PDF export)
- 🔔 Notifications for transactions
- 🏦 Multi-account support per user
- ☁️ Cloud deployment (AWS / Render / Vercel)

## 👨‍💻 Author

Rohith Kumar S

## 📜 License

This project is open-source and free to use.
