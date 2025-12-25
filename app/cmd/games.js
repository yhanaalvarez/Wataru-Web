const { updateBalance, getUser, updateGameStats } = require('../../system/utility/users');

module.exports = {
  name: "games",
  meta: {
    name: "games",
    description: "Gaming system with casino, slots, and banking",
    category: "Games",
    usage: "games <command>"
  },
  
  onStart() {
    return "🎮 Games system loaded!";
  },
  
  async execute(args, user) {
    if (!user) return "Please login first!";
    
    const username = user.username;
    const command = args[0]?.toLowerCase();
    
    switch(command) {
      case 'slots':
        return playSlotsGame(username);
      
      case 'casino':
        return playCasinoGame(username, args[1]);
      
      case 'flip':
        return playCoinFlip(username, args[1]);
      
      case 'dice':
        return playDice(username);
      
      case 'balance':
        const userData = getUser(username);
        return `💰 Your Balance: ${userData?.balance || 0} points\n\nUse: games slots | games casino <bet> | games flip <bet> | games dice <bet>`;
      
      case 'top':
        return getTopUsers();
      
      default:
        return `🎮 **Games Available:**\n\n👾 **slots** - Spin the slots machine\n🎰 **casino** <bet> - Casino betting\n🪙 **flip** <bet> - Coin flip\n🎲 **dice** <bet> - Dice rolling\n💰 **balance** - Check your money\n🏆 **top** - Top users leaderboard`;
    }
  }
};

function playSlotsGame(username) {
  const symbols = ['🍎', '🍊', '🍋', '💎', '🍒', '⭐', '🔔', '🎯'];
  const spin1 = symbols[Math.floor(Math.random() * symbols.length)];
  const spin2 = symbols[Math.floor(Math.random() * symbols.length)];
  const spin3 = symbols[Math.floor(Math.random() * symbols.length)];
  
  let result = `🎰 **SLOTS GAME** 🎰\n\n${spin1} | ${spin2} | ${spin3}\n\n`;
  
  if (spin1 === spin2 && spin2 === spin3) {
    const winAmount = 100;
    updateBalance(username, winAmount);
    updateGameStats(username, 'win');
    result += `🎉 **JACKPOT!** You won ${winAmount} points!`;
  } else if (spin1 === spin2 || spin2 === spin3) {
    const winAmount = 30;
    updateBalance(username, winAmount);
    updateGameStats(username, 'win');
    result += `✨ **Two Matches!** You won ${winAmount} points!`;
  } else {
    updateGameStats(username, 'loss');
    result += `😔 No matches. Better luck next time!`;
  }
  
  return result;
}

function playCasinoGame(username, bet) {
  const betAmount = parseInt(bet) || 10;
  const userData = getUser(username);
  
  if (!userData || userData.balance < betAmount) {
    return `❌ Insufficient balance! You have ${userData?.balance || 0} points`;
  }
  
  const roll = Math.random();
  let result = `🎲 **CASINO GAME** 🎲\n\nBet: ${betAmount} points\n`;
  
  if (roll > 0.6) {
    const winAmount = betAmount * 2;
    updateBalance(username, winAmount);
    updateGameStats(username, 'win');
    result += `🎉 **WIN!** You got ${winAmount} points!`;
  } else {
    updateBalance(username, -betAmount);
    updateGameStats(username, 'loss');
    result += `😔 **LOSS!** You lost ${betAmount} points.`;
  }
  
  return result;
}

function playCoinFlip(username, bet) {
  const betAmount = parseInt(bet) || 10;
  const userData = getUser(username);
  
  if (!userData || userData.balance < betAmount) {
    return `❌ Insufficient balance! You have ${userData?.balance || 0} points`;
  }
  
  const result = Math.random() > 0.5 ? 'heads' : 'tails';
  let response = `🪙 **COIN FLIP** 🪙\n\nBet: ${betAmount} points\n`;
  response += `Result: **${result.toUpperCase()}**\n`;
  
  if (Math.random() > 0.5) {
    const winAmount = betAmount * 2;
    updateBalance(username, winAmount);
    updateGameStats(username, 'win');
    response += `✨ You won ${winAmount} points!`;
  } else {
    updateBalance(username, -betAmount);
    updateGameStats(username, 'loss');
    response += `😔 You lost ${betAmount} points.`;
  }
  
  return response;
}

function playDice(username, bet) {
  const betAmount = parseInt(bet) || 10;
  const userData = getUser(username);
  
  if (!userData || userData.balance < betAmount) {
    return `❌ Insufficient balance! You have ${userData?.balance || 0} points`;
  }
  
  const roll = Math.floor(Math.random() * 6) + 1;
  let response = `🎲 **DICE ROLL** 🎲\n\nRoll: **${roll}**\n`;
  
  if (roll >= 4) {
    const winAmount = betAmount * 3;
    updateBalance(username, winAmount);
    updateGameStats(username, 'win');
    response += `🎉 You won ${winAmount} points!`;
  } else if (roll >= 2) {
    updateGameStats(username, 'loss');
    response += `😔 You lost ${betAmount} points.`;
    updateBalance(username, -betAmount);
  } else {
    updateGameStats(username, 'loss');
    response += `💀 Snake eyes! You lost ${betAmount * 2} points!`;
    updateBalance(username, -betAmount * 2);
  }
  
  return response;
}

function getTopUsers() {
  const { getLeaderboard } = require('../../system/utility/users');
  const leaders = getLeaderboard();
  
  let result = `🏆 **TOP USERS LEADERBOARD** 🏆\n\n`;
  leaders.forEach((leader, idx) => {
    const medals = ['🥇', '🥈', '🥉'];
    const medal = medals[idx] || `#${idx + 1}`;
    result += `${medal} **${leader.username}** - ${leader.balance} points\n`;
  });
  
  return result;
}
