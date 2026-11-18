/**
 * Karachi Bites — Staff Portal Controller
 * Authenticates staff against the Express API and persists live orders,
 * branch statuses, menu stock toggles, and PKR pricing in PostgreSQL.
 */
(() => {
  'use strict';

  const STORAGE_KEYS = {
    PASSKEY: 'kb_staff_passkey_v1',
    BRANCH: 'kb_staff_branch_v1',
  };

  const ORDER_STATUSES = ['Pending', 'Preparing', 'Out for Delivery', 'Completed'];
  const POLL_INTERVAL_MS = 15000;

  // Application State
  const state = {
    passkey: '',
    orders: [],
    menuItems: [],
    selectedBranch: 'all',
    statusFilter: 'all',
    categoryFilter: 'All',
    searchQuery: '',
    pollTimerId: null,
    isLoading: false,
  };

  // DOM Elements
  const el = {
    loginView: document.getElementById('login-view'),
    dashboardView: document.getElementById('dashboard-view'),
    loginForm: document.getElementById('login-form'),
    passwordInput: document.getElementById('master-password'),
    togglePasswordBtn: document.getElementById('toggle-password'),
    loginError: document.getElementById('login-error'),
    logoutBtn: document.getElementById('logout-btn'),
    refreshBtn: document.getElementById('refresh-ledger-btn'),
    branchFilter: document.getElementById('branch-filter'),
    topbarActiveBranch: document.getElementById('topbar-active-branch'),
    syncFeedback: document.getElementById('sync-feedback'),
    kpiRevenue: document.getElementById('kpi-revenue'),
    kpiRevenueSub: document.getElementById('kpi-revenue-sub'),
    kpiActiveOrders: document.getElementById('kpi-active-orders'),
    kpiBranchSub: document.getElementById('kpi-branch-sub'),
    sidebarPendingCount: document.getElementById('sidebar-pending-count'),
    ordersTableBody: document.getElementById('orders-table-body'),
    ordersEmptyState: document.getElementById('orders-empty-state'),
    orderSearch: document.getElementById('order-search'),
    clearOrderFilters: document.getElementById('clear-order-filters'),
    menuInventoryList: document.getElementById('menu-inventory-list'),
    sectionOrders: document.getElementById('section-orders'),
    sectionInventory: document.getElementById('section-inventory'),
  };

  // =========================================================================
  // UI FEEDBACK & FORMATTING HELPERS
  // =========================================================================
  function pulseSyncStatus(message) {
    if (!el.syncFeedback) return;
    el.syncFeedback.textContent = message;
    el.syncFeedback.style.opacity = '1';
    window.clearTimeout(pulseSyncStatus._timer);
    pulseSyncStatus._timer = window.setTimeout(() => {
      el.syncFeedback.textContent = 'Live Queue';
      el.syncFeedback.style.opacity = '0.85';
    }, 2400);
  }

  function formatPkr(amount) {
    return `Rs. ${Number(amount || 0).toLocaleString('en-PK')}`;
  }

  // =========================================================================
  // API CLIENT
  // =========================================================================
  async function staffFetch(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      'x-staff-passkey': state.passkey,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      lockPortal('Invalid Credentials. Access Denied.');
      throw new Error(data.error || 'Invalid Credentials. Access Denied.');
    }

    if (!response.ok) {
      throw new Error(data.error || 'Request failed.');
    }

    return data;
  }

  async function verifyStaffPasskey(candidateKey) {
    const response = await fetch('/api/staff/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-staff-passkey': candidateKey,
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Invalid Credentials. Access Denied.');
    }

    return response.json();
  }

  async function fetchDashboardData(showFeedback = false) {
    if (!state.passkey || state.isLoading) return;
    state.isLoading = true;
    if (el.refreshBtn) {
      el.refreshBtn.disabled = true;
    }

    try {
      const [ordersRes, menuRes] = await Promise.all([
        staffFetch('/api/staff/orders'),
        staffFetch('/api/staff/menu'),
      ]);

      state.orders = Array.isArray(ordersRes.orders) ? ordersRes.orders : [];
      state.menuItems = Array.isArray(menuRes.items) ? menuRes.items : [];
      renderAll();

      if (showFeedback) {
        pulseSyncStatus('Ledger refreshed');
      }
    } catch (error) {
      if (el.syncFeedback) {
        el.syncFeedback.textContent =
          error instanceof Error ? error.message : 'Unable to refresh data';
      }
    } finally {
      state.isLoading = false;
      if (el.refreshBtn) {
        el.refreshBtn.disabled = false;
      }
    }
  }

  // =========================================================================
  // AUTHENTICATION FLOW
  // =========================================================================
  function startPolling() {
    stopPolling();
    state.pollTimerId = window.setInterval(() => {
      if (state.passkey && !el.dashboardView.classList.contains('is-hidden')) {
        fetchDashboardData(false);
      }
    }, POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (state.pollTimerId !== null) {
      window.clearInterval(state.pollTimerId);
      state.pollTimerId = null;
    }
  }

  function showDashboard(immediate) {
    el.loginView.classList.add('is-leaving');
    const delay = immediate ? 0 : 260;

    window.setTimeout(() => {
      el.loginView.classList.add('is-hidden');
      el.dashboardView.classList.remove('is-hidden');
      el.dashboardView.setAttribute('aria-hidden', 'false');

      requestAnimationFrame(() => {
        el.dashboardView.classList.add('is-entered');
      });

      fetchDashboardData(false);
      startPolling();
    }, delay);
  }

  function lockPortal(errorMessage = '') {
    stopPolling();
    state.passkey = '';
    state.orders = [];
    state.menuItems = [];
    sessionStorage.removeItem(STORAGE_KEYS.PASSKEY);

    el.dashboardView.classList.remove('is-entered');
    el.dashboardView.classList.add('is-hidden');
    el.dashboardView.setAttribute('aria-hidden', 'true');

    el.loginView.classList.remove('is-hidden', 'is-leaving');
    el.passwordInput.value = '';
    el.loginError.textContent = errorMessage;
    el.passwordInput.focus();
  }

  function bindAuthEvents() {
    el.togglePasswordBtn.addEventListener('click', () => {
      const isPassword = el.passwordInput.type === 'password';
      el.passwordInput.type = isPassword ? 'text' : 'password';
      el.togglePasswordBtn.textContent = isPassword ? 'Hide' : 'Show';
      el.togglePasswordBtn.setAttribute(
        'aria-label',
        isPassword ? 'Hide password' : 'Show password'
      );
    });

    el.loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const entered = el.passwordInput.value.trim();
      if (!entered) {
        el.loginError.textContent = 'Invalid Credentials. Access Denied.';
        el.passwordInput.focus();
        return;
      }

      const submitBtn = el.loginForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        await verifyStaffPasskey(entered);
        state.passkey = entered;
        sessionStorage.setItem(STORAGE_KEYS.PASSKEY, entered);
        el.loginError.textContent = '';
        showDashboard(false);
      } catch {
        el.loginError.textContent = 'Invalid Credentials. Access Denied.';
        el.passwordInput.select();
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    el.logoutBtn.addEventListener('click', () => lockPortal(''));
  }

  // =========================================================================
  // RENDERING: KPIs, ORDERS TABLE, MENU INVENTORY
  // =========================================================================
  function getBranchScopedOrders() {
    if (state.selectedBranch === 'all') {
      return state.orders;
    }
    return state.orders.filter((order) => order.branch === state.selectedBranch);
  }

  function renderKpis() {
    const branchOrders = getBranchScopedOrders();
    const totalRevenue = branchOrders.reduce((sum, ord) => sum + Number(ord.totalPkr || 0), 0);
    const activeCount = branchOrders.filter((ord) => ord.status !== 'Completed').length;
    const pendingOnlyCount = state.orders.filter((ord) => ord.status === 'Pending').length;

    el.kpiRevenue.textContent = formatPkr(totalRevenue);
    el.kpiRevenueSub.textContent =
      state.selectedBranch === 'all'
        ? `Across ${branchOrders.length} evening orders`
        : `${state.selectedBranch} enclave (${branchOrders.length} orders)`;

    el.kpiActiveOrders.textContent =
      activeCount === 1 ? '1 Order Pending' : `${activeCount} Orders Pending`;
    el.sidebarPendingCount.textContent = String(pendingOnlyCount);

    const branchCaptions = {
      all: 'All 3 kitchens active · Valet nominal',
      Clifton: 'Marine Promenade · Chef’s Counter open',
      'DHA Phase 6': 'Bukhari Courtyard · Robata hearth active',
      'Tariq Road': '1984 Heritage Vault · Late-night service',
    };

    el.kpiBranchSub.textContent = branchCaptions[state.selectedBranch] || branchCaptions.all;
    el.topbarActiveBranch.textContent =
      state.selectedBranch === 'all' ? 'All Karachi Enclaves' : `${state.selectedBranch} Enclave`;
  }

  function getStatusClass(status) {
    switch (status) {
      case 'Preparing':
        return 'status-preparing';
      case 'Out for Delivery':
        return 'status-delivery';
      case 'Completed':
        return 'status-completed';
      default:
        return 'status-pending';
    }
  }

  function renderOrdersTable() {
    const query = state.searchQuery.trim().toLowerCase();
    const filtered = getBranchScopedOrders().filter((order) => {
      const matchesStatus =
        state.statusFilter === 'all' || order.status === state.statusFilter;
      const matchesQuery =
        !query ||
        String(order.orderCode || '').toLowerCase().includes(query) ||
        String(order.customerName || '').toLowerCase().includes(query) ||
        String(order.customerPhone || '').toLowerCase().includes(query) ||
        String(order.itemsSummary || '').toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });

    el.ordersTableBody.innerHTML = '';

    if (filtered.length === 0) {
      el.ordersEmptyState.classList.remove('is-hidden');
      return;
    }

    el.ordersEmptyState.classList.add('is-hidden');

    const fragment = document.createDocumentFragment();
    filtered.forEach((order) => {
      const tr = document.createElement('tr');

      // 1. Order ID
      const tdId = document.createElement('td');
      tdId.className = 'order-id-cell tabular-nums';
      tdId.textContent = order.orderCode;
      tr.appendChild(tdId);

      // 2. Customer & Phone
      const tdCustomer = document.createElement('td');
      const nameSpan = document.createElement('span');
      nameSpan.className = 'customer-name';
      nameSpan.textContent = order.customerName;
      const phoneSpan = document.createElement('span');
      phoneSpan.className = 'customer-phone tabular-nums';
      phoneSpan.textContent = order.customerPhone;
      tdCustomer.append(nameSpan, phoneSpan);
      tr.appendChild(tdCustomer);

      // 3. Branch
      const tdBranch = document.createElement('td');
      tdBranch.textContent = order.branch;
      tr.appendChild(tdBranch);

      // 4. Items Summary
      const tdItems = document.createElement('td');
      tdItems.className = 'items-summary';
      tdItems.textContent = order.itemsSummary;
      tr.appendChild(tdItems);

      // 5. Total Amount
      const tdTotal = document.createElement('td');
      tdTotal.className = 'order-total text-right tabular-nums';
      tdTotal.textContent = formatPkr(order.totalPkr);
      tr.appendChild(tdTotal);

      // 6. Status Dropdown
      const tdStatus = document.createElement('td');
      const select = document.createElement('select');
      select.className = `status-select ${getStatusClass(order.status)}`;
      select.setAttribute('aria-label', `Update status for ${order.orderCode}`);

      ORDER_STATUSES.forEach((statusOption) => {
        const opt = document.createElement('option');
        opt.value = statusOption;
        opt.textContent = statusOption;
        opt.selected = order.status === statusOption;
        select.appendChild(opt);
      });

      select.addEventListener('change', async (e) => {
        const previousStatus = order.status;
        const nextStatus = e.target.value;

        order.status = nextStatus;
        select.className = `status-select ${getStatusClass(nextStatus)}`;
        select.disabled = true;

        try {
          await staffFetch(
            `/api/staff/orders/${encodeURIComponent(order.orderCode)}/status`,
            {
              method: 'PATCH',
              body: JSON.stringify({ status: nextStatus }),
            }
          );
          pulseSyncStatus(`${order.orderCode} → ${nextStatus}`);
          renderKpis();
          if (state.statusFilter !== 'all' && state.statusFilter !== nextStatus) {
            renderOrdersTable();
          }
        } catch (error) {
          order.status = previousStatus;
          select.value = previousStatus;
          select.className = `status-select ${getStatusClass(previousStatus)}`;
          pulseSyncStatus(error instanceof Error ? error.message : 'Status update failed');
        } finally {
          select.disabled = false;
        }
      });

      tdStatus.appendChild(select);
      tr.appendChild(tdStatus);
      fragment.appendChild(tr);
    });

    el.ordersTableBody.appendChild(fragment);
  }

  function renderInventory() {
    const filteredItems = state.menuItems.filter((item) => {
      return state.categoryFilter === 'All' || item.category === state.categoryFilter;
    });

    el.menuInventoryList.innerHTML = '';
    const fragment = document.createDocumentFragment();

    filteredItems.forEach((item) => {
      const inStock = Boolean(item.inStock);
      const currentPrice = Number(item.pricePkr || 0);

      const card = document.createElement('article');
      card.className = `inventory-row${inStock ? '' : ' is-sold-out'}`;

      // Left metadata
      const meta = document.createElement('div');
      meta.className = 'inventory-meta';

      const cat = document.createElement('span');
      cat.className = 'inventory-category';
      cat.textContent = item.category;

      const title = document.createElement('h3');
      title.className = 'inventory-name';
      title.textContent = item.name;

      const stockLabel = document.createElement('span');
      stockLabel.className = `inventory-stock-label${inStock ? '' : ' is-out'}`;
      stockLabel.textContent = inStock
        ? 'In Stock · Active on Menu'
        : 'Sold Out · Hidden from Checkout';

      meta.append(cat, title, stockLabel);

      // Right controls: Price Editor + Toggle Switch
      const controls = document.createElement('div');
      controls.className = 'inventory-controls';

      const priceEditor = document.createElement('div');
      priceEditor.className = 'price-editor';

      const prefix = document.createElement('span');
      prefix.className = 'price-prefix';
      prefix.textContent = 'PKR';

      const priceInput = document.createElement('input');
      priceInput.type = 'number';
      priceInput.min = '100';
      priceInput.step = '50';
      priceInput.className = 'price-input tabular-nums';
      priceInput.value = String(currentPrice);
      priceInput.setAttribute('aria-label', `Price in PKR for ${item.name}`);

      const savePriceBtn = document.createElement('button');
      savePriceBtn.type = 'button';
      savePriceBtn.className = 'price-save-btn';
      savePriceBtn.textContent = 'Save';

      const commitPrice = async () => {
        const parsed = parseInt(priceInput.value, 10);
        if (Number.isNaN(parsed) || parsed < 100) {
          priceInput.value = String(currentPrice);
          return;
        }

        savePriceBtn.disabled = true;
        try {
          const res = await staffFetch(`/api/staff/menu/${encodeURIComponent(item.id)}`, {
            method: 'PATCH',
            body: JSON.stringify({ pricePkr: parsed }),
          });
          if (res.item) {
            item.pricePkr = res.item.pricePkr;
          } else {
            item.pricePkr = parsed;
          }
          pulseSyncStatus('Menu pricing updated');
          savePriceBtn.textContent = 'Saved';
          window.setTimeout(() => {
            savePriceBtn.textContent = 'Save';
          }, 1200);
        } catch (error) {
          priceInput.value = String(currentPrice);
          pulseSyncStatus(error instanceof Error ? error.message : 'Price update failed');
        } finally {
          savePriceBtn.disabled = false;
        }
      };

      savePriceBtn.addEventListener('click', commitPrice);
      priceInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          commitPrice();
        }
      });

      priceEditor.append(prefix, priceInput, savePriceBtn);

      // Stock Toggle Switch
      const toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.role = 'switch';
      toggleBtn.setAttribute('aria-checked', String(inStock));
      toggleBtn.setAttribute('aria-label', `Toggle stock availability for ${item.name}`);
      toggleBtn.className = `stock-switch${inStock ? ' is-in-stock' : ''}`;

      const thumb = document.createElement('span');
      thumb.className = 'stock-switch-thumb';
      toggleBtn.appendChild(thumb);

      toggleBtn.addEventListener('click', async () => {
        const nextStock = !item.inStock;
        toggleBtn.disabled = true;
        try {
          const res = await staffFetch(`/api/staff/menu/${encodeURIComponent(item.id)}`, {
            method: 'PATCH',
            body: JSON.stringify({ inStock: nextStock }),
          });
          item.inStock = res.item ? res.item.inStock : nextStock;
          pulseSyncStatus(
            `${item.name}: ${item.inStock ? 'In Stock' : 'Sold Out'}`
          );
          renderInventory();
        } catch (error) {
          pulseSyncStatus(error instanceof Error ? error.message : 'Stock update failed');
        } finally {
          toggleBtn.disabled = false;
        }
      });

      controls.append(priceEditor, toggleBtn);
      card.append(meta, controls);
      fragment.appendChild(card);
    });

    el.menuInventoryList.appendChild(fragment);
  }

  function renderAll() {
    renderKpis();
    renderOrdersTable();
    renderInventory();
  }

  // =========================================================================
  // DASHBOARD INTERACTION BINDINGS
  // =========================================================================
  function bindDashboardEvents() {
    // Sidebar smooth navigation
    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        const section = btn.dataset.section;
        if (section === 'orders') {
          el.sectionOrders.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (section === 'inventory') {
          el.sectionInventory.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

    // Branch selector
    el.branchFilter.addEventListener('change', (e) => {
      state.selectedBranch = e.target.value;
      try {
        sessionStorage.setItem(STORAGE_KEYS.BRANCH, state.selectedBranch);
      } catch {
        // Ignore
      }
      renderKpis();
      renderOrdersTable();
    });

    // Order search
    el.orderSearch.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderOrdersTable();
    });

    // Status filter tabs
    document.querySelectorAll('.filter-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.filter-tab').forEach((t) => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        state.statusFilter = tab.dataset.statusFilter || 'all';
        renderOrdersTable();
      });
    });

    // Clear filters
    el.clearOrderFilters.addEventListener('click', () => {
      state.statusFilter = 'all';
      state.searchQuery = '';
      state.selectedBranch = 'all';
      el.orderSearch.value = '';
      el.branchFilter.value = 'all';
      document.querySelectorAll('.filter-tab').forEach((t) => {
        t.classList.toggle('is-active', t.dataset.statusFilter === 'all');
      });
      renderAll();
    });

    // Category filter tabs
    document.querySelectorAll('.cat-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.cat-tab').forEach((t) => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        state.categoryFilter = tab.dataset.categoryFilter || 'All';
        renderInventory();
      });
    });

    // Refresh Data button
    if (el.refreshBtn) {
      el.refreshBtn.addEventListener('click', () => {
        fetchDashboardData(true);
      });
    }
  }

  // =========================================================================
  // INITIALIZE
  // =========================================================================
  function init() {
    try {
      const savedBranch = sessionStorage.getItem(STORAGE_KEYS.BRANCH);
      if (savedBranch) {
        state.selectedBranch = savedBranch;
        el.branchFilter.value = savedBranch;
      }
    } catch {
      state.selectedBranch = 'all';
    }

    bindAuthEvents();
    bindDashboardEvents();

    const savedPasskey = sessionStorage.getItem(STORAGE_KEYS.PASSKEY);
    if (savedPasskey) {
      state.passkey = savedPasskey;
      showDashboard(true);
    } else {
      el.passwordInput.focus();
    }
  }

  init();
})();
