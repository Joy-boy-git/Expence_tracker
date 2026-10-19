// Multi-Profile & State Management
let currentMobile = localStorage.getItem('currentActiveMobile') || null;
let userProfiles = JSON.parse(localStorage.getItem('spideyUserProfiles')) || {};

let transactions = [];
let monthlyBudget = 25000;
let totalSavingsAllocated = 0;
let currentType = 'expense';
let authMode = 'login'; // 'login', 'signup', 'forgot'

// Categories Configuration
const categories = {
  expense: ['Food & Dining', 'Housing', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Health', 'Education', 'Savings Allocation', 'Other Expense'],
  income: ['Salary', 'Freelance', 'Investments', 'Business', 'Gifts', 'Other Income']
};

const categoryColors = {
  'Food & Dining': '#f59e0b',
  'Housing': '#ef4444',
  'Transport': '#3b82f6',
  'Utilities': '#10b981',
  'Entertainment': '#8b5cf6',
  'Shopping': '#ec4899',
  'Health': '#06b6d4',
  'Education': '#6366f1',
  'Savings Allocation': '#6366f1',
  'Other Expense': '#64748b',
  'Salary': '#10b981',
  'Freelance': '#14b8a6',
  'Investments': '#3b82f6',
  'Business': '#8b5cf6',
  'Gifts': '#f43f5e',
  'Other Income': '#94a3b8'
};

// DOM Elements
const authModal = document.getElementById('authModal');
const authCloseBtn = document.getElementById('authCloseBtn');
const authTitle = document.getElementById('authTitle');
const authSubtitle = document.getElementById('authSubtitle');
const authTabs = document.getElementById('authTabs');
const quickProfileSection = document.getElementById('quickProfileSection');
const quickProfileSelect = document.getElementById('quickProfileSelect');
const nameFieldGroup = document.getElementById('nameFieldGroup');
const pinFieldGroup = document.getElementById('pinFieldGroup');
const authName = document.getElementById('authName');
const authMobile = document.getElementById('authMobile');
const authPin = document.getElementById('authPin');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const forgotPinBtn = document.getElementById('forgotPinBtn');
const backToLoginBtn = document.getElementById('backToLoginBtn');

const profileModal = document.getElementById('profileModal');
const profileAvatarInitial = document.getElementById('profileAvatarInitial');
const modalProfileName = document.getElementById('modalProfileName');
const modalProfileMobile = document.getElementById('modalProfileMobile');
const modalProfileBudget = document.getElementById('modalProfileBudget');
const modalProfileSavings = document.getElementById('modalProfileSavings');
const modalProfileEntries = document.getElementById('modalProfileEntries');
const profileDisplayName = document.getElementById('profileDisplayName');

const transactionForm = document.getElementById('transactionForm');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const dateInput = document.getElementById('date');
const categorySelect = document.getElementById('category');
const typeExpenseBtn = document.getElementById('typeExpenseBtn');
const typeIncomeBtn = document.getElementById('typeIncomeBtn');

const totalBalanceEl = document.getElementById('totalBalance');
const totalSavingsEl = document.getElementById('totalSavings');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');
const budgetSpentEl = document.getElementById('budgetSpent');
const budgetLimitEl = document.getElementById('budgetLimit');
const budgetProgressBar = document.getElementById('budgetProgressBar');
const budgetText = document.getElementById('budgetText');
const editBudgetBtn = document.getElementById('editBudgetBtn');

const budgetAlert = document.getElementById('budgetAlert');
const alertIcon = document.getElementById('alertIcon');
const alertTitle = document.getElementById('alertTitle');
const alertDesc = document.getElementById('alertDesc');

const filterType = document.getElementById('filterType');
const filterCategory = document.getElementById('filterCategory');
const filterMonth = document.getElementById('filterMonth');
const searchInput = document.getElementById('searchInput');
const transactionList = document.getElementById('transactionList');
const exportBtn = document.getElementById('exportBtn');
const resetBtn = document.getElementById('resetBtn');

let categoryChartInstance = null;
let trendChartInstance = null;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  dateInput.value = new Date().toISOString().split('T')[0];
  const today = new Date();
  filterMonth.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  checkAuthStatus();

  // Event Listeners
  typeExpenseBtn.addEventListener('click', () => setType('expense'));
  typeIncomeBtn.addEventListener('click', () => setType('income'));
  transactionForm.addEventListener('submit', handleFormSubmit);
  
  filterType.addEventListener('change', updateUI);
  filterCategory.addEventListener('change', updateUI);
  filterMonth.addEventListener('change', updateUI);
  searchInput.addEventListener('input', updateUI);
  
  editBudgetBtn.addEventListener('click', handleEditBudget);
  exportBtn.addEventListener('click', exportToCSV);
  resetBtn.addEventListener('click', resetAllData);
});

// --- AUTHENTICATION & PROFILE SYSTEM ---
function refreshProfilesFromStorage() {
  userProfiles = JSON.parse(localStorage.getItem('spideyUserProfiles')) || {};
}

function checkAuthStatus() {
  refreshProfilesFromStorage();
  if (!currentMobile || !userProfiles[currentMobile]) {
    authCloseBtn.classList.add('hidden');
    authModal.classList.remove('hidden');
    populateQuickProfilesDropdown();
    switchAuthTab('login');
  } else {
    authModal.classList.add('hidden');
    loadUserData();
    populateCategoryOptions();
    populateFilterCategories();
    updateUI();
  }
}

// Open Profile Overview Modal
function openProfileModal() {
  refreshProfilesFromStorage();
  const user = userProfiles[currentMobile];
  if (!user) return;

  profileAvatarInitial.textContent = user.name ? user.name.charAt(0).toUpperCase() : 'H';
  modalProfileName.textContent = user.name || 'Hero';
  modalProfileMobile.textContent = `+91 ${currentMobile}`;
  modalProfileBudget.textContent = formatCurrency(user.monthlyBudget || 25000);
  modalProfileSavings.textContent = formatCurrency(user.totalSavingsAllocated || 0);
  modalProfileEntries.textContent = `${user.transactions ? user.transactions.length : 0} Recorded Entries`;

  profileModal.classList.remove('hidden');
}

function closeProfileModal() {
  profileModal.classList.add('hidden');
}

function openAuthForSwitching() {
  closeProfileModal();
  authCloseBtn.classList.remove('hidden'); // Show close button so user can back out
  authModal.classList.remove('hidden');
  populateQuickProfilesDropdown();
  switchAuthTab('login');
}

function closeAuthModal() {
  if (currentMobile && userProfiles[currentMobile]) {
    authModal.classList.add('hidden');
  }
}

function populateQuickProfilesDropdown() {
  refreshProfilesFromStorage();
  const keys = Object.keys(userProfiles);
  if (keys.length > 0) {
    quickProfileSection.classList.remove('hidden');
    quickProfileSelect.innerHTML = '<option value="">-- Select Saved Profile --</option>';
    keys.forEach(mob => {
      const p = userProfiles[mob];
      const opt = document.createElement('option');
      opt.value = mob;
      opt.textContent = `${p.name} (+91 ${mob})`;
      quickProfileSelect.appendChild(opt);
    });
  } else {
    quickProfileSection.classList.add('hidden');
  }
}

function quickSelectProfile(mobile) {
  if (!mobile) return;
  authMobile.value = mobile;
  authPin.value = '';
  authPin.focus();
}

function switchAuthTab(mode) {
  authMode = mode;
  authMobile.value = '';
  authPin.value = '';
  authName.value = '';

  if (mode === 'login') {
    authTitle.textContent = "Welcome Back, Hero!";
    authSubtitle.textContent = "Select your profile or enter mobile & PIN";
    authTabs.classList.remove('hidden');
    nameFieldGroup.classList.add('hidden');
    pinFieldGroup.classList.remove('hidden');
    forgotPinBtn.classList.remove('hidden');
    backToLoginBtn.classList.add('hidden');
    authSubmitBtn.textContent = "Access Vault";
    
    document.getElementById('tabLoginBtn').className = "py-2 text-xs font-bold rounded-lg bg-red-600 text-white transition shadow";
    document.getElementById('tabSignupBtn').className = "py-2 text-xs font-bold rounded-lg text-slate-400 hover:text-white transition";
    populateQuickProfilesDropdown();
  } else if (mode === 'signup') {
    authTitle.textContent = "Create Spidey Profile";
    authSubtitle.textContent = "New user? Set up your personal finance vault";
    authTabs.classList.remove('hidden');
    quickProfileSection.classList.add('hidden');
    nameFieldGroup.classList.remove('hidden');
    pinFieldGroup.classList.remove('hidden');
    forgotPinBtn.classList.add('hidden');
    backToLoginBtn.classList.add('hidden');
    authSubmitBtn.textContent = "Create Profile & Start";
    authName.required = true;

    document.getElementById('tabSignupBtn').className = "py-2 text-xs font-bold rounded-lg bg-blue-600 text-white transition shadow";
    document.getElementById('tabLoginBtn').className = "py-2 text-xs font-bold rounded-lg text-slate-400 hover:text-white transition";
  } else if (mode === 'forgot') {
    authTitle.textContent = "Reset PIN / Password";
    authSubtitle.textContent = "Enter your registered mobile & set a new PIN";
    authTabs.classList.add('hidden');
    quickProfileSection.classList.add('hidden');
    nameFieldGroup.classList.add('hidden');
    pinFieldGroup.classList.remove('hidden');
    forgotPinBtn.classList.add('hidden');
    backToLoginBtn.classList.remove('hidden');
    authSubmitBtn.textContent = "Update New PIN";
  }
}

function switchToForgotPin() {
  switchAuthTab('forgot');
}

function handleAuthSubmit(e) {
  e.preventDefault();
  refreshProfilesFromStorage();

  const mobile = authMobile.value.trim();
  const pin = authPin.value.trim();
  const name = authName.value.trim();

  if (mobile.length !== 10) {
    alert("Please enter a valid 10-digit mobile number.");
    return;
  }

  if (authMode === 'signup') {
    if (userProfiles[mobile]) {
      alert("This mobile number is already registered! Please log in.");
      switchAuthTab('login');
      authMobile.value = mobile;
      return;
    }
    userProfiles[mobile] = {
      name: name || "Hero",
      pin: pin,
      monthlyBudget: 25000,
      totalSavingsAllocated: 5000,
      transactions: [
        { id: 1, type: 'income', description: 'Monthly Stipend', amount: 35000, category: 'Salary', date: new Date().toISOString().split('T')[0] },
        { id: 2, type: 'expense', description: 'Web fluid supplies', amount: 1200, category: 'Shopping', date: new Date().toISOString().split('T')[0] }
      ]
    };
    saveProfilesToStorage();
    loginUser(mobile);
  } else if (authMode === 'login') {
    if (!userProfiles[mobile]) {
      alert("Mobile number not found. Please Sign Up first!");
      switchAuthTab('signup');
      authMobile.value = mobile;
      return;
    }
    if (userProfiles[mobile].pin !== pin) {
      alert("Incorrect PIN or Password! Try again or click Forgot PIN.");
      return;
    }
    loginUser(mobile);
  } else if (authMode === 'forgot') {
    if (!userProfiles[mobile]) {
      alert("Mobile number not registered.");
      return;
    }
    userProfiles[mobile].pin = pin;
    saveProfilesToStorage();
    alert("PIN successfully reset! Please login with your new PIN.");
    switchAuthTab('login');
  }
}

function loginUser(mobile) {
  currentMobile = mobile;
  localStorage.setItem('currentActiveMobile', mobile);
  authModal.classList.add('hidden');
  checkAuthStatus();
}

function logoutProfile() {
  currentMobile = null;
  localStorage.removeItem('currentActiveMobile');
  checkAuthStatus();
}

// --- DATA MANAGEMENT PER PROFILE ---
function loadUserData() {
  refreshProfilesFromStorage();
  const user = userProfiles[currentMobile];
  if (!user) {
    logoutProfile();
    return;
  }
  profileDisplayName.textContent = user.name;
  monthlyBudget = user.monthlyBudget || 25000;
  totalSavingsAllocated = user.totalSavingsAllocated || 0;
  transactions = user.transactions || [];
}

function saveToLocalStorage() {
  if (!currentMobile) return;
  refreshProfilesFromStorage();
  userProfiles[currentMobile] = {
    ...userProfiles[currentMobile],
    monthlyBudget,
    totalSavingsAllocated,
    transactions
  };
  saveProfilesToStorage();
}

function saveProfilesToStorage() {
  localStorage.setItem('spideyUserProfiles', JSON.stringify(userProfiles));
}

// --- APP LOGIC ---
function setType(type) {
  currentType = type;
  if (type === 'expense') {
    typeExpenseBtn.className = 'type-btn active py-2.5 px-4 rounded-xl border border-red-500/50 bg-red-500/20 text-red-300 font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
    typeIncomeBtn.className = 'type-btn py-2.5 px-4 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-400 font-bold text-sm flex items-center justify-center gap-2';
  } else {
    typeIncomeBtn.className = 'type-btn active py-2.5 px-4 rounded-xl border border-emerald-500/50 bg-emerald-500/20 text-emerald-300 font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
    typeExpenseBtn.className = 'type-btn py-2.5 px-4 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-400 font-bold text-sm flex items-center justify-center gap-2';
  }
  populateCategoryOptions();
}

function populateCategoryOptions() {
  categorySelect.innerHTML = '';
  categories[currentType].forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

function populateFilterCategories() {
  const allCats = [...categories.expense, ...categories.income];
  filterCategory.innerHTML = '<option value="all">All Categories</option>';
  allCats.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    filterCategory.appendChild(option);
  });
}

function handleFormSubmit(e) {
  e.preventDefault();
  const newTransaction = {
    id: Date.now(),
    type: currentType,
    description: descriptionInput.value.trim(),
    amount: parseFloat(amountInput.value),
    category: categorySelect.value,
    date: dateInput.value
  };

  transactions.unshift(newTransaction);
  saveToLocalStorage();
  updateUI();

  descriptionInput.value = '';
  amountInput.value = '';
  descriptionInput.focus();
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveToLocalStorage();
  updateUI();
}

function handleEditBudget() {
  const newLimit = prompt('Enter your new monthly budget limit (₹):', monthlyBudget);
  if (newLimit !== null && !isNaN(newLimit) && parseFloat(newLimit) > 0) {
    monthlyBudget = parseFloat(newLimit);
    saveToLocalStorage();
    updateUI();
  }
}

function editSavingsAllocation() {
  const newSavings = prompt('Enter your separated total savings amount (₹):', totalSavingsAllocated);
  if (newSavings !== null && !isNaN(newSavings) && parseFloat(newSavings) >= 0) {
    totalSavingsAllocated = parseFloat(newSavings);
    saveToLocalStorage();
    updateUI();
  }
}

function getFilteredTransactions() {
  const selectedType = filterType.value;
  const selectedCategory = filterCategory.value;
  const selectedMonth = filterMonth.value;
  const searchTerm = searchInput.value.toLowerCase().trim();

  return transactions.filter(t => {
    const matchesType = selectedType === 'all' || t.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesMonth = !selectedMonth || t.date.startsWith(selectedMonth);
    const matchesSearch = t.description.toLowerCase().includes(searchTerm) || t.category.toLowerCase().includes(searchTerm);
    return matchesType && matchesCategory && matchesMonth && matchesSearch;
  });
}

function updateUI() {
  const filtered = getFilteredTransactions();

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netBalance = totalIncome - totalExpense - totalSavingsAllocated;

  const filteredIncome = filtered.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const filteredExpense = filtered.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  totalBalanceEl.textContent = formatCurrency(netBalance);
  totalSavingsEl.textContent = formatCurrency(totalSavingsAllocated);
  totalIncomeEl.textContent = formatCurrency(filteredIncome);
  totalExpenseEl.textContent = formatCurrency(filteredExpense);

  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const currentMonthExpenses = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(currentMonthStr))
    .reduce((acc, t) => acc + t.amount, 0);

  budgetSpentEl.textContent = formatCurrency(currentMonthExpenses);
  budgetLimitEl.textContent = `/ ${formatCurrency(monthlyBudget)}`;

  const percentage = Math.min(Math.round((currentMonthExpenses / monthlyBudget) * 100), 100);
  budgetProgressBar.style.width = `${percentage}%`;
  budgetText.textContent = `${percentage}% used`;

  if (currentMonthExpenses >= monthlyBudget) {
    budgetProgressBar.className = 'bg-red-500 h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
    budgetAlert.className = 'mb-6 p-4 rounded-xl border flex items-center justify-between transition-all duration-500 bg-red-500/10 border-red-500/40 text-red-300';
    alertIcon.className = 'fa-solid fa-triangle-exclamation text-red-400 text-xl';
    alertTitle.textContent = 'Budget Limit Exceeded!';
    alertDesc.textContent = `Spent ${formatCurrency(currentMonthExpenses)} which exceeds your limit of ${formatCurrency(monthlyBudget)}.`;
    budgetAlert.classList.remove('hidden');
  } else if (currentMonthExpenses >= monthlyBudget * 0.8) {
    budgetProgressBar.className = 'bg-amber-500 h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]';
    budgetAlert.className = 'mb-6 p-4 rounded-xl border flex items-center justify-between transition-all duration-500 bg-amber-500/10 border-amber-500/40 text-amber-300';
    alertIcon.className = 'fa-solid fa-circle-exclamation text-amber-400 text-xl';
    alertTitle.textContent = 'Warning: Approaching Budget Limit!';
    alertDesc.textContent = `You have used ${percentage}% of your monthly limit.`;
    budgetAlert.classList.remove('hidden');
  } else {
    budgetProgressBar.className = 'bg-red-500 h-2 rounded-full transition-all duration-500';
    budgetAlert.classList.add('hidden');
  }

  renderTransactionList(filtered);
  renderCharts(filtered);
}

function renderTransactionList(items) {
  transactionList.innerHTML = '';
  if (items.length === 0) {
    transactionList.innerHTML = `
      <div class="text-center py-8 text-slate-500">
        <i class="fa-solid fa-folder-open text-3xl mb-2 block"></i>
        <p class="text-xs">No records found for this profile.</p>
      </div>`;
    return;
  }

  items.forEach(t => {
    const isExpense = t.type === 'expense';
    const color = categoryColors[t.category] || '#64748b';

    const li = document.createElement('li');
    li.className = 'bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between transition-all duration-300 group animate-slide-in';

    li.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs" style="background-color: ${color}20; color: ${color};">
          <i class="fa-solid ${isExpense ? 'fa-arrow-down-long' : 'fa-arrow-up-long'}"></i>
        </div>
        <div>
          <h4 class="font-semibold text-sm text-slate-100">${escapeHtml(t.description)}</h4>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full" style="background-color: ${color}15; color: ${color}">
              ${t.category}
            </span>
            <span class="text-[11px] text-slate-500">${t.date}</span>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <span class="font-extrabold text-sm ${isExpense ? 'text-red-400' : 'text-emerald-400'}">
          ${isExpense ? '-' : '+'}${formatCurrency(t.amount)}
        </span>
        <button onclick="deleteTransaction(${t.id})" class="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition p-1" title="Delete">
          <i class="fa-solid fa-trash-can text-xs"></i>
        </button>
      </div>
    `;
    transactionList.appendChild(li);
  });
}

function renderCharts(items) {
  const expenseItems = items.filter(t => t.type === 'expense');
  const catTotals = {};
  expenseItems.forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; });

  const catLabels = Object.keys(catTotals);
  const catData = Object.values(catTotals);
  const catBgColors = catLabels.map(cat => categoryColors[cat] || '#64748b');

  const ctxCategory = document.getElementById('categoryChart').getContext('2d');
  if (categoryChartInstance) categoryChartInstance.destroy();

  categoryChartInstance = new Chart(ctxCategory, {
    type: 'doughnut',
    data: {
      labels: catLabels.length ? catLabels : ['No Expenses'],
      datasets: [{
        data: catData.length ? catData : [1],
        backgroundColor: catBgColors.length ? catBgColors : ['#334155'],
        borderWidth: 2,
        borderColor: '#1e293b'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } } },
      cutout: '70%'
    }
  });

  const ctxTrend = document.getElementById('trendChart').getContext('2d');
  if (trendChartInstance) trendChartInstance.destroy();

  const totalInc = items.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const totalExp = items.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);

  trendChartInstance = new Chart(ctxTrend, {
    type: 'bar',
    data: {
      labels: ['Income vs Expenses'],
      datasets: [
        { label: 'Income', data: [totalInc], backgroundColor: '#10b981', borderRadius: 6 },
        { label: 'Expense', data: [totalExp], backgroundColor: '#f43f5e', borderRadius: 6 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } }
      },
      plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } } }
    }
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);
}

function exportToCSV() {
  if (transactions.length === 0) {
    alert('No transactions available to export.');
    return;
  }
  let csvContent = "data:text/csv;charset=utf-8,ID,Type,Description,Amount,Category,Date\n";
  transactions.forEach(t => {
    csvContent += `"${t.id}","${t.type}","${t.description.replace(/"/g, '""')}",${t.amount},"${t.category}","${t.date}"\n`;
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `spidey_vault_${currentMobile}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function resetAllData() {
  if (confirm("Are you sure you want to reset all records for this profile?")) {
    transactions = [];
    totalSavingsAllocated = 0;
    saveToLocalStorage();
    updateUI();
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}