const BASE_URL = "http://localhost:8080/auth";

const getHeaders = () => ({
  "Content-Type": "application/json",
});

// Auth
export const registerUser = (user) =>
  fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(user),
  });

export const loginUser = (credentials) =>
  fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(credentials),
  });

// Users
export const getAllUsers = () =>
  fetch(`${BASE_URL}/users`, {
    headers: getHeaders(),
  });

export const getUserById = (id) =>
  fetch(`${BASE_URL}/users/${id}`, {
    headers: getHeaders(),
  });

export const deleteUser = (id) =>
  fetch(`${BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

export const updateUser = (id, user) =>
  fetch(`${BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(user),
  });

export const changePassword = (id, oldPassword, newPassword) =>
  fetch(
    `${BASE_URL}/users/${id}/password?oldPassword=${encodeURIComponent(oldPassword)}&newPassword=${encodeURIComponent(newPassword)}`,
    {
      method: "PUT",
      headers: getHeaders(),
    }
  );

// Accounts
export const getAllAccounts = () =>
  fetch(`${BASE_URL}/accounts`, {
    headers: getHeaders(),
  });

export const createAccount = (userId, account) =>
  fetch(`${BASE_URL}/create/${userId}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(account),
  });

export const getAccountByUserId = (userId) =>
  fetch(`${BASE_URL}/account/user/${userId}`, {
    headers: getHeaders(),
  });

export const getAccountByNumber = (accountNumber) =>
  fetch(`${BASE_URL}/account/${accountNumber}`, {
    headers: getHeaders(),
  });

export const getBalance = (accountId) =>
  fetch(`${BASE_URL}/balance/${accountId}`, {
    headers: getHeaders(),
  });

// Transactions
export const deposit = (accountNumber, amount) =>
  fetch(`${BASE_URL}/deposit?accountNumber=${accountNumber}&amount=${amount}`, {
    method: "POST",
    headers: getHeaders(),
  });

export const withdraw = (accountNumber, amount) =>
  fetch(
    `${BASE_URL}/withdraw?accountNumber=${accountNumber}&amount=${amount}`,
    {
      method: "POST",
      headers: getHeaders(),
    }
  );

export const transfer = (fromAccount, toAccount, amount) =>
  fetch(
    `${BASE_URL}/transfer?fromAccount=${fromAccount}&toAccount=${toAccount}&amount=${amount}`,
    {
      method: "POST",
      headers: getHeaders(),
    }
  );

export const getHistory = (accountId) =>
  fetch(`${BASE_URL}/history/${accountId}`, {
    headers: getHeaders(),
  });