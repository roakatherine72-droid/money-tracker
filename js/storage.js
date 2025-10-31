// Storage management for the expense tracker
class StorageManager {
    constructor() {
        this.transactionsKey = 'expenseTracker_transactions';
        this.savingsKey = 'expenseTracker_savings';
        this.savingsGoalKey = 'expenseTracker_savingsGoal';
        this.cashBalanceKey = 'expenseTracker_cashBalance';
        this.totalBalanceKey = 'expenseTracker_totalBalance';
    }

    // Transactions management
    getTransactions() {
        const transactions = localStorage.getItem(this.transactionsKey);
        return transactions ? JSON.parse(transactions) : [];
    }

    saveTransactions(transactions) {
        localStorage.setItem(this.transactionsKey, JSON.stringify(transactions));
    }

    addTransaction(transaction) {
        const transactions = this.getTransactions();
        transaction.id = Date.now().toString();
        transaction.date = new Date().toISOString();
        transactions.push(transaction);
        this.saveTransactions(transactions);
        
        // Update balances
        this.updateBalances(transaction);
        
        return transaction;
    }

    // Balances management
    getCashBalance() {
        const balance = localStorage.getItem(this.cashBalanceKey);
        return balance ? parseFloat(balance) : 0;
    }

    getTotalBalance() {
        const balance = localStorage.getItem(this.totalBalanceKey);
        return balance ? parseFloat(balance) : 0;
    }

    setCashBalance(amount) {
        localStorage.setItem(this.cashBalanceKey, amount.toString());
    }

    setTotalBalance(amount) {
        localStorage.setItem(this.totalBalanceKey, amount.toString());
    }

    updateBalances(transaction) {
        let cashBalance = this.getCashBalance();
        let totalBalance = this.getTotalBalance();

        if (transaction.type === 'income') {
            cashBalance += transaction.amount;
            totalBalance += transaction.amount;
        } else if (transaction.type === 'expense') {
            totalBalance -= transaction.amount;
            if (transaction.paymentMethod === 'cash') {
                cashBalance -= transaction.amount;
            }
        }

        this.setCashBalance(cashBalance);
        this.setTotalBalance(totalBalance);
    }

    addToCashBalance(amount) {
        const currentBalance = this.getCashBalance();
        this.setCashBalance(currentBalance + amount);
    }

    addToTotalBalance(amount) {
        const currentBalance = this.getTotalBalance();
        this.setTotalBalance(currentBalance + amount);
    }

    // Savings management
    getSavings() {
        const savings = localStorage.getItem(this.savingsKey);
        return savings ? JSON.parse(savings) : [];
    }

    saveSavings(savings) {
        localStorage.setItem(this.savingsKey, JSON.stringify(savings));
    }

    addSaving(saving) {
        const savings = this.getSavings();
        saving.id = Date.now().toString();
        saving.date = new Date().toISOString();
        savings.push(saving);
        this.saveSavings(savings);
        return saving;
    }

    getTotalSavings() {
        const savings = this.getSavings();
        return savings.reduce((total, saving) => total + saving.amount, 0);
    }

    // Savings goal management
    getSavingsGoal() {
        const goal = localStorage.getItem(this.savingsGoalKey);
        return goal ? JSON.parse(goal) : null;
    }

    setSavingsGoal(goal) {
        localStorage.setItem(this.savingsGoalKey, JSON.stringify(goal));
    }

    clearSavingsGoal() {
        localStorage.removeItem(this.savingsGoalKey);
    }

    // Utility methods
    getWeeklyExpenses() {
        const transactions = this.getTransactions();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        return transactions
            .filter(transaction => 
                transaction.type === 'expense' && 
                new Date(transaction.date) >= oneWeekAgo
            )
            .reduce((total, transaction) => total + transaction.amount, 0);
    }

    getCategoryExpenses(category) {
        const transactions = this.getTransactions();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        return transactions
            .filter(transaction => 
                transaction.type === 'expense' && 
                transaction.category === category &&
                new Date(transaction.date) >= oneWeekAgo
            )
            .reduce((total, transaction) => total + transaction.amount, 0);
    }

    getWeeklyExpensesByCategory() {
        const categories = ['food', 'university', 'cleaning', 'transport', 'unnecessary'];
        const expenses = {};
        
        categories.forEach(category => {
            expenses[category] = this.getCategoryExpenses(category);
        });
        
        return expenses;
    }

    // Initialize with some cash if first time
    initializeFirstTime() {
        if (!localStorage.getItem(this.cashBalanceKey)) {
            this.setCashBalance(0);
            this.setTotalBalance(0);
        }
    }
}
