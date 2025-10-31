// Main application logic for Expense Tracker
document.addEventListener('DOMContentLoaded', function() {
    const storage = new StorageManager();
    
    // Initialize the application
    init();

    function init() {
        storage.initializeFirstTime();
        initializeEventListeners();
        updateDashboard();
        updateTransactions();
        updateSavings();
    }

    function initializeEventListeners() {
        // Tab navigation
        initializeTabs();
        
        // Modal controls
        initializeModals();
        
        // Quick action buttons
        document.getElementById('add-expense-btn').addEventListener('click', () => openModal('expense-modal'));
        document.getElementById('add-income-btn').addEventListener('click', () => openModal('income-modal'));
        document.getElementById('savings-goal-btn').addEventListener('click', () => openModal('savings-goal-modal'));
        document.getElementById('add-savings-btn').addEventListener('click', () => openModal('add-savings-modal'));
        
        // Form submissions
        document.getElementById('expense-form').addEventListener('submit', handleExpenseSubmit);
        document.getElementById('income-form').addEventListener('submit', handleIncomeSubmit);
        document.getElementById('savings-goal-form').addEventListener('submit', handleSavingsGoalSubmit);
        document.getElementById('add-savings-form').addEventListener('submit', handleAddSavingsSubmit);
        
        // Real-time calculations for savings goal
        document.getElementById('goal-amount').addEventListener('input', updateDailySavingAmount);
        document.getElementById('goal-days').addEventListener('input', updateDailySavingAmount);
        
        // Category filter
        document.getElementById('category-filter').addEventListener('change', updateTransactions);
    }

    function initializeTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab');
                
                // Update buttons
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update contents
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === tabId) {
                        content.classList.add('active');
                    }
                });
            });
        });
    }

    function initializeModals() {
        // Close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', closeAllModals);
        });

        // Cancel buttons
        document.getElementById('cancel-expense').addEventListener('click', closeAllModals);
        document.getElementById('cancel-income').addEventListener('click', closeAllModals);
        document.getElementById('cancel-goal').addEventListener('click', closeAllModals);
        document.getElementById('cancel-savings').addEventListener('click', closeAllModals);

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                closeAllModals();
            }
        });
    }

    function openModal(modalId) {
        closeAllModals();
        document.getElementById(modalId).style.display = 'block';
    }

    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        
        // Reset forms
        document.querySelectorAll('form').forEach(form => form.reset());
    }

    function handleExpenseSubmit(e) {
        e.preventDefault();
        
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const category = document.getElementById('expense-category').value;
        const paymentMethod = document.getElementById('expense-payment').value;
        const description = document.getElementById('expense-description').value;

        const transaction = {
            type: 'expense',
            amount: amount,
            category: category,
            paymentMethod: paymentMethod,
            description: description || getDefaultDescription(category)
        };

        storage.addTransaction(transaction);
        updateDashboard();
        updateTransactions();
        closeAllModals();
        
        showNotification('Gasto agregado correctamente', 'success');
    }

    function handleIncomeSubmit(e) {
        e.preventDefault();
        
        const amount = parseFloat(document.getElementById('income-amount').value);
        const source = document.getElementById('income-source').value;
        const description = document.getElementById('income-description').value;

        const transaction = {
            type: 'income',
            amount: amount,
            category: source,
            paymentMethod: 'cash', // Income always adds to cash
            description: description || getIncomeDescription(source)
        };

        storage.addTransaction(transaction);
        updateDashboard();
        updateTransactions();
        closeAllModals();
        
        showNotification('Ingreso agregado correctamente', 'success');
    }

    function handleSavingsGoalSubmit(e) {
        e.preventDefault();
        
        const amount = parseFloat(document.getElementById('goal-amount').value);
        const days = parseInt(document.getElementById('goal-days').value);
        const description = document.getElementById('goal-description').value;

        const goal = {
            amount: amount,
            days: days,
            description: description,
            createdAt: new Date().toISOString(),
            dailyAmount: amount / days
        };

        storage.setSavingsGoal(goal);
        updateSavings();
        closeAllModals();
        
        showNotification('Meta de ahorro establecida', 'success');
    }

    function handleAddSavingsSubmit(e) {
        e.preventDefault();
        
        const amount = parseFloat(document.getElementById('savings-amount').value);
        const description = document.getElementById('savings-description').value;

        const saving = {
            amount: amount,
            description: description || 'Ahorro adicional'
        };

        storage.addSaving(saving);
        storage.addToTotalBalance(amount); // Add to total balance when saving
        updateDashboard();
        updateSavings();
        closeAllModals();
        
        showNotification('Ahorro agregado correctamente', 'success');
    }

    function updateDailySavingAmount() {
        const amount = parseFloat(document.getElementById('goal-amount').value) || 0;
        const days = parseInt(document.getElementById('goal-days').value) || 1;
        const dailyAmount = amount / days;
        
        document.getElementById('daily-saving-amount').innerHTML = 
            `Debes ahorrar: <strong>RD$ ${dailyAmount.toFixed(2)}</strong> por día`;
    }

    function getDefaultDescription(category) {
        const descriptions = {
            'food': 'Comida universitaria',
            'university': 'Materiales universitarios',
            'cleaning': 'Productos de limpieza',
            'transport': 'Transporte',
            'unnecessary': 'Gasto personal'
        };
        return descriptions[category] || 'Gasto varios';
    }

    function getIncomeDescription(source) {
        const descriptions = {
            'family': 'Apoyo familiar',
            'work': 'Ingreso por trabajo',
            'scholarship': 'Beca universitaria',
            'other': 'Otros ingresos'
        };
        return descriptions[source] || 'Ingreso adicional';
    }

    function updateDashboard() {
        // Update balances
        const totalBalance = storage.getTotalBalance();
        const cashBalance = storage.getCashBalance();
        
        document.getElementById('current-balance').textContent = `RD$ ${totalBalance.toFixed(2)}`;
        document.getElementById('cash-amount').textContent = `RD$ ${cashBalance.toFixed(2)}`;
        
        // Update weekly stats
        const weeklyExpense = storage.getWeeklyExpenses();
        const totalSaved = storage.getTotalSavings();
        
        document.getElementById('weekly-expense').textContent = `RD$ ${weeklyExpense.toFixed(2)}`;
        document.getElementById('total-saved').textContent = `RD$ ${totalSaved.toFixed(2)}`;
        
        // Update categories
        updateCategories();
        
        // Update recommendations
        updateRecommendations();
    }

    function updateCategories() {
        const categoriesGrid = document.getElementById('categories-grid');
        const categoryExpenses = storage.getWeeklyExpensesByCategory();
        const weeklyTotal = storage.getWeeklyExpenses();
        
        const categories = [
            { id: 'food', name: '🍔 Comida', icon: '🍔' },
            { id: 'university', name: '📚 Universidad', icon: '📚' },
            { id: 'cleaning', name: '🧴 Detergentes', icon: '🧴' },
            { id: 'transport', name: '🚌 Transporte', icon: '🚌' },
            { id: 'unnecessary', name: '🛍️ No Necesarios', icon: '🛍️' }
        ];
        
        categoriesGrid.innerHTML = '';
        
        categories.forEach(category => {
            const amount = categoryExpenses[category.id] || 0;
            const percentage = weeklyTotal > 0 ? (amount / weeklyTotal * 100) : 0;
            
            const categoryCard = document.createElement('div');
            categoryCard.className = `category-card category-${category.id}`;
            categoryCard.innerHTML = `
                <div class="category-header">
                    <span class="category-icon">${category.icon}</span>
                    <span class="category-name">${category.name}</span>
                </div>
                <span class="category-amount">RD$ ${amount.toFixed(2)}</span>
                <span class="category-percentage">${percentage.toFixed(1)}% del total</span>
            `;
            
            categoriesGrid.appendChild(categoryCard);
        });
    }

    function updateRecommendations() {
        const recommendationsList = document.getElementById('recommendations-list');
        const categoryExpenses = storage.getWeeklyExpensesByCategory();
        const unnecessaryExpense = categoryExpenses.unnecessary || 0;
        
        recommendationsList.innerHTML = '';
        
        const recommendations = [];
        
        if (unnecessaryExpense > 200) {
            recommendations.push({
                icon: '💡',
                text: `Considera reducir gastos no necesarios en RD$ ${(unnecessaryExpense * 0.2).toFixed(2)} esta semana`
            });
        }
        
        const weeklyExpense = storage.getWeeklyExpenses();
        const totalBalance = storage.getTotalBalance();
        
        if (weeklyExpense > totalBalance * 0.7) {
            recommendations.push({
                icon: '⚠️',
                text: 'Estás gastando más del 70% de tu balance semanal. Considera ajustar tus gastos.'
            });
        }
        
        if (storage.getCashBalance() < 100) {
            recommendations.push({
                icon: '💰',
                text: 'Tu efectivo está bajo. Considera agregar más dinero o reducir gastos en efectivo.'
            });
        }
        
        const savingsGoal = storage.getSavingsGoal();
        if (savingsGoal) {
            const totalSaved = storage.getTotalSavings();
            const remaining = savingsGoal.amount - totalSaved;
            if (remaining > 0) {
                recommendations.push({
                    icon: '🎯',
                    text: `Para alcanzar tu meta de ahorro, necesitas ahorrar RD$ ${savingsGoal.dailyAmount.toFixed(2)} por día`
                });
            }
        }
        
        if (recommendations.length === 0) {
            recommendations.push({
                icon: '✅',
                text: '¡Buen trabajo! Tus finanzas se ven saludables esta semana.'
            });
        }
        
        recommendations.forEach(rec => {
            const recItem = document.createElement('div');
            recItem.className = 'recommendation-item';
            recItem.innerHTML = `
                <span class="recommendation-icon">${rec.icon}</span>
                <span class="recommendation-text">${rec.text}</span>
            `;
            recommendationsList.appendChild(recItem);
        });
    }

    function updateTransactions() {
        const transactionsList = document.getElementById('transactions-list');
        const categoryFilter = document.getElementById('category-filter').value;
        let transactions = storage.getTransactions();
        
        // Sort by date (newest first)
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Apply category filter
        if (categoryFilter !== 'all') {
            transactions = transactions.filter(transaction => 
                transaction.category === categoryFilter
            );
        }
        
        transactionsList.innerHTML = '';
        
        if (transactions.length === 0) {
            transactionsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <p>No hay movimientos registrados</p>
                    <p>Agrega tu primer gasto o ingreso</p>
                </div>
            `;
            return;
        }
        
        transactions.forEach(transaction => {
            const transactionItem = document.createElement('div');
            transactionItem.className = `transaction-item transaction-${transaction.type}`;
            
            const categoryInfo = getCategoryInfo(transaction.category);
            const date = new Date(transaction.date).toLocaleDateString('es-DO');
            
            transactionItem.innerHTML = `
                <div class="transaction-info">
                    <span class="transaction-icon">${categoryInfo.icon}</span>
                    <div class="transaction-details">
                        <span class="transaction-category">${categoryInfo.name}</span>
                        <span class="transaction-description">${transaction.description} • ${date}</span>
                    </div>
                </div>
                <span class="transaction-amount">
                    ${transaction.type === 'expense' ? '-' : '+'}RD$ ${transaction.amount.toFixed(2)}
                </span>
            `;
            
            transactionsList.appendChild(transactionItem);
        });
    }

    function updateSavings() {
        const savingsTotal = storage.getTotalSavings();
        const savingsGoal = storage.getSavingsGoal();
        
        // Update savings total
        document.getElementById('savings-total').textContent = `RD$ ${savingsTotal.toFixed(2)}`;
        
        // Update savings goal
        const goalCard = document.getElementById('savings-goal-card');
        const goalInfo = document.getElementById('goal-info');
        const goalProgress = document.getElementById('goal-progress');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (savingsGoal) {
            const progress = Math.min((savingsTotal / savingsGoal.amount) * 100, 100);
            
            goalInfo.innerHTML = `
                <p><strong>${savingsGoal.description}</strong></p>
                <p>Meta: RD$ ${savingsGoal.amount.toFixed(2)} en ${savingsGoal.days} días</p>
                <p>Debes ahorrar: RD$ ${savingsGoal.dailyAmount.toFixed(2)} por día</p>
            `;
            
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${progress.toFixed(1)}% completado`;
            
            goalProgress.style.display = 'block';
        } else {
            goalInfo.innerHTML = '<p>No hay una meta activa</p>';
            goalProgress.style.display = 'none';
        }
        
        // Update savings history
        updateSavingsHistory();
    }

    function updateSavingsHistory() {
        const savingsList = document.getElementById('savings-list');
        const savings = storage.getSavings();
        
        // Sort by date (newest first)
        savings.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        savingsList.innerHTML = '';
        
        if (savings.length === 0) {
            savingsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💰</div>
                    <p>No hay historial de ahorros</p>
                    <p>Comienza agregando tu primer ahorro</p>
                </div>
            `;
            return;
        }
        
        savings.forEach(saving => {
            const savingsItem = document.createElement('div');
            savingsItem.className = 'savings-item';
            
            const date = new Date(saving.date).toLocaleDateString('es-DO');
            
            savingsItem.innerHTML = `
                <div>
                    <div class="savings-description">${saving.description}</div>
                    <div class="savings-date">${date}</div>
                </div>
                <span class="savings-item-amount">+RD$ ${saving.amount.toFixed(2)}</span>
            `;
            
            savingsList.appendChild(savingsItem);
        });
    }

    function getCategoryInfo(category) {
        const categories = {
            'food': { name: '🍔 Comida', icon: '🍔' },
            'university': { name: '📚 Universidad', icon: '📚' },
            'cleaning': { name: '🧴 Detergentes', icon: '🧴' },
            'transport': { name: '🚌 Transporte', icon: '🚌' },
            'unnecessary': { name: '🛍️ No Necesarios', icon: '🛍️' },
            'family': { name: '👪 Familia', icon: '👪' },
            'work': { name: '💼 Trabajo', icon: '💼' },
            'scholarship': { name: '🎓 Beca', icon: '🎓' },
            'other': { name: '✨ Otro', icon: '✨' }
        };
        
        return categories[category] || { name: '📦 Varios', icon: '📦' };
    }

    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--fern)' : '#A4133C'};
            color: white;
            padding: 15px 25px;
            border-radius: var(--border-radius-sm);
            box-shadow: var(--shadow-card);
            z-index: 10000;
            font-family: var(--font-body);
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
});
