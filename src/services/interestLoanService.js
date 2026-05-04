import api from './api';

export const getInterestLoans = async (params = {}) => {
  const response = await api.get('/api/interest-loans', { params });
  return response.data.loans || [];
};

export const createInterestLoan = async (data) => {
  const cleanData = {
    ...data,
    principalAmount: Number(data.principalAmount) || 0,
    monthlyInterestRate: Number(data.monthlyInterestRate) || 0,
    manualMonths: data.manualMonths !== '' ? Number(data.manualMonths) : null,
    receivedAmount: Number(data.receivedAmount || 0),
  };
  const response = await api.post('/api/interest-loans', cleanData);
  return response.data.loan;
};

export const getInterestLoan = async (id) => {
  const response = await api.get(`/api/interest-loans/${id}`);
  return response.data.loan;
};

export const updateInterestLoan = async (id, data) => {
  const cleanData = {
    ...data,
    principalAmount: Number(data.principalAmount) || 0,
    monthlyInterestRate: Number(data.monthlyInterestRate) || 0,
    manualMonths: data.manualMonths !== '' ? Number(data.manualMonths) : null,
    receivedAmount: Number(data.receivedAmount || 0),
  };
  const response = await api.put(`/api/interest-loans/${id}`, cleanData);
  return response.data.loan;
};

export const deleteInterestLoan = async (id) => {
  const response = await api.delete(`/api/interest-loans/${id}`);
  return response.data;
};

export const collectInterest = async (id, data) => {
  const response = await api.post(`/api/interest-loans/${id}/collect-interest`, data);
  return response.data.loan;
};

export const collectPrincipal = async (id, data) => {
  const response = await api.post(`/api/interest-loans/${id}/collect-principal`, data);
  return response.data.loan;
};

export const updateInterestPayment = async (loanId, paymentId, data) => {
  const response = await api.put(`/api/interest-loans/${loanId}/payments/${paymentId}`, data);
  return response.data.loan;
};

export const deleteInterestPayment = async (loanId, paymentId) => {
  const response = await api.delete(`/api/interest-loans/${loanId}/payments/${paymentId}`);
  return response.data.loan;
};

export const getInterestLoanDashboard = async () => {
  const response = await api.get('/api/interest-loans/dashboard');
  return response.data.summary || null;
};

export const getBorrowerSummary = async () => {
  const response = await api.get('/api/interest-loans/borrower-summary');
  return response.data.summary || [];
};

export const exportInterestLoansExcel = async () => {
  const response = await api.get('/api/interest-loans/export/excel', { responseType: 'blob' });
  return response.data;
};

export const exportInterestLoansPdf = async () => {
  const response = await api.get('/api/interest-loans/export/pdf', { responseType: 'blob' });
  return response.data;
};
