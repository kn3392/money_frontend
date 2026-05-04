import api from './api.js';

function pickMessage(e) {
  return e.response?.data?.message || e.message || 'Request failed';
}

export async function listLoans() {
  const { data } = await api.get('/api/loans');
  return data.loans;
}

export async function getLoansReport() {
  const { data } = await api.get('/api/loans/report');
  return data;
}

export async function createLoan(payload) {
  try {
    const { data } = await api.post('/api/loans', payload);
    return data.loan;
  } catch (e) {
    throw new Error(pickMessage(e));
  }
}

export async function updateLoan(id, payload) {
  try {
    const { data } = await api.put(`/api/loans/${id}`, payload);
    return data.loan;
  } catch (e) {
    throw new Error(pickMessage(e));
  }
}

export async function deleteLoan(id) {
  const { data } = await api.delete(`/api/loans/${id}`);
  return data;
}

export async function addLoanPayment(id, amount) {
  try {
    const { data } = await api.post(`/api/loans/${id}/payment`, { amount });
    return data.loan;
  } catch (e) {
    throw new Error(pickMessage(e));
  }
}
