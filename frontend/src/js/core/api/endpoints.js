/**
 * API Endpoints for MarketPlace
 * Central definition of all API endpoints used in the application
 */

// API endpoints organized by domain/functionality
const API_ENDPOINTS = {
    auth: {
        register: '/api/v0/auth/register',
        login: '/api/v0/auth/login',
        refreshToken: '/api/v0/auth/refresh-token',
        tokenStatus: '/api/v0/auth/token-status',
        profile: '/api/v0/auth/profile'
    },
    items: {
        list: '/api/v0/items/',
        featured: '/api/v0/items/featured',
        recent: '/api/v0/items/recent',
        categories: '/api/v0/items/categories',
        byCategory: (category) => `/api/v0/items/categories/${category}`,
        details: (id) => `/api/v0/items/${id}`
    },
    search: {
        items: {
            search: '/api/v0/search/items/search',
            getItem: (id) => `/api/v0/search/items/${id}`
        },
        deposits: {
            search: '/api/v0/search/deposits/search',
            getDeposit: (id) => `/api/v0/search/deposits/${id}`
        },
        transactions: {
            search: '/api/v0/search/transactions/search',
            getTransaction: (id) => `/api/v0/search/transactions/${id}`
        },
        users: {
            search: '/api/v0/search/users/search',
            getUser: (id) => `/api/v0/search/users/${id}`
        }
    },
    profile: {
        overview: '/api/v0/profile/overview',
        items: {
            create: '/api/v0/profile/items',
            list: '/api/v0/profile/items',
            details: (id) => `/api/v0/profile/items/${id}`,
            update: (id) => `/api/v0/profile/items/${id}`,
            delete: (id) => `/api/v0/profile/items/${id}`
        },
        wallet: {
            deposit: '/api/v0/profile/wallet/deposit',
            balance: '/api/v0/profile/wallet/balance',
            transactions: '/api/v0/profile/wallet/transactions'
        }
    },
    transactions: {
        purchase: '/api/v0/transactions/purchase',
        list: '/api/v0/transactions/',
        purchases: '/api/v0/transactions/purchases',
        details: (id) => `/api/v0/transactions/${id}`,
        transfer: '/api/v0/transactions/transfer'
    },
    dashboard: {
        profile: '/api/v0/dashboard/profile',
        summary: '/api/v0/dashboard/summary',
        sales: '/api/v0/dashboard/sales',
        categories: '/api/v0/dashboard/categories',
        topProducts: '/api/v0/dashboard/top-products',
        recentTransactions: '/api/v0/dashboard/recent-transactions',
        salesSummary: '/api/v0/dashboard/sales-summary',
        customRange: '/api/v0/dashboard/custom-range'
    },
    reporting: {
        system: {
            salesTimeSeries: '/api/v0/reporting/system/sales/time-series',
            salesCategories: '/api/v0/reporting/system/sales/categories',
            sellersPerformance: '/api/v0/reporting/system/sellers/performance',
            transactionsStats: '/api/v0/reporting/system/transactions/stats'
        },
        user: {
            salesTimeSeries: '/api/v0/reporting/user/sales/time-series',
            transactionsStats: '/api/v0/reporting/user/transactions/stats',
            summary: '/api/v0/reporting/user/summary',
            userSummary: (userId) => `/api/v0/reporting/user/${userId}/summary`,
            itemsStatus: '/api/v0/reporting/user/items/status',
            sellerSalesChart: (timeRange) => `/api/v0/reporting/user/seller/sales/chart?time_range=${timeRange}`
        }
    }
};

export default API_ENDPOINTS;