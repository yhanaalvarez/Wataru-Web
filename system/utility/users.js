// In-memory user data storage with auto-save to JSON
const fs = require('fs-extra');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../json/users.json');

let usersData = {
  users: {},
  gameStats: {},
  bankAccounts: {},
  leaderboard: []
};

// Load users from file on startup
async function loadUsers() {
  try {
    if (await fs.pathExists(DATA_FILE)) {
      usersData = await fs.readJson(DATA_FILE);
    }
  } catch (err) {
    console.log('Creating new users file');
  }
}

// Save users to file
async function saveUsers() {
  try {
    await fs.ensureFile(DATA_FILE);
    await fs.writeJson(DATA_FILE, usersData, { spaces: 2 });
  } catch (err) {
    console.error('Error saving users:', err);
  }
}

// Register a new user
function registerUser(username, password, email) {
  if (usersData.users[username]) {
    return { success: false, error: 'Username already exists' };
  }
  
  usersData.users[username] = {
    username,
    password, // In production, hash this!
    email,
    createdAt: new Date(),
    balance: 60, // Free bonus 60
    githubConnected: false,
    githubUsername: null
  };
  
  usersData.gameStats[username] = {
    totalWins: 0,
    totalLosses: 0,
    totalGamesPlayed: 0,
    slotsWins: 0,
    casinoWins: 0,
    bankLoans: 0,
    bankDeposits: 0
  };
  
  usersData.bankAccounts[username] = {
    balance: 60,
    deposits: [],
    loans: [],
    withdrawals: []
  };
  
  saveUsers();
  return { success: true, user: usersData.users[username] };
}

// Login user
function loginUser(username, password) {
  const user = usersData.users[username];
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  
  if (user.password !== password) {
    return { success: false, error: 'Invalid password' };
  }
  
  return { success: true, user };
}

// Get user
function getUser(username) {
  return usersData.users[username] || null;
}

// Update user balance
function updateBalance(username, amount) {
  if (usersData.users[username]) {
    usersData.users[username].balance = (usersData.users[username].balance || 0) + amount;
    usersData.bankAccounts[username].balance = usersData.users[username].balance;
    saveUsers();
    return true;
  }
  return false;
}

// Connect GitHub
function connectGitHub(username, githubUsername) {
  if (usersData.users[username]) {
    usersData.users[username].githubConnected = true;
    usersData.users[username].githubUsername = githubUsername;
    saveUsers();
    return true;
  }
  return false;
}

// Get leaderboard
function getLeaderboard() {
  return Object.values(usersData.users)
    .sort((a, b) => (b.balance || 0) - (a.balance || 0))
    .slice(0, 20)
    .map((u, idx) => ({
      rank: idx + 1,
      username: u.username,
      balance: u.balance,
      email: u.email
    }));
}

// Game stats update
function updateGameStats(username, result) {
  if (usersData.gameStats[username]) {
    usersData.gameStats[username].totalGamesPlayed++;
    if (result === 'win') usersData.gameStats[username].totalWins++;
    else usersData.gameStats[username].totalLosses++;
    saveUsers();
  }
}

module.exports = {
  loadUsers,
  saveUsers,
  registerUser,
  loginUser,
  getUser,
  updateBalance,
  connectGitHub,
  getLeaderboard,
  updateGameStats,
  usersData
};
