// Enhanced finance object with additional properties
const finance = {
  income: 0,
  balance: 0,
  incomes: [],
  mandatoryExpenses: [],
  confirmedMandatoryExpenses: [],
  otherExpenses: [],
  savings: 0,
  currentUser: null,
  goals: [],
  preferences: {
    currency: 'birr',
    theme: 'light'
  },
  createdAt: new Date().toISOString()
};

// Toast Notification System
function showToast(message, type = 'info', title = '', duration = 4000) {
  const toastContainer = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'info-circle';
  switch(type) {
    case 'success': icon = 'check-circle'; break;
    case 'error': icon = 'exclamation-circle'; break;
    case 'warning': icon = 'exclamation-triangle'; break;
    default: icon = 'info-circle';
  }
  
  if (!title) {
    switch(type) {
      case 'success': title = 'Success'; break;
      case 'error': title = 'Error'; break;
      case 'warning': title = 'Warning'; break;
      default: title = 'Information';
    }
  }
  
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas fa-${icon}"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.classList.add('hide')">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 10);
  
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('hide');
      setTimeout(() => {
        if (toast.parentElement) toastContainer.removeChild(toast);
      }, 300);
    }
  }, duration);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
  const loggedInUser = sessionStorage.getItem('userLoggedIn');
  if (loggedInUser) {
    const username = sessionStorage.getItem('currentUser');
    finance.currentUser = username;
    document.getElementById('usernameDisplay').textContent = username;
    document.getElementById('userAvatar').textContent = username.charAt(0).toUpperCase();
    toggleVisibility('financeApp');
    document.getElementById('appHeader').classList.remove('hidden');
    updateDashboard();
  } else {
    toggleVisibility('home');
  }

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('incomeDate').value = today;
  document.getElementById('mandatoryDueDate').value = today;
  document.getElementById('otherDate').value = today;
});

// Function to toggle visibility of sections
function toggleVisibility(sectionId) {
  const sections = ["home", "signup", "login", "financeApp"];
  sections.forEach(id => {
    const section = document.getElementById(id);
    if (id === sectionId) {
      section.classList.remove("hidden");
    } else {
      section.classList.add("hidden");
    }
  });
}

// Modal functions
function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    if (event.target === modal) modal.classList.remove('active');
  });
};

// Show error message
function showError(message, type = 'login') {
  const errorElement = document.getElementById(type + 'Error');
  errorElement.textContent = message;
  setTimeout(() => errorElement.textContent = '', 5000);
}

// About FinFlow
function showAbout() {
  openModal('aboutModal');
}

// Sign-Up Functionality
function signUp() {
  const username = document.getElementById("signupUsername").value.trim();
  const password = document.getElementById("signupPassword").value;
  const email = document.getElementById("signupEmail").value.trim();

  if (!username || !password) {
    showError("Please enter both username and password.", 'signup');
    showToast("Please enter both username and password.", "error", "Sign Up Failed");
    return;
  }

  if (password.length < 6) {
    showError("Password must be at least 6 characters long.", 'signup');
    showToast("Password must be at least 6 characters long.", "warning", "Weak Password");
    return;
  }

  if (localStorage.getItem(`user_${username}`)) {
    showError("Username already exists. Please choose a different username.", 'signup');
    showToast("Username already exists. Please choose a different username.", "error", "Username Taken");
    return;
  }

  const user = { username, password, email, createdAt: new Date().toISOString() };
  localStorage.setItem(`user_${username}`, JSON.stringify(user));
  
  const userFinance = { ...finance };
  userFinance.currentUser = username;
  localStorage.setItem(`finance_${username}`, JSON.stringify(userFinance));
  
  showToast("Account created successfully! Please log in.", "success", "Welcome!");
  toggleVisibility('login');
  document.getElementById('signupUsername').value = '';
  document.getElementById('signupPassword').value = '';
  document.getElementById('signupEmail').value = '';
}

// Login Functionality
function logIn() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!username || !password) {
    showError("Please enter both username and password.", 'login');
    showToast("Please enter both username and password.", "error", "Login Failed");
    return;
  }

  const userData = localStorage.getItem(`user_${username}`);
  if (!userData) {
    showError("User not found. Please sign up first.", 'login');
    showToast("User not found. Please sign up first.", "error", "Login Failed");
    return;
  }

  const user = JSON.parse(userData);
  if (user.password !== password) {
    showError("Invalid password. Please try again.", 'login');
    showToast("Invalid password. Please try again.", "error", "Login Failed");
    return;
  }

  finance.currentUser = username;
  document.getElementById('usernameDisplay').textContent = username;
  document.getElementById('userAvatar').textContent = username.charAt(0).toUpperCase();
  
  const userFinanceData = localStorage.getItem(`finance_${username}`);
  if (userFinanceData) {
    const userFinance = JSON.parse(userFinanceData);
    Object.assign(finance, userFinance);
  }
  
  sessionStorage.setItem('userLoggedIn', true);
  sessionStorage.setItem('currentUser', username);
  document.getElementById('appHeader').classList.remove('hidden');
  toggleVisibility('financeApp');
  updateDashboard();
  
  document.getElementById('loginUsername').value = '';
  document.getElementById('loginPassword').value = '';
  showToast(`Welcome back, ${username}!`, "success", "Login Successful");
}

// Logout Functionality
function logout() {
  localStorage.setItem(`finance_${finance.currentUser}`, JSON.stringify(finance));
  sessionStorage.removeItem('userLoggedIn');
  sessionStorage.removeItem('currentUser');
  finance.currentUser = null;
  document.getElementById('appHeader').classList.add('hidden');
  toggleVisibility('home');
  showToast("You have been logged out successfully.", "info", "Goodbye!");
}

// Add Income Functionality
function addIncome() {
  const source = document.getElementById("incomeSource").value.trim();
  const amount = parseFloat(document.getElementById("incomeAmount").value);
  const date = document.getElementById("incomeDate").value;

  if (!source || isNaN(amount) || amount <= 0) {
    showToast("Please enter valid income details.", "error", "Invalid Input");
    return;
  }

  const income = { source, amount, date, id: Date.now(), type: 'income' };
  finance.incomes.push(income);
  finance.income += amount;
  finance.balance += amount;
  
  closeModal('incomeModal');
  updateDashboard();
  document.getElementById("incomeSource").value = '';
  document.getElementById("incomeAmount").value = '';
  showToast(`Added ${amount.toFixed(2)} birr from ${source}`, "success", "Income Added");
}

// Plan Mandatory Expense
function planMandatoryExpense() {
  const category = document.getElementById("mandatoryCategory").value.trim();
  const amount = parseFloat(document.getElementById("mandatoryAmount").value);
  const dueDate = document.getElementById("mandatoryDueDate").value;

  if (!category || isNaN(amount) || amount <= 0) {
    showToast("Please enter valid expense details.", "error", "Invalid Input");
    return;
  }

  const expense = { category, amount, dueDate, id: Date.now(), type: 'planned' };
  finance.mandatoryExpenses.push(expense);
  closeModal('mandatoryExpenseModal');
  updateDashboard();
  document.getElementById("mandatoryCategory").value = '';
  document.getElementById("mandatoryAmount").value = '';
  showToast(`Planned ${amount.toFixed(2)} birr for ${category}`, "info", "Expense Planned");
}

// Confirm Mandatory Expense
function confirmMandatoryExpense() {
  if (finance.mandatoryExpenses.length === 0) {
    showToast("No planned mandatory expenses to confirm!", "warning", "Nothing to Confirm");
    return;
  }

  let message = "Select a planned expense to confirm:\n\n";
  finance.mandatoryExpenses.forEach((expense, index) => {
    message += `${index + 1}. ${expense.category}: ${expense.amount.toFixed(2)} birr (Due: ${expense.dueDate})\n`;
  });

  const choice = parseInt(prompt(message));
  if (isNaN(choice) || choice < 1 || choice > finance.mandatoryExpenses.length) {
    showToast("Invalid choice. Please try again.", "error", "Selection Error");
    return;
  }

  const selectedExpense = finance.mandatoryExpenses[choice - 1];
  if (selectedExpense.amount > finance.balance) {
    showToast("Insufficient balance to confirm this expense.", "error", "Insufficient Funds");
    return;
  }

  const confirmedExpense = { ...selectedExpense, type: 'confirmed', confirmedDate: new Date().toISOString().split('T')[0] };
  finance.confirmedMandatoryExpenses.push(confirmedExpense);
  finance.balance -= selectedExpense.amount;
  finance.mandatoryExpenses.splice(choice - 1, 1);
  updateDashboard();
  showToast(`Confirmed ${selectedExpense.amount.toFixed(2)} birr for ${selectedExpense.category}`, "success", "Expense Confirmed");
}

// Add Other Expense
function addOtherExpense() {
  const category = document.getElementById("otherCategory").value.trim();
  const amount = parseFloat(document.getElementById("otherAmount").value);
  const date = document.getElementById("otherDate").value;

  if (!category || isNaN(amount) || amount <= 0) {
    showToast("Please enter valid expense details.", "error", "Invalid Input");
    return;
  }

  if (amount > finance.balance) {
    showToast("Insufficient balance for this expense.", "error", "Insufficient Funds");
    return;
  }

  const expense = { category, amount, date, id: Date.now(), type: 'other' };
  finance.otherExpenses.push(expense);
  finance.balance -= amount;
  closeModal('otherExpenseModal');
  updateDashboard();
  document.getElementById("otherCategory").value = '';
  document.getElementById("otherAmount").value = '';
  showToast(`Added ${amount.toFixed(2)} birr expense for ${category}`, "info", "Expense Added");
}

// Update Dashboard
function updateDashboard() {
  document.getElementById('currentBalance').textContent = finance.balance.toFixed(2) + ' birr';
  
  const totalIncome = finance.incomes.reduce((sum, income) => sum + income.amount, 0);
  document.getElementById('totalIncome').textContent = totalIncome.toFixed(2);
  
  const totalConfirmed = finance.confirmedMandatoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalOther = finance.otherExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalExpenses = totalConfirmed + totalOther;
  document.getElementById('totalExpenses').textContent = totalExpenses.toFixed(2);
  
  const savings = totalIncome - totalExpenses;
  document.getElementById('savings').textContent = savings.toFixed(2);
  finance.savings = savings;
  
  updateRecentTransactions();
  updateGoals();
  
  if (finance.currentUser) {
    localStorage.setItem(`finance_${finance.currentUser}`, JSON.stringify(finance));
  }
}

// Update Recent Transactions
function updateRecentTransactions() {
  const container = document.getElementById('recentTransactions');
  container.innerHTML = '';
  
  const allTransactions = [
    ...finance.incomes.map(t => ({...t, transactionType: 'income'})),
    ...finance.confirmedMandatoryExpenses.map(t => ({...t, transactionType: 'mandatory'})),
    ...finance.otherExpenses.map(t => ({...t, transactionType: 'other'}))
  ];
  
  allTransactions.sort((a, b) => {
    const dateA = a.date || a.confirmedDate || a.dueDate;
    const dateB = b.date || b.confirmedDate || b.dueDate;
    return new Date(dateB) - new Date(dateA);
  });
  
  const recentTransactions = allTransactions.slice(0, 5);
  
  if (recentTransactions.length === 0) {
    container.innerHTML = `
      <li class="transaction-item">
        <div class="transaction-info">
          <div class="transaction-icon stat-income">
            <i class="fas fa-money-bill-wave"></i>
          </div>
          <div class="transaction-details">
            <h4>No transactions yet</h4>
            <p>Add your first transaction to see it here</p>
          </div>
        </div>
      </li>
    `;
    return;
  }
  
  recentTransactions.forEach(transaction => {
    const isIncome = transaction.transactionType === 'income';
    const item = document.createElement('li');
    item.className = 'transaction-item';
    
    item.innerHTML = `
      <div class="transaction-info">
        <div class="transaction-icon ${isIncome ? 'stat-income' : 'stat-expense'}">
          <i class="fas ${isIncome ? 'fa-money-bill-wave' : 'fa-shopping-cart'}"></i>
        </div>
        <div class="transaction-details">
          <h4>${transaction.source || transaction.category}</h4>
          <p>${transaction.date || transaction.confirmedDate || transaction.dueDate}</p>
        </div>
      </div>
      <div class="transaction-amount ${isIncome ? 'transaction-income' : 'transaction-expense'}">
        ${isIncome ? '+' : '-'} ${transaction.amount.toFixed(2)} birr
      </div>
    `;
    
    container.appendChild(item);
  });
}

// Simple Goals Management
function addGoal() {
  const title = document.getElementById("goalTitle").value.trim();
  const target = parseFloat(document.getElementById("goalTarget").value);

  if (!title || isNaN(target) || target <= 0) {
    showToast("Please enter valid goal details.", "error", "Invalid Input");
    return;
  }

  const goal = { title, target, id: Date.now(), saved: 0 };
  finance.goals.push(goal);
  updateGoals();
  closeModal('goalsModal');
  document.getElementById("goalTitle").value = '';
  document.getElementById("goalTarget").value = '';
  showToast(`Goal "${title}" set!`, "success", "Goal Added");
}





function updateGoals() {
  const container = document.getElementById('goalsContainer');
  if (finance.goals.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-bullseye"></i>
        <h3>No Goals Set</h3>
        <p>Set simple financial goals to stay motivated</p>
        <button class="btn btn-primary" onclick="openModal('goalsModal')">
          <i class="fas fa-bullseye"></i> Set Goal
        </button>
      </div>
    `;
    return;
  }

  let goalsHTML = '';
  finance.goals.forEach(goal => {
    const percentage = Math.min((goal.saved / goal.target) * 100, 100);
    goalsHTML += `
      <div class="goal-item" style="background: var(--gray-lighter); padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid var(--success);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <strong>${goal.title}</strong>
          <span>${goal.saved.toFixed(2)} / ${goal.target.toFixed(2)} birr</span>
        </div>
        <div style="background: var(--gray-light); height: 6px; border-radius: 3px; overflow: hidden;">
          <div style="background: var(--success); height: 100%; width: ${percentage}%; transition: width 0.3s ease;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 0.8rem; color: var(--gray);">
          <span>Progress</span>
          <span>${percentage.toFixed(1)}%</span>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = goalsHTML;
}

// Search and Filter
function filterTransactions() {
  const searchTerm = document.getElementById('transactionSearch').value.toLowerCase();
  const transactions = document.querySelectorAll('#recentTransactions .transaction-item');
  transactions.forEach(transaction => {
    const text = transaction.textContent.toLowerCase();
    transaction.style.display = text.includes(searchTerm) ? 'flex' : 'none';
  });
}

// Data Export
function exportData(format) {
  let data = { finances: finance, exportedAt: new Date().toISOString() };
  let content, mimeType, filename;
  
  if (format === 'csv') {
    content = generateCSV();
    mimeType = 'text/csv';
    filename = `finflow-export-${new Date().toISOString().split('T')[0]}.csv`;
  } else {
    content = JSON.stringify(data, null, 2);
    mimeType = 'application/json';
    filename = `finflow-export-${new Date().toISOString().split('T')[0]}.json`;
  }
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Data exported as ${format.toUpperCase()}`, "success", "Export Complete");
}

function generateCSV() {
  let csv = 'Type,Category,Amount,Date\n';
  finance.incomes.forEach(income => csv += `Income,${income.source},${income.amount},${income.date}\n`);
  finance.otherExpenses.forEach(expense => csv += `Expense,${expense.category},${expense.amount},${expense.date}\n`);
  finance.confirmedMandatoryExpenses.forEach(expense => csv += `Mandatory Expense,${expense.category},${expense.amount},${expense.confirmedDate}\n`);
  return csv;
}

function generateExport() { exportData('csv'); }

// View Summary
function viewSummary() {
  const totalIncome = finance.incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalPlanned = finance.mandatoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalConfirmed = finance.confirmedMandatoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalOther = finance.otherExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalExpenses = totalConfirmed + totalOther;
  const savings = totalIncome - totalExpenses;

  let summaryHTML = `
    <div class="summary-header">
      <h2 class="summary-title">Complete Financial Overview</h2>
      <p class="summary-subtitle">As of ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="summary-grid">
      <div class="summary-card income">
        <h3>${totalIncome.toFixed(2)}</h3>
        <p>Total Income</p>
      </div>
      <div class="summary-card expenses">
        <h3>${totalExpenses.toFixed(2)}</h3>
        <p>Total Expenses</p>
      </div>
      <div class="summary-card balance">
        <h3>${finance.balance.toFixed(2)}</h3>
        <p>Current Balance</p>
      </div>
      <div class="summary-card savings">
        <h3>${savings.toFixed(2)}</h3>
        <p>Total Savings</p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <div class="summary-section">
        <h3 class="summary-section-title">
          <i class="fas fa-money-bill-wave" style="margin-right: 8px;"></i>
          Income Details
        </h3>
  `;

  if (finance.incomes.length > 0) {
    finance.incomes.forEach((income, index) => {
      summaryHTML += `
        <div class="transaction-item">
          <div class="transaction-info">
            <div class="transaction-icon stat-income">
              <i class="fas fa-money-bill-wave"></i>
            </div>
            <div class="transaction-details">
              <h4>${income.source}</h4>
              <p>${income.date}</p>
            </div>
          </div>
          <div class="transaction-amount transaction-income">
            + ${income.amount.toFixed(2)} birr
          </div>
        </div>
      `;
    });
  } else {
    summaryHTML += `
      <div class="empty-state">
        <i class="fas fa-money-bill-wave"></i>
        <p>No income recorded yet</p>
      </div>
    `;
  }

  summaryHTML += `
      </div>
      
      <div class="summary-section">
        <h3 class="summary-section-title">
          <i class="fas fa-chart-pie" style="margin-right: 8px;"></i>
          Expense Breakdown
        </h3>
        
        <h4 style="margin: 12px 0 8px; color: var(--warning); font-size: 0.95rem;">
          <i class="fas fa-clipboard-list" style="margin-right: 5px;"></i>
          Planned Expenses
        </h4>
  `;

  if (finance.mandatoryExpenses.length > 0) {
    finance.mandatoryExpenses.forEach((expense, index) => {
      summaryHTML += `
        <div class="transaction-item">
          <div class="transaction-info">
            <div class="transaction-icon stat-expense">
              <i class="fas fa-clock"></i>
            </div>
            <div class="transaction-details">
              <h4>${expense.category}</h4>
              <p>Due: ${expense.dueDate}</p>
            </div>
          </div>
          <div class="transaction-amount">
            ${expense.amount.toFixed(2)} birr
          </div>
        </div>
      `;
    });
  } else {
    summaryHTML += `<p style="color: var(--gray); font-style: italic; margin: 8px 0; font-size: 0.85rem;">No planned expenses</p>`;
  }

  summaryHTML += `
        <h4 style="margin: 16px 0 8px; color: var(--danger); font-size: 0.95rem;">
          <i class="fas fa-check-circle" style="margin-right: 5px;"></i>
          Confirmed Expenses
        </h4>
  `;

  if (finance.confirmedMandatoryExpenses.length > 0) {
    finance.confirmedMandatoryExpenses.forEach((expense, index) => {
      summaryHTML += `
        <div class="transaction-item">
          <div class="transaction-info">
            <div class="transaction-icon stat-expense">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="transaction-details">
              <h4>${expense.category}</h4>
              <p>Paid: ${expense.confirmedDate}</p>
            </div>
          </div>
          <div class="transaction-amount transaction-expense">
            - ${expense.amount.toFixed(2)} birr
          </div>
        </div>
      `;
    });
  } else {
    summaryHTML += `<p style="color: var(--gray); font-style: italic; margin: 8px 0; font-size: 0.85rem;">No confirmed expenses</p>`;
  }

  summaryHTML += `
        <h4 style="margin: 16px 0 8px; color: var(--danger); font-size: 0.95rem;">
          <i class="fas fa-shopping-cart" style="margin-right: 5px;"></i>
          Other Expenses
        </h4>
  `;

  if (finance.otherExpenses.length > 0) {
    finance.otherExpenses.forEach((expense, index) => {
      summaryHTML += `
        <div class="transaction-item">
          <div class="transaction-info">
            <div class="transaction-icon stat-expense">
              <i class="fas fa-shopping-cart"></i>
            </div>
            <div class="transaction-details">
              <h4>${expense.category}</h4>
              <p>${expense.date}</p>
            </div>
          </div>
          <div class="transaction-amount transaction-expense">
            - ${expense.amount.toFixed(2)} birr
          </div>
        </div>
      `;
    });
  } else {
    summaryHTML += `<p style="color: var(--gray); font-style: italic; margin: 8px 0; font-size: 0.85rem;">No other expenses</p>`;
  }

  summaryHTML += `
      </div>
    </div>

    <div class="card" style="margin-top: 20px; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); color: white; text-align: center;">
      <h3 style="margin-bottom: 8px; font-size: 1.1rem;">Available Balance</h3>
      <div style="font-size: 1.6rem; font-weight: 700;">${finance.balance.toFixed(2)} birr</div>
      <p style="opacity: 0.9; margin-top: 8px; font-size: 0.9rem;">Ready for your next financial move</p>
    </div>
  `;

  document.getElementById('summaryContent').innerHTML = summaryHTML;
  openModal('summaryModal');
  showToast("Financial summary opened", "info", "Summary Ready");
}

// Show transaction history
function showTransactionHistory() {
  const historyContent = document.getElementById('historyContent');
  const allTransactions = [
    ...finance.incomes.map(t => ({...t, transactionType: 'income'})),
    ...finance.mandatoryExpenses.map(t => ({...t, transactionType: 'planned'})),
    ...finance.confirmedMandatoryExpenses.map(t => ({...t, transactionType: 'confirmed'})),
    ...finance.otherExpenses.map(t => ({...t, transactionType: 'other'}))
  ];
  
  allTransactions.sort((a, b) => {
    const dateA = a.date || a.confirmedDate || a.dueDate;
    const dateB = b.date || b.confirmedDate || b.dueDate;
    return new Date(dateB) - new Date(dateA);
  });
  
  if (allTransactions.length === 0) {
    historyContent.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 20px;">No transactions recorded yet.</p>';
    return;
  }
  
  let historyHTML = '<ul class="transaction-list">';
  allTransactions.forEach(transaction => {
    let icon, typeClass, sign;
    switch(transaction.transactionType) {
      case 'income': icon = 'fa-money-bill-wave'; typeClass = 'transaction-income'; sign = '+'; break;
      case 'planned': icon = 'fa-clipboard-list'; typeClass = ''; sign = ''; break;
      case 'confirmed': icon = 'fa-check-circle'; typeClass = 'transaction-expense'; sign = '-'; break;
      case 'other': icon = 'fa-shopping-cart'; typeClass = 'transaction-expense'; sign = '-'; break;
    }
    
    historyHTML += `
      <li class="transaction-item">
        <div class="transaction-info">
          <div class="transaction-icon ${transaction.transactionType === 'income' ? 'stat-income' : 'stat-expense'}">
            <i class="fas ${icon}"></i>
          </div>
          <div class="transaction-details">
            <h4>${transaction.source || transaction.category}</h4>
            <p>${transaction.date || transaction.confirmedDate || transaction.dueDate} • ${transaction.transactionType.charAt(0).toUpperCase() + transaction.transactionType.slice(1)}</p>
          </div>
        </div>
        <div class="transaction-amount ${typeClass}">
          ${sign} ${transaction.amount.toFixed(2)} birr
        </div>
      </li>
    `;
  });
  historyHTML += '</ul>';
  historyContent.innerHTML = historyHTML;
}

// Update the openModal function
const originalOpenModal = openModal;
openModal = function(modalId) {
  if (modalId === 'historyModal') showTransactionHistory();
  originalOpenModal(modalId);
};