// Utility to handle local storage data simulation
const Storage = {
    get: (key) => JSON.parse(localStorage.getItem(key) || '[]'),
    set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
    add: (key, item) => {
        const data = Storage.get(key);
        data.push(item);
        Storage.set(key, data);
    }
};

// Initialize Dummy Data if Empty
function initData() {
    if (localStorage.getItem('cards') === null) {
        Storage.set('cards', [
            { id: 1, number: '10001', balance: 500, status: 'نشط', wallet: 'إعانة غذائية' },
            { id: 2, number: '10002', balance: 1500, status: 'نشط', wallet: 'دعم كساء' },
            { id: 3, number: '10003', balance: 0, status: 'موقوف', wallet: 'خدمات عامة' }
        ]);
    }
    if (localStorage.getItem('wallets') === null) {
        Storage.set('wallets', [
            { id: 1, name: 'إعانة غذائية', funds: 5000, merchants: 'سوبرماركت الرياض', status: 'نشط' },
            { id: 2, name: 'دعم كساء', funds: 2000, merchants: 'متجر الملابس العصرية', status: 'نشط' }
        ]);
    }
    if (localStorage.getItem('merchants') === null) {
        Storage.set('merchants', [
            { id: 101, name: 'سوبرماركت الرياض', category: 'مواد غذائية', transactions: 12, status: 'نشط' },
            { id: 102, name: 'متجر الملابس العصرية', category: 'ملابس', transactions: 5, status: 'نشط' }
        ]);
    }
    if (localStorage.getItem('transactions') === null) {
        Storage.set('transactions', [
            { id: 101, card: '10001', amount: 50, date: '2023-10-25', merchant: 'سوبرماركت الرياض' },
            { id: 102, card: '10002', amount: 200, date: '2023-10-26', merchant: 'متجر الملابس العصرية' }
        ]);
    }
}

// Logic for Actions
const Actions = {
    addCard: () => {
        const number = document.getElementById('cardNumInput').value;
        const wallet = document.getElementById('cardWalletInput').value;
        const balance = parseFloat(document.getElementById('cardBalanceInput').value);

        if (!number || !wallet || isNaN(balance)) {
            alert('يرجى ملء جميع الحقول بشكل صحيح');
            return;
        }

        Storage.add('cards', {
            id: Date.now(),
            number: number,
            wallet: wallet,
            balance: balance,
            status: 'نشط'
        });

        alert('تم إصدار البطاقة بنجاح!');
        location.reload();
    },

    addWallet: () => {
        const name = document.getElementById('walletNameInput').value;
        const funds = parseFloat(document.getElementById('walletFundsInput').value);

        if (!name || isNaN(funds)) {
            alert('يرجى ملء جميع الحقول');
            return;
        }

        Storage.add('wallets', {
            id: Date.now(),
            name: name,
            funds: funds,
            merchants: 'غير محدد',
            status: 'نشط'
        });

        alert('تم إنشاء المحفظة بنجاح!');
        location.reload();
    },

    addMerchant: () => {
        const name = document.getElementById('merchantNameInput').value;
        const category = document.getElementById('merchantCatInput').value;

        if (!name) {
            alert('يرجى إدخال اسم المتجر');
            return;
        }

        Storage.add('merchants', {
            id: Math.floor(Math.random() * 1000),
            name: name,
            category: category,
            transactions: 0,
            status: 'نشط'
        });

        alert('تم إضافة المتجر بنجاح!');
        location.reload();
    },

    generateCardNum: () => {
        const num = '1000' + Math.floor(Math.random() * 9000 + 1000);
        document.getElementById('cardNumInput').value = num;
    },

    exportReport: () => {
        alert('جارِ تحميل التقرير بصيغة PDF...');
    }
};

// POS Logic
const POS = {
    currentCard: null,
    amount: '0',

    verifyCard: () => {
        const cardNumber = document.getElementById('cardNumber').value;
        const cards = Storage.get('cards');
        const card = cards.find(c => c.number === cardNumber);

        const display = document.getElementById('cardStatusDisplay');

        if (card) {
            if (card.status === 'موقوف' || card.status === 'Inactive') {
                display.innerHTML = '<span style="color:red">البطاقة موقوفة</span>';
                POS.currentCard = null;
            } else {
                POS.currentCard = card;
                display.innerHTML = `<span style="color:green">تم التحقق: محفظة ${card.wallet} (الرصيد: ${card.balance} ريال)</span>`;
            }
        } else {
            display.innerHTML = '<span style="color:red">البطاقة غير موجودة</span>';
            POS.currentCard = null;
        }
    },

    addToAmount: (num) => {
        if (POS.amount === '0') POS.amount = num.toString();
        else POS.amount += num.toString();
        POS.updateDisplay();
    },

    clearAmount: () => {
        POS.amount = '0';
        POS.updateDisplay();
    },

    updateDisplay: () => {
        document.getElementById('amountDisplay').innerText = parseFloat(POS.amount).toFixed(2);
    },

    processPayment: () => {
        if (!POS.currentCard) {
            alert('يرجى التحقق من البطاقة أولاً.');
            return;
        }

        const amount = parseFloat(POS.amount);
        if (amount <= 0) {
            alert('يرجى إدخال مبلغ صحيح.');
            return;
        }

        if (POS.currentCard.balance < amount) {
            alert('الرصيد غير كافٍ!');
            return;
        }

        // Deduct logic
        const cards = Storage.get('cards');
        const cardIndex = cards.findIndex(c => c.number === POS.currentCard.number);
        cards[cardIndex].balance -= amount;
        Storage.set('cards', cards);

        // Record Transaction
        const transaction = {
            id: Date.now(),
            card: POS.currentCard.number,
            amount: amount,
            date: new Date().toLocaleDateString('ar-SA'),
            merchant: 'نقطة بيع 1'
        };
        Storage.add('transactions', transaction);

        // Update Merchant Transaction Count
        // (Simplified: In a real app we'd find the specific merchant)

        // Show Success Modal
        document.getElementById('successModal').classList.add('active');
        document.getElementById('receiptContent').innerHTML = `
            <strong>رقم العملية:</strong> ${transaction.id}<br>
            <strong>التاريخ:</strong> ${transaction.date}<br>
            <strong>البطاقة:</strong> ${transaction.card}<br>
            <strong>المبلغ:</strong> ${transaction.amount.toFixed(2)} ريال<br>
            <strong>الرصيد المتبقي:</strong> ${cards[cardIndex].balance.toFixed(2)} ريال<br>
            <strong>الحالة:</strong> مقبولة
        `;

        // Reset
        POS.amount = '0';
        POS.currentCard = null;
        document.getElementById('cardNumber').value = '';
        document.getElementById('cardStatusDisplay').innerText = '';
        POS.updateDisplay();
    },

    closeModal: () => {
        document.getElementById('successModal').classList.remove('active');
    }
};

// Page Load Logic
function loadDashboard() {
    const cards = Storage.get('cards');
    const transactions = Storage.get('transactions');

    if (document.getElementById('totalCards')) document.getElementById('totalCards').innerText = cards.length;
    if (document.getElementById('totalTransactions')) document.getElementById('totalTransactions').innerText = transactions.length;

    const activeCards = cards.filter(c => c.status === 'نشط' || c.status === 'Active').length;
    if (document.getElementById('activeCards')) document.getElementById('activeCards').innerText = activeCards;
}

function loadCardsTable() {
    const cards = Storage.get('cards');
    const tbody = document.getElementById('cardsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    cards.forEach(card => {
        const tr = document.createElement('tr');
        const statusClass = (card.status === 'نشط' || card.status === 'Active') ? 'status-active' : 'status-inactive';
        tr.innerHTML = `
            <td>${card.number}</td>
            <td>${card.wallet}</td>
            <td>${card.balance} ريال</td>
            <td><span class="status-badge ${statusClass}">${card.status}</span></td>
            <td>
                <button class="secondary" onclick="alert('خاصية التعديل قادمة قريباً')">تعديل</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function loadWalletsTable() {
    const wallets = Storage.get('wallets');
    const tbody = document.getElementById('walletsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    wallets.forEach(w => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${w.name}</td>
            <td>$${w.funds}</td>
            <td>${w.merchants}</td>
            <td><span class="status-badge status-active">${w.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function loadMerchantsTable() {
    const merchants = Storage.get('merchants');
    const tbody = document.getElementById('merchantsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    merchants.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${m.id}</td>
            <td>${m.name}</td>
            <td>${m.category}</td>
            <td>${m.transactions}</td>
            <td><span class="status-badge status-active">${m.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

// Initialize on Load
window.onload = () => {
    initData();
    loadDashboard();
    loadCardsTable();
    loadWalletsTable();
    loadMerchantsTable();

    if (document.getElementById('transactionsTableBody')) {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const tbody = document.getElementById('transactionsTableBody');
        tbody.innerHTML = '';
        transactions.forEach(t => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${t.id}</td>
                <td>${t.merchant}</td>
                <td>${t.card}</td>
                <td style="color:var(--primary-color)"><strong>${t.amount.toFixed(2)} ريال</strong></td>
                <td>${t.date}</td>
            `;
            tbody.appendChild(tr);
        });
    }
};
