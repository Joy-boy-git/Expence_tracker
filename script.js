// Global State
let currentMobile = localStorage.getItem('currentActiveMobile') || null;
let userProfiles = JSON.parse(localStorage.getItem('spideyUserProfiles')) || {};

let transactions = [];
let monthlyBudget = 25000;
let totalSavingsAllocated = 0;
let currentType = 'expense';
let authMode = 'login'; 

let currentSavOp = 'add'; 
let currentBudOp = 'add'; 

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
  'Savings Allocation': '#818cf8',
  'Other Expense': '#64748b',
  'Salary': '#10b981',
  'Freelance': '#14b8a6',
  'Investments': '#3b82f6',
  'Business': '#8b5cf6',
  'Gifts': '#f43f5e',
  'Other Income': '#38bdf8'
};

// DOM Cache
const authModal = document.getElementById('authModal');
const authCloseBtn = document.getElementById('authCloseBtn');
const authTitle = document.getElementById('authTitle');
const authSubtitle = document.getElementById('authSubtitle');
const authTabs = document.getElementById('authTabs');
const quickProfileSection = document.getElementById('quickProfileSection');
const quickProfileSelect = document.getElementById('quickProfileSelect');
const nameFieldGroup = document.getElementById('nameFieldGroup');
const securityFieldGroup = document.getElementById('securityFieldGroup');
const pinFieldGroup = document.getElementById('pinFieldGroup');
const pinLabel = document.getElementById('pinLabel');
const authName = document.getElementById('authName');
const authMobile = document.getElementById('authMobile');
const authSecQuestion = document.getElementById('authSecQuestion');
const authSecAnswer = document.getElementById('authSecAnswer');
const authPin = document.getElementById('authPin');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const forgotPinBtn = document.getElementById('forgotPinBtn');
const backToLoginBtn = document.getElementById('backToLoginBtn');

const savingsModal = document.getElementById('savingsModal');
const currentSavingsDisplay = document.getElementById('currentSavingsDisplay');
const savAmountInput = document.getElementById('savAmountInput');
const savAmountLabel = document.getElementById('savAmountLabel');
const savRecordTransactionGroup = document.getElementById('savRecordTransactionGroup');
const savRecordTransaction = document.getElementById('savRecordTransaction');

const budgetModal = document.getElementById('budgetModal');
const currentBudgetDisplay = document.getElementById('currentBudgetDisplay');
const budAmountInput = document.getElementById('budAmountInput');
const budAmountLabel = document.getElementById('budAmountLabel');

const editTxModal = document.getElementById('editTxModal');
const editTxId = document.getElementById('editTxId');
const editTxType = document.getElementById('editTxType');
const editTxDesc = document.getElementById('editTxDesc');
const editTxAmount = document.getElementById('editTxAmount');
const editTxDate = document.getElementById('editTxDate');
const editTxCategory = document.getElementById('editTxCategory');

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

const splitExpenseSection = document.getElementById('splitExpenseSection');
const enableSplit = document.getElementById('enableSplit');
const splitFields = document.getElementById('splitFields');
const splitFriends = document.getElementById('splitFriends');
const splitSharePreview = document.getElementById('splitSharePreview');
const splitOwedSummary = document.getElementById('splitOwedSummary');

const totalBalanceEl = document.getElementById('totalBalance');
const totalSavingsEl = document.getElementById('totalSavings');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');
const budgetSpentEl = document.getElementById('budgetSpent');
const budgetLimitEl = document.getElementById('budgetLimit');
const budgetProgressBar = document.getElementById('budgetProgressBar');
const budgetText = document.getElementById('budgetText');

const kpiSavingsRate = document.getElementById('kpiSavingsRate');
const kpiDailyAvg = document.getElementById('kpiDailyAvg');
const kpiMonthSpend = document.getElementById('kpiMonthSpend');
const kpiHealthScore = document.getElementById('kpiHealthScore');

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

let expenseCategoryChartInstance = null;
let incomeCategoryChartInstance = null;
let trendChartInstance = null;

function getYearMonth(dateStr) {
  if (!dateStr) return '';
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1]}`;
    } else if (parts[2] && parts[2].length === 4) {
      return `${parts[2]}-${parts[1]}`;
    }
  }
  return dateStr.slice(0, 7);
}

// App Init
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');

  dateInput.value = `${yyyy}-${mm}-${dd}`;
  filterMonth.value = `${yyyy}-${mm}`;

  checkAuthStatus();

  typeExpenseBtn.addEventListener('click', () => setType('expense'));
  typeIncomeBtn.addEventListener('click', () => setType('income'));
  amountInput.addEventListener('input', calculateSplitValues);
  splitFriends.addEventListener('input', calculateSplitValues);
  transactionForm.addEventListener('submit', handleFormSubmit);
  
  filterType.addEventListener('change', updateUI);
  filterCategory.addEventListener('change', updateUI);
  filterMonth.addEventListener('change', updateUI);
  searchInput.addEventListener('input', updateUI);
  
  exportBtn.addEventListener('click', exportToCSV);
  resetBtn.addEventListener('click', resetAllData);
});

function refreshProfilesFromStorage() {
  userProfiles = JSON.parse(localStorage.getItem('spideyUserProfiles')) || {};
}

function checkAuthStatus() {
  refreshProfilesFromStorage();

  if (!currentMobile || !userProfiles[currentMobile]) {
    promptLogin();
    return;
  }

  const user = userProfiles[currentMobile];
  user.lastLoginTimestamp = Date.now();
  saveProfilesToStorage();

  authModal.classList.add('hidden');
  loadUserData();
  populateCategoryOptions();
  populateFilterCategories();
  updateUI();
}

function promptLogin() {
  authCloseBtn.classList.add('hidden');
  authModal.classList.remove('hidden');
  populateQuickProfilesDropdown();
  switchAuthTab('login');
}

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
  authCloseBtn.classList.remove('hidden');
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
  authSecAnswer.value = '';

  if (mode === 'login') {
    authTitle.textContent = "Welcome Back, Hero!";
    authSubtitle.textContent = "Select profile or enter mobile & PIN";
    authTabs.classList.remove('hidden');
    nameFieldGroup.classList.add('hidden');
    securityFieldGroup.classList.add('hidden');
    pinFieldGroup.classList.remove('hidden');
    forgotPinBtn.classList.remove('hidden');
    backToLoginBtn.classList.add('hidden');
    pinLabel.textContent = "4-Digit Security PIN";
    authSubmitBtn.textContent = "Access Vault";
    
    document.getElementById('tabLoginBtn').className = "py-2.5 text-xs font-bold rounded-lg bg-red-600 text-white transition shadow";
    document.getElementById('tabSignupBtn').className = "py-2.5 text-xs font-bold rounded-lg text-slate-400 hover:text-white transition";
    populateQuickProfilesDropdown();
  } else if (mode === 'signup') {
    authTitle.textContent = "Create Spidey Profile";
    authSubtitle.textContent = "Clean setup for personal finance tracking";
    authTabs.classList.remove('hidden');
    quickProfileSection.classList.add('hidden');
    nameFieldGroup.classList.remove('hidden');
    securityFieldGroup.classList.remove('hidden');
    pinFieldGroup.classList.remove('hidden');
    forgotPinBtn.classList.add('hidden');
    backToLoginBtn.classList.add('hidden');
    pinLabel.textContent = "4-Digit Security PIN";
    authSubmitBtn.textContent = "Create Profile & Start";
    authName.required = true;

    document.getElementById('tabSignupBtn').className = "py-2.5 text-xs font-bold rounded-lg bg-blue-600 text-white transition shadow";
    document.getElementById('tabLoginBtn').className = "py-2.5 text-xs font-bold rounded-lg text-slate-400 hover:text-white transition";
  } else if (mode === 'forgot') {
    authTitle.textContent = "Reset PIN Authentication";
    authSubtitle.textContent = "Verify security answer & set new PIN";
    authTabs.classList.add('hidden');
    quickProfileSection.classList.add('hidden');
    nameFieldGroup.classList.add('hidden');
    securityFieldGroup.classList.remove('hidden');
    pinFieldGroup.classList.remove('hidden');
    forgotPinBtn.classList.add('hidden');
    backToLoginBtn.classList.remove('hidden');
    pinLabel.textContent = "Enter NEW 4-Digit PIN";
    authSubmitBtn.textContent = "Update & Reset PIN";
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
  const secQ = authSecQuestion.value;
  const secA = authSecAnswer.value.trim().toLowerCase();

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
    if (!secA) {
      alert("Please provide a security answer for password recovery.");
      return;
    }
    userProfiles[mobile] = {
      name: name || "Hero",
      pin: pin,
      secQuestion: secQ,
      secAnswer: secA,
      monthlyBudget: 25000,
      totalSavingsAllocated: 0,
      lastLoginTimestamp: Date.now(),
      transactions: []
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
      alert("Incorrect PIN! Try again or click Forgot PIN.");
      return;
    }
    loginUser(mobile);
  } else if (authMode === 'forgot') {
    if (!userProfiles[mobile]) {
      alert("Mobile number not registered.");
      return;
    }
    const user = userProfiles[mobile];
    if (user.secAnswer !== secA) {
      alert("Security answer verification failed!");
      return;
    }
    user.pin = pin;
    saveProfilesToStorage();
    alert("PIN successfully reset! Logging you in...");
    loginUser(mobile);
  }
}

function loginUser(mobile) {
  currentMobile = mobile;
  localStorage.setItem('currentActiveMobile', mobile);
  if (userProfiles[mobile]) {
    userProfiles[mobile].lastLoginTimestamp = Date.now();
    saveProfilesToStorage();
  }
  authModal.classList.add('hidden');
  checkAuthStatus();
}

function logoutProfile() {
  currentMobile = null;
  localStorage.removeItem('currentActiveMobile');
  checkAuthStatus();
}

// Cross-Device Sync: Export Profile Backup file (.json)
function exportProfileBackup() {
  if (!currentMobile || !userProfiles[currentMobile]) {
    alert("No active profile to export.");
    return;
  }
  const profileData = {
    mobile: currentMobile,
    data: userProfiles[currentMobile]
  };
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profileData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `spidey_profile_${currentMobile}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Cross-Device Sync: Import Profile Backup file (.json)
function importProfileBackup(event) {
  const fileReader = new FileReader();
  if (event.target.files[0]) {
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (!imported.mobile || !imported.data) {
          throw new Error("Invalid format");
        }
        refreshProfilesFromStorage();
        userProfiles[imported.mobile] = imported.data;
        saveProfilesToStorage();
        alert(`Profile for +91 ${imported.mobile} imported successfully! Logging you in...`);
        loginUser(imported.mobile);
        closeProfileModal();
      } catch (err) {
        alert("Failed to import profile. Make sure it's a valid Spidey Profile backup file.");
      }
    };
  }
}

// Split Expense UI & Logic Helpers
function toggleSplitSection() {
  if (enableSplit.checked) {
    splitFields.classList.remove('hidden');
    calculateSplitValues();
  } else {
    splitFields.classList.add('hidden');
  }
}

function calculateSplitValues() {
  if (!enableSplit.checked) return;
  const totalAmount = parseFloat(amountInput.value) || 0;
  const friendsRaw = splitFriends.value.trim();
  const friendsList = friendsRaw ? friendsRaw.split(',').map(f => f.trim()).filter(Boolean) : [];
  
  const totalPeople = friendsList.length + 1; // You + Friends
  const sharePerPerson = totalPeople > 0 ? totalAmount / totalPeople : totalAmount;

  splitSharePreview.textContent = formatCurrency(sharePerPerson);

  if (friendsList.length > 0) {
    const totalOwedToYou = sharePerPerson * friendsList.length;
    let summaryHtml = `<strong>Total Owed to You: ${formatCurrency(totalOwedToYou)}</strong><br>`;
    friendsList.forEach(f => {
      summaryHtml += `${f} owes you ${formatCurrency(sharePerPerson)}<br>`;
    });
    splitOwedSummary.innerHTML = summaryHtml;
    splitOwedSummary.classList.remove('hidden');
  } else {
    splitOwedSummary.classList.add('hidden');
  }
}

// Toggle Settlement (Check/Uncheck Payment Status)
function toggleFriendPayment(txId, friendName, isPaid) {
  const tx = transactions.find(t => t.id === txId);
  if (!tx || !tx.split) return;

  if (!tx.split.paidStatus) {
    tx.split.paidStatus = {};
  }

  tx.split.paidStatus[friendName] = isPaid;
  saveToLocalStorage();
  updateUI();
}

// Savings CRUD
function openSavingsModal() {
  currentSavingsDisplay.textContent = formatCurrency(totalSavingsAllocated);
  savAmountInput.value = '';
  setSavingsOp('add');
  savingsModal.classList.remove('hidden');
}

function closeSavingsModal() {
  savingsModal.classList.add('hidden');
}

function setSavingsOp(op) {
  currentSavOp = op;
  const btnAdd = document.getElementById('savOpAdd');
  const btnSub = document.getElementById('savOpSub');
  const btnSet = document.getElementById('savOpSet');

  btnAdd.className = "py-2.5 rounded-lg text-slate-400 hover:text-white transition flex items-center justify-center gap-1";
  btnSub.className = "py-2.5 rounded-lg text-slate-400 hover:text-white transition flex items-center justify-center gap-1";
  btnSet.className = "py-2.5 rounded-lg text-slate-400 hover:text-white transition flex items-center justify-center gap-1";

  if (op === 'add') {
    btnAdd.className = "py-2.5 rounded-lg bg-indigo-600 text-white transition flex items-center justify-center gap-1";
    savAmountLabel.textContent = "Deposit Amount (+)";
    savRecordTransactionGroup.classList.remove('hidden');
  } else if (op === 'sub') {
    btnSub.className = "py-2.5 rounded-lg bg-rose-600 text-white transition flex items-center justify-center gap-1";
    savAmountLabel.textContent = "Withdraw Amount (-)";
    savRecordTransactionGroup.classList.remove('hidden');
  } else {
    btnSet.className = "py-2.5 rounded-lg bg-indigo-600 text-white transition flex items-center justify-center gap-1";
    savAmountLabel.textContent = "New Total Savings Goal (=)";
    savRecordTransactionGroup.classList.add('hidden');
  }
}

function executeSavingsMath(e) {
  e.preventDefault();
  const val = parseFloat(savAmountInput.value);
  if (isNaN(val) || val < 0) return;

  const today = new Date().toISOString().split('T')[0];

  if (currentSavOp === 'add') {
    totalSavingsAllocated += val;
    if (savRecordTransaction.checked) {
      transactions.unshift({
        id: Date.now(),
        type: 'expense',
        description: 'Savings Transfer Deposit',
        amount: val,
        category: 'Savings Allocation',
        date: today
      });
    }
  } else if (currentSavOp === 'sub') {
    totalSavingsAllocated = Math.max(0, totalSavingsAllocated - val);
    if (savRecordTransaction.checked) {
      transactions.unshift({
        id: Date.now(),
        type: 'income',
        description: 'Savings Withdrawal Transfer',
        amount: val,
        category: 'Other Income',
        date: today
      });
    }
  } else if (currentSavOp === 'set') {
    totalSavingsAllocated = val;
  }

  saveToLocalStorage();
  updateUI();
  closeSavingsModal();
}

// Monthly Budget CRUD
function openBudgetModal() {
  currentBudgetDisplay.textContent = formatCurrency(monthlyBudget);
  budAmountInput.value = '';
  setBudgetOp('add');
  budgetModal.classList.remove('hidden');
}

function closeBudgetModal() {
  budgetModal.classList.add('hidden');
}

function setBudgetOp(op) {
  currentBudOp = op;
  const btnAdd = document.getElementById('budOpAdd');
  const btnSub = document.getElementById('budOpSub');
  const btnSet = document.getElementById('budOpSet');

  btnAdd.className = "py-2.5 rounded-lg text-slate-400 hover:text-white transition flex items-center justify-center gap-1";
  btnSub.className = "py-2.5 rounded-lg text-slate-400 hover:text-white transition flex items-center justify-center gap-1";
  btnSet.className = "py-2.5 rounded-lg text-slate-400 hover:text-white transition flex items-center justify-center gap-1";

  if (op === 'add') {
    btnAdd.className = "py-2.5 rounded-lg bg-amber-600 text-white transition flex items-center justify-center gap-1";
    budAmountLabel.textContent = "Increase Limit (+)";
  } else if (op === 'sub') {
    btnSub.className = "py-2.5 rounded-lg bg-rose-600 text-white transition flex items-center justify-center gap-1";
    budAmountLabel.textContent = "Decrease Limit (-)";
  } else {
    btnSet.className = "py-2.5 rounded-lg bg-amber-600 text-white transition flex items-center justify-center gap-1";
    budAmountLabel.textContent = "Set New Monthly Budget (=)";
  }
}

function executeBudgetMath(e) {
  e.preventDefault();
  const val = parseFloat(budAmountInput.value);
  if (isNaN(val) || val < 0) return;

  if (currentBudOp === 'add') {
    monthlyBudget += val;
  } else if (currentBudOp === 'sub') {
    monthlyBudget = Math.max(0, monthlyBudget - val);
  } else if (currentBudOp === 'set') {
    monthlyBudget = val;
  }

  saveToLocalStorage();
  updateUI();
  closeBudgetModal();
}

// Transaction Update (Edit) Operations
function openEditTxModal(id) {
  const tx = transactions.find(t => t.id === id);
  if (!tx) return;

  editTxId.value = tx.id;
  editTxType.value = tx.type;
  editTxDesc.value = tx.description;
  editTxAmount.value = tx.amount;
  editTxDate.value = tx.date;

  populateEditCategoryOptions();
  editTxCategory.value = tx.category;

  editTxModal.classList.remove('hidden');
}

function populateEditCategoryOptions() {
  const type = editTxType.value;
  editTxCategory.innerHTML = '';
  const catList = categories[type] || categories.expense;
  catList.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    editTxCategory.appendChild(opt);
  });
}

function closeEditTxModal() {
  editTxModal.classList.add('hidden');
}

function saveEditedTransaction(e) {
  e.preventDefault();
  const id = Number(editTxId.value);
  const txIndex = transactions.findIndex(t => t.id === id);

  if (txIndex !== -1) {
    transactions[txIndex].type = editTxType.value;
    transactions[txIndex].description = editTxDesc.value.trim();
    transactions[txIndex].amount = parseFloat(editTxAmount.value);
    transactions[txIndex].date = editTxDate.value;
    transactions[txIndex].category = editTxCategory.value;

    saveToLocalStorage();
    updateUI();
  }
  closeEditTxModal();
}

// Transaction Create & Duplicate
function duplicateTransaction(id) {
  const tx = transactions.find(t => t.id === id);
  if (!tx) return;

  const dup = { ...tx, id: Date.now(), description: `${tx.description} (Copy)` };
  transactions.unshift(dup);
  saveToLocalStorage();
  updateUI();
}

function handleFormSubmit(e) {
  e.preventDefault();

  const totalInputAmount = parseFloat(amountInput.value);
  if (isNaN(totalInputAmount) || totalInputAmount <= 0) return;

  let finalAmount = totalInputAmount;
  let splitData = null;

  // Handle Split Calculations
  if (currentType === 'expense' && enableSplit.checked) {
    const friendsRaw = splitFriends.value.trim();
    const friendsList = friendsRaw ? friendsRaw.split(',').map(f => f.trim()).filter(Boolean) : [];
    
    if (friendsList.length > 0) {
      const totalPeople = friendsList.length + 1;
      const sharePerPerson = totalInputAmount / totalPeople;
      
      const paidStatusObj = {};
      friendsList.forEach(f => {
        paidStatusObj[f] = false; // Initially unpaid
      });

      // Your personal expense is only your share
      finalAmount = sharePerPerson;
      splitData = {
        totalBill: totalInputAmount,
        friends: friendsList,
        perPersonShare: sharePerPerson,
        paidStatus: paidStatusObj
      };
    }
  }

  const newTransaction = {
    id: Date.now(),
    type: currentType,
    description: descriptionInput.value.trim(),
    amount: finalAmount,
    category: categorySelect.value,
    date: dateInput.value,
    split: splitData
  };

  transactions.unshift(newTransaction);
  saveToLocalStorage();
  updateUI();

  // Reset Form
  descriptionInput.value = '';
  amountInput.value = '';
  enableSplit.checked = false;
  splitFriends.value = '';
  splitFields.classList.add('hidden');
  descriptionInput.focus();
}

// Transaction Delete
function deleteTransaction(id) {
  if (confirm("Are you sure you want to delete this transaction record?")) {
    transactions = transactions.filter(t => t.id !== id);
    saveToLocalStorage();
    updateUI();
  }
}

// Persistence
function loadUserData() {
  refreshProfilesFromStorage();
  const user = userProfiles[currentMobile];
  if (!user) {
    logoutProfile();
    return;
  }
  profileDisplayName.textContent = user.name;
  monthlyBudget = Number(user.monthlyBudget) || 25000;
  totalSavingsAllocated = Number(user.totalSavingsAllocated) || 0;
  transactions = Array.isArray(user.transactions) ? user.transactions : [];
}

function saveToLocalStorage() {
  if (!currentMobile) return;
  refreshProfilesFromStorage();
  userProfiles[currentMobile] = {
    ...userProfiles[currentMobile],
    monthlyBudget: Number(monthlyBudget),
    totalSavingsAllocated: Number(totalSavingsAllocated),
    transactions: transactions,
    lastLoginTimestamp: Date.now()
  };
  saveProfilesToStorage();
}

function saveProfilesToStorage() {
  localStorage.setItem('spideyUserProfiles', JSON.stringify(userProfiles));
}

// Form Helpers
function setType(type) {
  currentType = type;
  if (type === 'expense') {
    typeExpenseBtn.className = 'type-btn active py-3 px-3 rounded-xl border border-red-500/50 bg-red-500/20 text-red-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.2)] min-h-[44px]';
    typeIncomeBtn.className = 'type-btn py-3 px-3 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 min-h-[44px]';
    splitExpenseSection.classList.remove('hidden');
  } else {
    typeIncomeBtn.className = 'type-btn active py-3 px-3 rounded-xl border border-emerald-500/50 bg-emerald-500/20 text-emerald-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)] min-h-[44px]';
    typeExpenseBtn.className = 'type-btn py-3 px-3 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 min-h-[44px]';
    splitExpenseSection.classList.add('hidden');
    enableSplit.checked = false;
    splitFields.classList.add('hidden');
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

function getFilteredTransactions() {
  const selectedType = filterType.value;
  const selectedCategory = filterCategory.value;
  const selectedMonth = filterMonth.value;
  const searchTerm = searchInput.value.toLowerCase().trim();

  return transactions.filter(t => {
    const matchesType = selectedType === 'all' || t.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesMonth = !selectedMonth || (getYearMonth(t.date) === selectedMonth);
    const matchesSearch = t.description.toLowerCase().includes(searchTerm) || t.category.toLowerCase().includes(searchTerm);
    return matchesType && matchesCategory && matchesMonth && matchesSearch;
  });
}

// Master UI Synchronization Function
function updateUI() {
  const filtered = getFilteredTransactions();

  // 1. All-Time Totals
  const allIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const allExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const netBalance = allIncome - allExpense - Number(totalSavingsAllocated);

  totalBalanceEl.textContent = formatCurrency(netBalance);
  totalSavingsEl.textContent = formatCurrency(totalSavingsAllocated);
  totalIncomeEl.textContent = formatCurrency(allIncome);
  totalExpenseEl.textContent = formatCurrency(allExpense);

  // 2. Active Selected Month Calculations
  const activeMonthStr = filterMonth.value || getYearMonth(new Date().toISOString().slice(0, 10));
  const selectedMonthExpenses = transactions
    .filter(t => t.type === 'expense' && getYearMonth(t.date) === activeMonthStr)
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  budgetSpentEl.textContent = formatCurrency(selectedMonthExpenses);
  budgetLimitEl.textContent = `/ ${formatCurrency(monthlyBudget)}`;

  const percentage = monthlyBudget > 0 ? Math.min(Math.round((selectedMonthExpenses / monthlyBudget) * 100), 100) : 0;
  budgetProgressBar.style.width = `${percentage}%`;
  budgetText.textContent = `${percentage}% used`;

  // 3. KPIs
  const savingsRate = allIncome > 0 ? Math.round(((allIncome - allExpense) / allIncome) * 100) : 0;
  kpiSavingsRate.textContent = `${Math.max(0, savingsRate)}%`;

  const now = new Date();
  const currentDays = now.getDate() || 1;
  const dailyAvg = selectedMonthExpenses / currentDays;

  kpiDailyAvg.textContent = formatCurrency(dailyAvg);
  kpiMonthSpend.textContent = formatCurrency(selectedMonthExpenses);

  let score = 100;
  if (percentage > 80) score -= 20;
  if (percentage >= 100) score -= 30;
  if (savingsRate < 20) score -= 20;
  kpiHealthScore.textContent = `${Math.max(0, score)} / 100`;

  // 4. Budget Alert Banner
  if (selectedMonthExpenses >= monthlyBudget && monthlyBudget > 0) {
    budgetProgressBar.className = 'bg-red-500 h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
    budgetAlert.className = 'mb-6 p-4 rounded-xl border flex items-center justify-between transition-all duration-500 bg-red-500/10 border-red-500/40 text-red-300';
    alertIcon.className = 'fa-solid fa-triangle-exclamation text-red-400 text-xl';
    alertTitle.textContent = 'Budget Limit Exceeded!';
    alertDesc.textContent = `Spent ${formatCurrency(selectedMonthExpenses)} exceeding your limit of ${formatCurrency(monthlyBudget)}.`;
    budgetAlert.classList.remove('hidden');
  } else if (selectedMonthExpenses >= monthlyBudget * 0.8 && monthlyBudget > 0) {
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

  // 5. Render History & Analytics Charts
  renderTransactionList(filtered);
  renderCharts(filtered);
}

// Render Transaction Records Table with Settlement Tracking
function renderTransactionList(items) {
  transactionList.innerHTML = '';
  if (items.length === 0) {
    transactionList.innerHTML = `
      <div class="text-center py-8 text-slate-500">
        <i class="fa-solid fa-folder-open text-3xl mb-2 block"></i>
        <p class="text-xs">No records found for this view.</p>
      </div>`;
    return;
  }

  items.forEach(t => {
    const isExpense = t.type === 'expense';
    const color = categoryColors[t.category] || (isExpense ? '#ef4444' : '#10b981');

    let splitHtml = '';
    if (t.split && t.split.friends && t.split.friends.length > 0) {
      const paidStatus = t.split.paidStatus || {};
      const share = t.split.perPersonShare;

      const uncollectedFriends = [];
      let friendCheckboxesHtml = '';

      t.split.friends.forEach(f => {
        const isPaid = !!paidStatus[f];
        if (!isPaid) uncollectedFriends.push(f);

        friendCheckboxesHtml += `
          <label class="inline-flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-[11px] cursor-pointer hover:border-slate-700">
            <input type="checkbox" ${isPaid ? 'checked' : ''} onchange="toggleFriendPayment(${t.id}, '${f}', this.checked)" class="w-3.5 h-3.5 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-0">
            <span class="${isPaid ? 'text-emerald-400 line-through opacity-80' : 'text-slate-200'}">${escapeHtml(f)}</span>
            <span class="text-[10px] text-slate-500">(${formatCurrency(share)})</span>
          </label>
        `;
      });

      const unpaidBalance = uncollectedFriends.length * share;

      let summaryText = '';
      if (uncollectedFriends.length === 0) {
        summaryText = `<span class="text-emerald-400 font-bold"><i class="fa-solid fa-circle-check"></i> Fully Settled</span>`;
      } else {
        summaryText = `<span class="text-amber-400 font-bold">Unpaid Balance: ${formatCurrency(unpaidBalance)}</span> (Pending: <span class="text-red-400 font-semibold">${uncollectedFriends.join(', ')}</span>)`;
      }

      splitHtml = `
        <div class="mt-2.5 p-2.5 bg-slate-950/70 rounded-xl border border-indigo-500/20 text-xs space-y-2">
          <div class="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pb-1 border-b border-slate-800">
            <span><i class="fa-solid fa-users text-indigo-400"></i> Total Bill: <strong class="text-slate-200">${formatCurrency(t.split.totalBill)}</strong></span>
            <span>Check box when paid:</span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            ${friendCheckboxesHtml}
          </div>
          <div class="text-[11px] pt-1">
            ${summaryText}
          </div>
        </div>
      `;
    }

    const li = document.createElement('li');
    li.className = 'bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-3.5 flex flex-col justify-between gap-3 transition-all duration-300 group animate-slide-in';

    li.innerHTML = `
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0" style="background-color: ${color}20; color: ${color};">
            <i class="fa-solid ${isExpense ? 'fa-arrow-down-long' : 'fa-arrow-up-long'}"></i>
          </div>
          <div class="min-w-0 flex-1">
            <h4 class="font-semibold text-sm text-slate-100 truncate">${escapeHtml(t.description)}</h4>
            <div class="flex flex-wrap items-center gap-2 mt-0.5">
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full" style="background-color: ${color}20; color: ${color}">
                ${t.category}
              </span>
              <span class="text-[11px] text-slate-500">${t.date}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
          <span class="font-extrabold text-sm ${isExpense ? 'text-red-400' : 'text-emerald-400'}">
            ${isExpense ? '-' : '+'}${formatCurrency(t.amount)}
          </span>
          <div class="flex items-center gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition">
            <button onclick="duplicateTransaction(${t.id})" class="text-slate-400 hover:text-indigo-400 p-2 min-w-[36px] min-h-[36px] flex items-center justify-center bg-slate-800/50 sm:bg-transparent rounded-lg" title="Duplicate">
              <i class="fa-solid fa-clone text-xs"></i>
            </button>
            <button onclick="openEditTxModal(${t.id})" class="text-slate-400 hover:text-blue-400 p-2 min-w-[36px] min-h-[36px] flex items-center justify-center bg-slate-800/50 sm:bg-transparent rounded-lg" title="Edit">
              <i class="fa-solid fa-pen text-xs"></i>
            </button>
            <button onclick="deleteTransaction(${t.id})" class="text-slate-400 hover:text-red-400 p-2 min-w-[36px] min-h-[36px] flex items-center justify-center bg-slate-800/50 sm:bg-transparent rounded-lg" title="Delete">
              <i class="fa-solid fa-trash-can text-xs"></i>
            </button>
          </div>
        </div>
      </div>
      ${splitHtml}
    `;
    transactionList.appendChild(li);
  });
}

// Render Doughnut & Bar Charts
function renderCharts(items) {
  const expenseItems = items.filter(t => t.type === 'expense');
  const expCatTotals = {};
  expenseItems.forEach(t => { expCatTotals[t.category] = (expCatTotals[t.category] || 0) + Number(t.amount); });
  const expLabels = Object.keys(expCatTotals);
  const expData = Object.values(expCatTotals);
  const expColors = expLabels.map(cat => categoryColors[cat] || '#ef4444');

  const ctxExpCat = document.getElementById('expenseCategoryChart').getContext('2d');
  if (expenseCategoryChartInstance) expenseCategoryChartInstance.destroy();

  expenseCategoryChartInstance = new Chart(ctxExpCat, {
    type: 'doughnut',
    data: {
      labels: expLabels.length ? expLabels : ['No Expenses'],
      datasets: [{
        data: expData.length ? expData : [1],
        backgroundColor: expColors.length ? expColors : ['#334155'],
        borderWidth: 2,
        borderColor: '#1e293b'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 9 }, boxWidth: 8 } } },
      cutout: '65%'
    }
  });

  const incomeItems = items.filter(t => t.type === 'income');
  const incCatTotals = {};
  incomeItems.forEach(t => { incCatTotals[t.category] = (incCatTotals[t.category] || 0) + Number(t.amount); });
  const incLabels = Object.keys(incCatTotals);
  const incData = Object.values(incCatTotals);
  const incColors = incLabels.map(cat => categoryColors[cat] || '#10b981');

  const ctxIncCat = document.getElementById('incomeCategoryChart').getContext('2d');
  if (incomeCategoryChartInstance) incomeCategoryChartInstance.destroy();

  incomeCategoryChartInstance = new Chart(ctxIncCat, {
    type: 'doughnut',
    data: {
      labels: incLabels.length ? incLabels : ['No Income'],
      datasets: [{
        data: incData.length ? incData : [1],
        backgroundColor: incColors.length ? incColors : ['#334155'],
        borderWidth: 2,
        borderColor: '#1e293b'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 9 }, boxWidth: 8 } } },
      cutout: '65%'
    }
  });

  const ctxTrend = document.getElementById('trendChart').getContext('2d');
  if (trendChartInstance) trendChartInstance.destroy();

  const totalInc = items.filter(t => t.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
  const totalExp = items.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);

  trendChartInstance = new Chart(ctxTrend, {
    type: 'bar',
    data: {
      labels: ['Cash Flow'],
      datasets: [
        { label: 'Income', data: [totalInc], backgroundColor: '#10b981', borderRadius: 6 },
        { label: 'Expense', data: [totalExp], backgroundColor: '#f43f5e', borderRadius: 6 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
        y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8', font: { size: 10 } } }
      },
      plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 9 }, boxWidth: 8 } } }
    }
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount || 0);
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