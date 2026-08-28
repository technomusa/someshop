import { useQuery } from '@tanstack/react-query';
import apiClient from './api-client';

// Fetchers
const fetchDashboard = async () => {
  const res = await apiClient.get('/ui/dashboard');
  return res.data || res;
};

const fetchProducts = async ({ queryKey }) => {
  const [_key, { page = 1, per_page = 20, q = '' } = {}] = queryKey;
  const params = new URLSearchParams();
  params.set('per_page', per_page);
  if (q) params.set('q', q);
  const res = await apiClient.get(`/ui/products?${params.toString()}`);
  return res.data || res;
};

const fetchCustomers = async ({ queryKey }) => {
  const [_key, { page = 1, per_page = 25, q = '' } = {}] = queryKey;
  const params = new URLSearchParams();
  params.set('per_page', per_page);
  if (q) params.set('q', q);
  const res = await apiClient.get(`/ui/customers?${params.toString()}`);
  return res.data || res;
};

const fetchScales = async () => {
  const res = await apiClient.get('/ui/scales');
  return res.data || res;
};

const fetchReports = async ({ queryKey }) => {
  const [_key, { start, end } = {}] = queryKey;
  const params = new URLSearchParams();
  if (start) params.set('start', start);
  if (end) params.set('end', end);
  const res = await apiClient.get(`/ui/reports?${params.toString()}`);
  return res.data || res;
};

// Hooks
export const useDashboard = () => useQuery(['ui:dashboard'], fetchDashboard);
export const useProducts = (opts) => useQuery(['ui:products', opts || {}], fetchProducts, { keepPreviousData: true });
export const useCustomers = (opts) => useQuery(['ui:customers', opts || {}], fetchCustomers, { keepPreviousData: true });
export const useScales = () => useQuery(['ui:scales'], fetchScales);
export const useReports = (opts) => useQuery(['ui:reports', opts || {}], fetchReports);

export default {
  useDashboard,
  useProducts,
  useCustomers,
  useScales,
  useReports,
};
