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

// Authentication Module
const Auth = {
    // Current user in session
    user: JSON.parse(localStorage.getItem('currentUser') || 'null'),

    login: () => {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const role = document.getElementById('roleInput').value;

        // Simple Validation
        if (!username || !password) {
            alert('يرجى إدخال اسم المستخدم وكلمة المرور');
            return;
        }

        // Beneficiary Login Logic
        if (role === 'beneficiary') {
            // Special check for beneficiaries (ID as username, 123 as password)
            if (password !== '123') { // Hardcoded demo password
                alert('كلمة المرور غير صحيحة');
                return;
            }

            const beneficiaries = Storage.get('beneficiaries');
            const ben = beneficiaries.find(b => b.identity === username); // Treat username as ID input

            if (ben) {
                const sessionUser = {
                    id: ben.id,
                    name: ben.name,
                    username: ben.identity,
                    role: 'beneficiary'
                };
                localStorage.setItem('currentUser', JSON.stringify(sessionUser));
                Auth.user = sessionUser;
                window.location.href = 'beneficiary_home.html';
                return;
            } else {
                alert('رقم الهوية غير مسجل في النظام');
                return;
            }
        }

        // Admin & Merchant Login Logic
        const users = Storage.get('users');
        const user = users.find(u => u.username === username && u.password === password && u.role === role);

        if (user) {
            // Success
            localStorage.setItem('currentUser', JSON.stringify(user));
            Auth.user = user;

            // Redirect based on role
            if (user.role === 'admin') {
                window.location.href = 'index.html';
            } else {
                window.location.href = 'merchant_home.html';
            }
        } else {
            alert('بيانات الدخول غير صحيحة!');
        }
    },

    logout: () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    },

    setRole: (role) => {
        document.getElementById('roleInput').value = role;
        document.querySelectorAll('.role-option').forEach(el => el.classList.remove('active'));
        document.getElementById(`role_${role}`).classList.add('active');

        // Dynamic placeholder for Beneficiary
        const userLabel = document.querySelector('label i.fa-user').parentNode;
        const userInput = document.getElementById('username');
        if (role === 'beneficiary') {
            userLabel.childNodes[1].textContent = " رقم الهوية"; // Keep icon
            userInput.placeholder = "أدخل رقم الهوية (مثلاً: 1010101010)";
        } else {
            userLabel.childNodes[1].textContent = " اسم المستخدم";
            userInput.placeholder = "أدخل اسم المستخدم";
        }
    },

    checkSession: () => {
        // If we are on login page, do nothing (or redirect if already logged in)
        if (window.location.pathname.includes('login.html')) {
            if (Auth.user) {
                if (Auth.user.role === 'admin') window.location.href = 'index.html';
                else if (Auth.user.role === 'merchant') window.location.href = 'merchant_home.html';
                else if (Auth.user.role === 'beneficiary') window.location.href = 'beneficiary_home.html';
            }
            return;
        }

        // If not logged in, go to login
        if (!Auth.user) {
            window.location.href = 'login.html';
            return;
        }

        // Role Protection
        const page = window.location.pathname.split('/').pop();

        // Admin Pages
        const adminPages = ['index.html', 'cards.html', 'wallets.html', 'merchants.html', 'settings.html'];
        // Note: reports.html is shared but maybe limited view in future. kept accessible for now.

        if (Auth.user.role === 'merchant') {
            if (adminPages.some(p => page.includes(p))) {
                alert('عذراً، ليس لديك صلاحية للوصول لهذه الصفحة.');
                window.location.href = 'merchant_home.html';
            }
        }

        if (Auth.user.role === 'beneficiary') {
            if (!page.includes('beneficiary_home.html')) {
                // If trying to access anything else
                window.location.href = 'beneficiary_home.html';
            }
        }

        // Update Logout Button in UI if exists
        Auth.addLogoutButton();
    },

    addLogoutButton: () => {
        const sidebar = document.querySelector('.nav-links');
        if (sidebar && !document.getElementById('logoutBtn')) {
            const li = document.createElement('li');
            li.style.marginTop = '20px';
            li.style.borderTop = '1px solid #eee';
            li.innerHTML = `<a href="#" id="logoutBtn" onclick="Auth.logout()" style="color: #d32f2f;"><i class="fas fa-sign-out-alt"></i> تسجيل خروج</a>`;
            sidebar.appendChild(li);
        }

        // Update user profile name if exists
        const profileName = document.querySelector('.user-profile span');
        if (profileName && Auth.user) {
            profileName.innerText = `مرحباً، ${Auth.user.name}`;
        }
    }
};

// Initialize Dummy Data if Empty
function initData() {
    // New: Users
    if (localStorage.getItem('users') === null) {
        Storage.set('users', [
            { id: 1, name: 'مدير النظام', username: 'admin', password: '123', role: 'admin' },
            { id: 2, name: 'تاجر السوبرماركت', username: 'merchant', password: '123', role: 'merchant' }
        ]);
    }

    if (localStorage.getItem('cards') === null) {
        Storage.set('cards', [
            { id: 1, number: '10001', balance: 500, status: 'نشط', wallet: 'إعانة غذائية', beneficiary: 'محمد أحمد' },
            { id: 2, number: '10002', balance: 1500, status: 'نشط', wallet: 'دعم كساء', beneficiary: 'سارة خالد' },
            { id: 3, number: '10003', balance: 0, status: 'موقوف', wallet: 'خدمات عامة', beneficiary: 'غير محدد' }
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
            { id: 201, name: 'متجر الملابس العصرية', category: 'ملابس', transactions: 5, status: 'نشط' }
        ]);
    }
    if (localStorage.getItem('transactions') === null) {
        Storage.set('transactions', [
            { id: 101, card: '10001', amount: 50, date: '2023-10-25', merchant: 'سوبرماركت الرياض' },
            { id: 102, card: '10002', amount: 200, date: '2023-10-26', merchant: 'متجر الملابس العصرية' }
        ]);
    }
    // New: Custom Labels
    if (localStorage.getItem('customLabels') === null) {
        Storage.set('customLabels', {
            label_cards: 'البطاقات',
            label_wallets: 'المحافظ',
            label_merchants: 'المتاجر',
            label_beneficiaries: 'المستفيدين'
        });
    }
    // New: Categories
    if (localStorage.getItem('categories') === null) {
        Storage.set('categories', ['إعانة غذائية', 'دعم كساء', 'خدمات عامة']);
    }
    // New: Beneficiaries
    if (localStorage.getItem('beneficiaries') === null) {
        Storage.set('beneficiaries', [
            { id: 1, name: 'محمد أحمد', identity: '1010101010' },
            { id: 2, name: 'سارة خالد', identity: '2020202020' }
        ]);
    }
}

// Logic for Actions
const Actions = {
    addCard: () => {
        const number = document.getElementById('cardNumInput').value;
        const wallet = document.getElementById('cardWalletInput').value;
        const balance = parseFloat(document.getElementById('cardBalanceInput').value);
        const beneficiary = document.getElementById('cardBeneficiaryInput').value;

        if (!number || !wallet || isNaN(balance)) {
            alert('يرجى ملء جميع الحقول بشكل صحيح');
            return;
        }

        Storage.add('cards', {
            id: Date.now(),
            number: number,
            wallet: wallet,
            balance: balance,
            status: 'نشط',
            beneficiary: beneficiary || 'غير محدد'
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

    addUser: () => {
        const username = document.getElementById('newUsername').value.trim();
        const name = document.getElementById('newName').value.trim();
        const password = document.getElementById('newPassword').value.trim();
        const role = document.getElementById('newUserRole').value;
        const linkedEntity = document.getElementById('linkedEntitySelect').value;

        if (!username || !name || !password) {
            alert('يرجى تعبئة الحقول الأساسية');
            return;
        }

        if ((role === 'merchant' || role === 'beneficiary') && !linkedEntity) {
            alert('يرجى اختيار الجهة المرتبطة بهذا الحساب (المتجر أو المستفيد)');
            return;
        }

        const users = Storage.get('users');
        if (users.some(u => u.username === username)) {
            alert('اسم المستخدم مسجل مسبقاً، اختر اسماً آخر.');
            return;
        }

        const newUser = {
            id: Date.now(),
            name: name,
            username: username,
            password: password,
            role: role,
            linkedEntity: linkedEntity || null
        };

        Storage.add('users', newUser);
        alert('تم إنشاء المستخدم بنجاح!');
        location.reload();
    },

    deleteUser: (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
        let users = Storage.get('users');
        users = users.filter(u => u.id !== id);
        Storage.set('users', users);
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
                display.innerHTML = `<span style="color:green">تم التحقق: محفظة ${card.wallet} (الرصيد: ${card.balance} ريال)</span><br><small>المستفيد: ${card.beneficiary || 'غير معروف'}</small>`;
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
            <strong>المستفيد:</strong> ${cards[cardIndex].beneficiary || 'غير محدد'}<br>
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

// Settings Module
const Settings = {
    labels: {},

    load: () => {
        Settings.labels = Storage.get('customLabels');
        Settings.applyLabels();

        // If on settings page, populate inputs
        if (window.location.pathname.includes('settings.html')) {
            document.getElementById('label_cards').value = Settings.labels.label_cards;
            document.getElementById('label_wallets').value = Settings.labels.label_wallets;
            document.getElementById('label_merchants').value = Settings.labels.label_merchants;
            document.getElementById('label_beneficiaries').value = Settings.labels.label_beneficiaries;

            Settings.renderCategories();
            Settings.renderBeneficiaries();
        }

        // Populate dynamic dropdowns if they exist
        Settings.populateDropdowns();
    },

    saveLabels: () => {
        const newLabels = {
            label_cards: document.getElementById('label_cards').value || 'البطاقات',
            label_wallets: document.getElementById('label_wallets').value || 'المحافظ',
            label_merchants: document.getElementById('label_merchants').value || 'المتاجر',
            label_beneficiaries: document.getElementById('label_beneficiaries').value || 'المستفيدين'
        };
        Storage.set('customLabels', newLabels);
        alert('تم حفظ التسميات بنجاح!');
        location.reload();
    },

    applyLabels: () => {
        const labels = Settings.labels;
        // Navigation & Titles
        document.querySelectorAll('[data-i18n="nav_cards"]').forEach(el => el.innerHTML = `<i class="fas fa-credit-card"></i> ${labels.label_cards}`);
        document.querySelectorAll('[data-i18n="nav_wallets"]').forEach(el => el.innerHTML = `<i class="fas fa-wallet"></i> ${labels.label_wallets}`);
        document.querySelectorAll('[data-i18n="nav_merchants"]').forEach(el => el.innerHTML = `<i class="fas fa-store"></i> ${labels.label_merchants}`);
        document.querySelectorAll('[data-i18n="nav_settings"]').forEach(el => el.innerHTML = `<i class="fas fa-cog"></i> الإعدادات`);

        // Specific Pages Titles
        const pageTitle = document.querySelector('h1[data-i18n]');
        if (pageTitle) {
            const key = pageTitle.getAttribute('data-i18n');
            if (key === 'page_cards_title') pageTitle.innerHTML = `<i class="fas fa-credit-card"></i> إدارة ${labels.label_cards}`;
            if (key === 'page_wallets_title') pageTitle.innerHTML = `<i class="fas fa-wallet"></i> إدارة ${labels.label_wallets}`;
            if (key === 'page_merchants_title') pageTitle.innerHTML = `<i class="fas fa-store"></i> إدارة ${labels.label_merchants}`;
        }
    },

    addCategory: () => {
        const input = document.getElementById('newCategoryInput');
        const val = input.value.trim();
        if (!val) return;

        Storage.add('categories', val);
        input.value = '';
        Settings.renderCategories();
    },

    deleteCategory: (index) => {
        const cats = Storage.get('categories');
        cats.splice(index, 1);
        Storage.set('categories', cats);
        Settings.renderCategories();
    },

    renderCategories: () => {
        const list = document.getElementById('categoriesList');
        if (!list) return;
        const cats = Storage.get('categories');
        list.innerHTML = '';
        cats.forEach((cat, idx) => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.innerHTML = `<span>${cat}</span> <button class="delete-btn" onclick="Settings.deleteCategory(${idx})"><i class="fas fa-trash"></i></button>`;
            list.appendChild(li);
        });
    },

    addBeneficiary: () => {
        const name = document.getElementById('beneficiaryName').value;
        const id = document.getElementById('beneficiaryID').value;
        if (!name || !id) { alert('يرجى إدخال البيانات كاملة'); return; }

        Storage.add('beneficiaries', { id: Date.now(), name, identity: id });
        document.getElementById('beneficiaryName').value = '';
        document.getElementById('beneficiaryID').value = '';
        Settings.renderBeneficiaries();
        alert('تم إضافة المستفيد');
    },

    deleteBeneficiary: (id) => {
        if (!confirm('هل أنت متأكد من الحذف؟')) return;
        let bens = Storage.get('beneficiaries');
        bens = bens.filter(b => b.id !== id);
        Storage.set('beneficiaries', bens);
        Settings.renderBeneficiaries();
    },

    renderBeneficiaries: () => {
        const tbody = document.getElementById('beneficiariesTableBody');
        if (!tbody) return;
        const bens = Storage.get('beneficiaries');
        const cards = Storage.get('cards');
        tbody.innerHTML = '';
        bens.forEach(b => {
            const cardCount = cards.filter(c => c.beneficiary === b.name).length;
            tbody.innerHTML += `
                <tr>
                    <td>${b.name}</td>
                    <td>${b.identity}</td>
                    <td>${cardCount} بطاقة</td>
                    <td><button class="delete-btn" onclick="Settings.deleteBeneficiary(${b.id})"><i class="fas fa-trash"></i></button></td>
                </tr>
             `;
        });
    },

    populateDropdowns: () => {
        // Categories Dropdown (in create card or wallet)
        const walletSelect = document.getElementById('cardWalletInput');
        if (walletSelect) {
            const cats = Storage.get('categories');
            walletSelect.innerHTML = '';
            cats.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c;
                opt.innerText = c;
                walletSelect.appendChild(opt);
            });
        }

        // Beneficiaries Dropdown (in create card)
        const benSelect = document.getElementById('cardBeneficiaryInput');
        if (benSelect) {
            const bens = Storage.get('beneficiaries');
            benSelect.innerHTML = '<option value="">اختر مستفيد...</option>';
            bens.forEach(b => {
                const opt = document.createElement('option');
                opt.value = b.name;
                opt.innerText = `${b.name} (${b.identity})`;
                benSelect.appendChild(opt);
            });
        }
    }
    populateDropdown: (type, targetElement) => {
        const data = Storage.get(type);
        targetElement.innerHTML = '<option value="">-- اختر --</option>';
        data.forEach(item => {
            const opt = document.createElement('option');
            if (type === 'merchants') {
                // Determine if item is object or string, though merchants are objects
                const val = item.name || item;
                opt.value = val;
                opt.innerText = val;
            } else if (type === 'beneficiaries') {
                opt.value = item.identity;
                opt.innerText = `${item.name} (${item.identity})`;
            }
            targetElement.appendChild(opt);
        });
    }
};

// Page Load Logic
function loadDashboard() {
    const cards = Storage.get('cards');
    const transactions = Storage.get('transactions');
    const bens = Storage.get('beneficiaries');

    if (document.getElementById('totalCards')) document.getElementById('totalCards').innerText = cards.length;
    if (document.getElementById('totalTransactions')) document.getElementById('totalTransactions').innerText = transactions.length;

    const activeCards = cards.filter(c => c.status === 'نشط' || c.status === 'Active').length;
    if (document.getElementById('activeCards')) document.getElementById('activeCards').innerText = activeCards;
}

function loadUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    const users = Storage.get('users');
    tbody.innerHTML = '';
    users.forEach(u => {
        let roleBadge = '';
        if (u.role === 'admin') roleBadge = '<span class="status-badge status-active">مدير</span>';
        if (u.role === 'merchant') roleBadge = '<span class="status-badge" style="background:#fff3cd; color:#856404">تاجر</span>';
        if (u.role === 'beneficiary') roleBadge = '<span class="status-badge" style="background:#d1ecf1; color:#0c5460">مستفيد</span>';

        tbody.innerHTML += `
            <tr>
                <td>${u.username}</td>
                <td>${u.name}</td>
                <td>${roleBadge}</td>
                <td>${u.linkedEntity || '-'}</td>
                <td>
                    ${u.role !== 'admin' || u.username !== 'admin' ?
                `<button class="delete-btn" onclick="Actions.deleteUser(${u.id})"><i class="fas fa-trash"></i></button>` :
                ''}
                </td>
            </tr>
        `;
    });
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
            <td>${card.beneficiary || '-'}</td>
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
    Settings.load();
    Auth.checkSession(); // New: Check Session

    // Only load these if we are logged in and on a valid page (Auth.checkSession will handle redirects)
    loadDashboard();
    loadCardsTable();
    loadWalletsTable();
    loadMerchantsTable();
    loadUsersTable(); // New: Load Users

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

    // Update dashboard beneficiaries count if ID exists
    const bens = Storage.get('beneficiaries');
    if (document.getElementById('totalBeneficiaries')) {
        document.getElementById('totalBeneficiaries').innerText = bens.length;
    }
};
