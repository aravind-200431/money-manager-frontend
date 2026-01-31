import React, { createContext, useReducer, useContext } from 'react';
import * as api from '../services/api';

// Initial State
const initialState = {
    transactions: [],
    transactionsPage: {
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
        last: true,
    },
    stats: {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0
    },
    categorySummary: [],
    loading: false,
    error: null,
    period: 'monthly', // Default period
};

// Actions
const ACTIONS = {
    loading: 'LOADING',
    error: 'ERROR',
    set_transactions: 'SET_TRANSACTIONS',
    set_stats: 'SET_STATS',
    set_period: 'SET_PERIOD',
    set_category_summary: 'SET_CATEGORY_SUMMARY',
    add_transaction: 'ADD_TRANSACTION',
    update_transaction: 'UPDATE_TRANSACTION',
    set_transactions_page: 'SET_TRANSACTIONS_PAGE',
};

// Reducer
const AppReducer = (state, action) => {
    switch (action.type) {
        case ACTIONS.loading:
            return { ...state, loading: true, error: null };
        case ACTIONS.error:
            return { ...state, loading: false, error: action.payload };
        case ACTIONS.set_transactions:
            return {
                ...state,
                transactions: action.payload.content || [],
                transactionsPage: {
                    page: action.payload.page ?? 0,
                    size: action.payload.size ?? state.transactionsPage.size,
                    totalElements: action.payload.totalElements ?? (action.payload.content ? action.payload.content.length : 0),
                    totalPages: action.payload.totalPages ?? 1,
                    last: action.payload.last ?? true,
                },
                loading: false,
            };
        case ACTIONS.set_stats:
            return { ...state, stats: action.payload, loading: false };
        case ACTIONS.set_category_summary:
            return { ...state, categorySummary: action.payload, loading: false };
        case ACTIONS.set_period:
            return { ...state, period: action.payload };
        case ACTIONS.add_transaction:
            // Newly added transactions will appear on the first page after reload
            return state;
        case ACTIONS.update_transaction:
            const updated = state.transactions.map(t => t.id === action.payload.id ? action.payload : t);
            return { ...state, transactions: updated };
        default:
            return state;
    }
};

// Context
export const GlobalContext = createContext(initialState);

// Provider
export const GlobalProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AppReducer, initialState);

    // Actions: pass periodOverride to use that period for stats/summary (avoids stale state)
    async function loadDashboardData(page = 0, size = state.transactionsPage.size, periodOverride = null) {
        const periodToUse = periodOverride != null ? periodOverride : state.period;
        dispatch({ type: ACTIONS.loading });
        try {
            const [statsRes, summaryRes, transactionsRes] = await Promise.all([
                api.getDashboardStats(periodToUse),
                api.getCategorySummary(periodToUse),
                api.getTransactions(page, size),
            ]);

            dispatch({ type: ACTIONS.set_stats, payload: statsRes.data });
            dispatch({ type: ACTIONS.set_category_summary, payload: summaryRes.data });
            dispatch({ type: ACTIONS.set_transactions, payload: transactionsRes.data });
        } catch (err) {
            dispatch({ type: ACTIONS.error, payload: err.response?.data?.message || err.message });
        }
    }

    // Separate fetch for transactions if filtered
    async function filterTransactions(filters) {
        dispatch({ type: ACTIONS.loading });
        try {
            const res = await api.filterTransactions(filters);
            // For filtered view, show all results on a single "page"
            dispatch({
                type: ACTIONS.set_transactions,
                payload: {
                    content: res.data,
                    page: 0,
                    size: res.data.length,
                    totalElements: res.data.length,
                    totalPages: 1,
                    last: true,
                },
            });
        } catch (err) {
            dispatch({ type: ACTIONS.error, payload: err.response?.data?.message || err.message });
        }
    }

    async function addTransaction(transaction) {
        try {
            const res = await api.createTransaction(transaction);
            dispatch({ type: ACTIONS.add_transaction, payload: res.data });
            // After creating a transaction, reload dashboard starting from first page
            await loadDashboardData(0, state.transactionsPage.size);
            return true;
        } catch (err) {
            dispatch({ type: ACTIONS.error, payload: err.response?.data?.message || err.message });
            return false;
        }
    }

    async function editTransaction(id, transaction) {
        try {
            const res = await api.updateTransaction(id, transaction);
            dispatch({ type: ACTIONS.update_transaction, payload: res.data });
            await loadDashboardData(state.transactionsPage.page, state.transactionsPage.size);
            return true;
        } catch (err) {
            throw err;
        }
    }

    const setPeriod = (period) => {
        dispatch({ type: ACTIONS.set_period, payload: period });
    };

    async function changeTransactionsPage(page) {
        dispatch({ type: ACTIONS.loading });
        try {
            const res = await api.getTransactions(page, state.transactionsPage.size);
            dispatch({ type: ACTIONS.set_transactions, payload: res.data });
        } catch (err) {
            dispatch({ type: ACTIONS.error, payload: err.response?.data?.message || err.message });
        }
    }

    return (
        <GlobalContext.Provider value={{
            transactions: state.transactions,
            transactionsPage: state.transactionsPage,
            stats: state.stats,
            categorySummary: state.categorySummary,
            loading: state.loading,
            error: state.error,
            period: state.period,
            loadDashboardData,
            filterTransactions,
            addTransaction,
            editTransaction,
            setPeriod,
            changeTransactionsPage,
        }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);
