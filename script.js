// State Management
let transactions = JSON.parse(localStorage.getItem('transactions')) || [
  { id: 1, type: 'income', description: 'Monthly Salary', amount: 45000, category: 'Salary', date: '2026-10-01' },
  { id: 2, type: 'expense', description: 'Apartment Rent', amount: 12000, category: 'Housing', date: '2026-10-02' },
  { id: 3, type: 'expense', description: 'Grocery Shopping', amount: 3500, category: 'Food & Dining', date: '2026-10-05' },
  { id: 4, type: 'expense', description: 'Electricity Bill', amount: 1800, category: 'Utilities', date: '2026-10-10' },
  { id: 5, type: 'income', description: 'Freelance Design', amount: 8500, category: 'Freelance', date: '2026-10-15' }
];

let monthlyBudget = parseFloat(localStorage.getItem('monthlyBudget')) || 25000;
let currentType = 'expense';

// Categories Configuration
const categories = {
  expense: ['Food & Dining', 'Housing', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Health', 'Education', 'Other Expense'],
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
  'Other Expense': '#64748b',
  'Salary': '#10b981',
  'Freelance': '#14b8a6',
  'Investments': '#3b82f6',
  'Business': '#8b5cf6',
  'Gifts': '#f43f5e',
  'Other Income': '#94a3b8'
};

// DOM Elements
const transactionForm = document.getElementById('transactionForm');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const dateInput = document.getElementById('date');
const categorySelect = document.getElementById('category');
const typeExpenseBtn = document.getElementById('typeExpenseBtn');
const typeIncomeBtn = document.getElementById('typeIncomeBtn');

const totalBalanceEl = document.getElementById('totalBalance');
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

// Chart Instances
let categoryChartInstance = null;
let trendChartInstance = null;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Set default date to today
  dateInput.value = new Date().toISOString().split('T')[0];
  
  // Set default filter month to current YYYY-MM
  const today = new Date();
  filterMonth.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  populateCategoryOptions();
  populateFilterCategories();
  updateUI();

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

// Set Transaction Type (Expense vs Income)
function setType(type) {
  currentType = type;
  if (type === 'expense') {
    typeExpenseBtn.className = 'type-btn active py-2.5 px-4 rounded-xl border border-rose-500/50 bg-rose-500/20 text-rose-300 font-bold text-sm flex items-center justify-center gap-2 transition';
    typeIncomeBtn.className = 'type-btn py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-900/50 text-slate-400 font-bold text-sm flex items-center justify-center gap-2 transition';
  } else {
    typeIncomeBtn.className = 'type-btn active py-2.5 px-4 rounded-xl border border-emerald-500/50 bg-emerald-500/20 text-emerald-300 font-bold text-sm flex items-center justify-center gap-2 transition';
    typeExpenseBtn.className = 'type-btn py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-900/50 text-slate-400 font-bold text-sm flex items-center justify-center gap-2 transition';
  }
  populateCategoryOptions();
}

// Populate Category Dropdown
function populateCategoryOptions() {
  categorySelect.innerHTML = '';
  categories[currentType].forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// Populate Filter Category Dropdown
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

// Add New Transaction
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

  // Reset form
  descriptionInput.value = '';
  amountInput.value = '';
  descriptionInput.focus();
}

// Delete Transaction
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveToLocalStorage();
  updateUI();
}

// Edit Monthly Budget Limit
function handleEditBudget() {
  const newLimit = prompt('Enter your new monthly budget limit (₹):', monthlyBudget);
  if (newLimit !== null && !isNaN(newLimit) && parseFloat(newLimit) > 0) {
    monthlyBudget = parseFloat(newLimit);
    localStorage.setItem('monthlyBudget', monthlyBudget);
    updateUI();
  }
}

// Save Data
function saveToLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Format Currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
}

// Filter Transactions
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

// Main UI Update Pipeline
function updateUI() {
  const filtered = getFilteredTransactions();

  // Calculate Balances
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  // Filtered Totals
  const filteredIncome = filtered.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const filteredExpense = filtered.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  totalBalanceEl.textContent = formatCurrency(netBalance);
  totalIncomeEl.textContent = formatCurrency(filteredIncome);
  totalExpenseEl.textContent = formatCurrency(filteredExpense);

  // Update Budget Progress (Current Month)
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const currentMonthExpenses = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(currentMonthStr))
    .reduce((acc, t) => acc + t.amount, 0);

  budgetSpentEl.textContent = formatCurrency(currentMonthExpenses);
  budgetLimitEl.textContent = `/ ${formatCurrency(monthlyBudget)}`;

  const percentage = Math.min(Math.round((currentMonthExpenses / monthlyBudget) * 100), 100);
  budgetProgressBar.style.width = `${percentage}%`;
  budgetText.textContent = `${percentage}% of monthly limit used`;

  // Update Budget Alerts
  if (currentMonthExpenses >= monthlyBudget) {
    budgetProgressBar.className = 'bg-rose-500 h-2.5 rounded-full transition-all duration-500';
    budgetAlert.className = 'mb-6 p-4 rounded-xl border flex items-center justify-between transition-all duration-300 bg-rose-500/10 border-rose-500/40 text-rose-300';
    alertIcon.className = 'fa-solid fa-triangle-exclamation text-rose-400 text-xl';
    alertTitle.textContent = 'Budget Limit Exceeded!';
    alertDesc.textContent = `You have spent ${formatCurrency(currentMonthExpenses)} which exceeds your limit of ${formatCurrency(monthlyBudget)}.`;
    budgetAlert.classList.remove('hidden');
  } else if (currentMonthExpenses >= monthlyBudget * 0.8) {
    budgetProgressBar.className = 'bg-amber-500 h-2.5 rounded-full transition-all duration-500';
    budgetAlert.className = 'mb-6 p-4 rounded-xl border flex items-center justify-between transition-all duration-300 bg-amber-500/10 border-amber-500/40 text-amber-300';
    alertIcon.className = 'fa-solid fa-circle-exclamation text-amber-400 text-xl';
    alertTitle.textContent = 'Warning: Approaching Budget Limit!';
    alertDesc.textContent = `You have used ${percentage}% of your monthly limit (${formatCurrency(currentMonthExpenses)} / ${formatCurrency(monthlyBudget)}).`;
    budgetAlert.classList.remove('hidden');
  } else {
    budgetProgressBar.className = 'bg-emerald-500 h-2.5 rounded-full transition-all duration-500';
    budgetAlert.classList.add('hidden');
  }

  // Render List & Charts
  renderTransactionList(filtered);
  renderCharts(filtered);
}

// Render Transaction Items List
function renderTransactionList(items) {
  transactionList.innerHTML = '';
  

  if (items.length === 0) {
    transactionList.innerHTML = `
      <div class="text-center py-8 text-slate-500">
        <i class="fa-solid fa-folder-open text-3xl mb-2 block"></i>
        <p class="text-xs">No transactions found for the selected filter.</p>
      </div>`;
    return;
  }

  items.forEach(t => {
    const isExpense = t.type === 'expense';
    const color = categoryColors[t.category] || '#64748b';

    const li = document.createElement('li');
    li.className = 'bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between transition group';

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
        <span class="font-extrabold text-sm ${isExpense ? 'text-rose-400' : 'text-emerald-400'}">
          ${isExpense ? '-' : '+'}${formatCurrency(t.amount)}
        </span>
        <button onclick="deleteTransaction(${t.id})" class="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition p-1" title="Delete">
          <i class="fa-solid fa-trash-can text-xs"></i>
        </button>
      </div>
    `;

    transactionList.appendChild(li);
  });
}

// Render Doughnut & Bar Charts
function renderCharts(items) {
  // Category Breakdown Chart (Expenses Only)
  const expenseItems = items.filter(t => t.type === 'expense');
  const catTotals = {};

  expenseItems.forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
  });

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
      plugins: {
        legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } }
      },
      cutout: '70%'
    }
  });

  // Cashflow Overview Chart
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
      plugins: {
        legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } }
      }
    }
  });
}

// Export CSV Functionality
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
  link.setAttribute("download", `expense_report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Reset Data
function resetAllData() {
  if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
    localStorage.clear();
    transactions = [];
    monthlyBudget = 25000;
    updateUI();
  }
}

// Utility: Prevent XSS Injection
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}