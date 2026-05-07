'use client'

import { create } from 'zustand'
import type { 
  CrmCustomer, 
  CustomerFiltersState, 
  PaginationState,
  BulkAction 
} from '@/types/crm'

// Customer Filters UI State
interface CustomerFiltersUIState {
  filters: CustomerFiltersState
  setFilters: (filters: Partial<CustomerFiltersState>) => void
  resetFilters: () => void
  setSearch: (search: string) => void
}

const defaultFilters: CustomerFiltersState = {
  search: '',
  status: 'all',
  planId: null,
  department: null,
  sortBy: 'name',
  sortOrder: 'asc',
}

export const useCustomerFiltersStore = create<CustomerFiltersUIState>((set) => ({
  filters: defaultFilters,
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  resetFilters: () => set({ filters: defaultFilters }),
  setSearch: (search) => set((state) => ({
    filters: { ...state.filters, search }
  })),
}))

// Customer Selection & Detail Panel State
interface CustomerSelectionState {
  selectedCustomerId: string | null
  selectedCustomer: CrmCustomer | null
  isDetailPanelOpen: boolean
  isLoadingCustomer: boolean
  
  // Actions
  selectCustomer: (id: string | null) => void
  setSelectedCustomer: (customer: CrmCustomer | null) => void
  openDetailPanel: () => void
  closeDetailPanel: () => void
  toggleDetailPanel: () => void
  setLoadingCustomer: (loading: boolean) => void
  clearSelection: () => void
}

export const useCustomerSelectionStore = create<CustomerSelectionState>((set) => ({
  selectedCustomerId: null,
  selectedCustomer: null,
  isDetailPanelOpen: false,
  isLoadingCustomer: false,

  selectCustomer: (id) => set({
    selectedCustomerId: id,
    isDetailPanelOpen: id !== null,
    selectedCustomer: null, // Clear previous data
  }),

  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),

  openDetailPanel: () => set({ isDetailPanelOpen: true }),
  
  closeDetailPanel: () => set({ 
    isDetailPanelOpen: false,
    selectedCustomerId: null,
    selectedCustomer: null,
  }),
  
  toggleDetailPanel: () => set((state) => ({ 
    isDetailPanelOpen: !state.isDetailPanelOpen 
  })),

  setLoadingCustomer: (isLoadingCustomer) => set({ isLoadingCustomer }),

  clearSelection: () => set({
    selectedCustomerId: null,
    selectedCustomer: null,
    isDetailPanelOpen: false,
  }),
}))

// Pagination State
interface CustomerPaginationState {
  pagination: PaginationState
  setPagination: (pagination: Partial<PaginationState>) => void
  nextPage: () => void
  prevPage: () => void
  goToPage: (page: number) => void
  resetPagination: () => void
}

const defaultPagination: PaginationState = {
  page: 1,
  pageSize: 25,
  totalItems: 0,
  totalPages: 0,
}

export const useCustomerPaginationStore = create<CustomerPaginationState>((set) => ({
  pagination: defaultPagination,
  
  setPagination: (pagination) => set((state) => ({
    pagination: { ...state.pagination, ...pagination }
  })),
  
  nextPage: () => set((state) => ({
    pagination: {
      ...state.pagination,
      page: Math.min(state.pagination.page + 1, state.pagination.totalPages)
    }
  })),
  
  prevPage: () => set((state) => ({
    pagination: {
      ...state.pagination,
      page: Math.max(state.pagination.page - 1, 1)
    }
  })),
  
  goToPage: (page) => set((state) => ({
    pagination: {
      ...state.pagination,
      page: Math.max(1, Math.min(page, state.pagination.totalPages))
    }
  })),
  
  resetPagination: () => set({ pagination: defaultPagination }),
}))

// Bulk Selection State
interface BulkSelectionState {
  selectedIds: Set<string>
  isProcessing: boolean
  currentAction: BulkAction | null
  
  // Actions
  toggleSelection: (id: string) => void
  selectAll: (ids: string[]) => void
  clearSelection: () => void
  isSelected: (id: string) => boolean
  setProcessing: (processing: boolean) => void
  setCurrentAction: (action: BulkAction | null) => void
}

export const useBulkSelectionStore = create<BulkSelectionState>((set, get) => ({
  selectedIds: new Set(),
  isProcessing: false,
  currentAction: null,

  toggleSelection: (id) => set((state) => {
    const newSet = new Set(state.selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    return { selectedIds: newSet }
  }),

  selectAll: (ids) => set({ selectedIds: new Set(ids) }),

  clearSelection: () => set({ 
    selectedIds: new Set(),
    currentAction: null,
  }),

  isSelected: (id) => get().selectedIds.has(id),

  setProcessing: (isProcessing) => set({ isProcessing }),

  setCurrentAction: (currentAction) => set({ currentAction }),
}))

// Customer List Data State (separate from UI)
interface CustomerListDataState {
  customers: CrmCustomer[]
  isLoading: boolean
  error: string | null
  lastFetchedAt: Date | null
  
  // Actions
  setCustomers: (customers: CrmCustomer[]) => void
  updateCustomer: (id: string, updates: Partial<CrmCustomer>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearData: () => void
}

export const useCustomerListDataStore = create<CustomerListDataState>((set) => ({
  customers: [],
  isLoading: false,
  error: null,
  lastFetchedAt: null,

  setCustomers: (customers) => set({ 
    customers, 
    lastFetchedAt: new Date(),
    error: null,
  }),

  updateCustomer: (id, updates) => set((state) => ({
    customers: state.customers.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    ),
  })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearData: () => set({
    customers: [],
    isLoading: false,
    error: null,
    lastFetchedAt: null,
  }),
}))
