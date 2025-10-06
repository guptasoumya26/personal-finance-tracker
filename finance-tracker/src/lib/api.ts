// API utility functions for database operations

export async function fetchCentralTemplate() {
  const response = await fetch('/api/central-template');
  if (!response.ok) {
    throw new Error('Failed to fetch central template');
  }
  const result = await response.json();
  return result.data;
}

export async function saveCentralTemplate(items: any[]) {
  const response = await fetch('/api/central-template', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  });
  if (!response.ok) {
    throw new Error('Failed to save central template');
  }
  const result = await response.json();
  return result.data;
}

export async function updateCentralTemplate(items: any[]) {
  const response = await fetch('/api/central-template', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  });
  if (!response.ok) {
    throw new Error('Failed to update central template');
  }
  const result = await response.json();
  return result.data;
}

// Expenses API
export async function fetchExpenses(month?: string) {
  const url = month ? `/api/expenses?month=${month}` : '/api/expenses';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch expenses');
  }
  const result = await response.json();
  return result.data;
}

export async function createExpense(expense: any) {
  const response = await fetch('/api/expenses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(expense),
  });
  if (!response.ok) {
    throw new Error('Failed to create expense');
  }
  const result = await response.json();
  return result.data;
}

export async function updateExpense(expense: any) {
  const response = await fetch('/api/expenses', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(expense),
  });
  if (!response.ok) {
    throw new Error('Failed to update expense');
  }
  const result = await response.json();
  return result.data;
}

export async function deleteExpense(id: string) {
  const response = await fetch(`/api/expenses?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete expense');
  }
  return true;
}

// Investments API
export async function fetchInvestments(month?: string) {
  const url = month ? `/api/investments?month=${month}` : '/api/investments';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch investments');
  }
  const result = await response.json();
  return result.data;
}

export async function createInvestment(investment: any) {
  const response = await fetch('/api/investments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(investment),
  });
  if (!response.ok) {
    throw new Error('Failed to create investment');
  }
  const result = await response.json();
  return result.data;
}

// Central Investment Template API
export async function fetchCentralInvestmentTemplate() {
  const response = await fetch('/api/central-investment-template');
  if (!response.ok) {
    throw new Error('Failed to fetch central investment template');
  }
  const result = await response.json();
  return result.data;
}

export async function saveCentralInvestmentTemplate(items: any[]) {
  const response = await fetch('/api/central-investment-template', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  });
  if (!response.ok) {
    throw new Error('Failed to save central investment template');
  }
  const result = await response.json();
  return result.data;
}

export async function updateCentralInvestmentTemplate(items: any[]) {
  const response = await fetch('/api/central-investment-template', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  });
  if (!response.ok) {
    throw new Error('Failed to update central investment template');
  }
  const result = await response.json();
  return result.data;
}

export async function updateInvestment(investment: any) {
  const response = await fetch('/api/investments', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(investment),
  });
  if (!response.ok) {
    throw new Error('Failed to update investment');
  }
  const result = await response.json();
  return result.data;
}

export async function deleteInvestment(id: string) {
  const response = await fetch(`/api/investments?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete investment');
  }
  return true;
}

// Notes API
export async function fetchNote(month: string) {
  const response = await fetch(`/api/notes?month=${month}`);
  if (!response.ok) {
    throw new Error('Failed to fetch note');
  }
  const result = await response.json();
  return result.data;
}

export async function saveNote(content: string, month: string) {
  const response = await fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content, month }),
  });
  if (!response.ok) {
    throw new Error('Failed to save note');
  }
  const result = await response.json();
  return result.data;
}

// Credit Card Entries API
export async function fetchCreditCardEntries(month?: string) {
  const url = month ? `/api/credit-card-entries?month=${month}` : '/api/credit-card-entries';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch credit card entries');
  }
  const result = await response.json();
  return result.data;
}

export async function createCreditCardEntry(entry: any) {
  const response = await fetch('/api/credit-card-entries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entry),
  });
  if (!response.ok) {
    throw new Error('Failed to create credit card entry');
  }
  const result = await response.json();
  return result.data;
}

export async function deleteCreditCardEntry(id: string) {
  const response = await fetch(`/api/credit-card-entries?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete credit card entry');
  }
  return true;
}

// Income API
export async function fetchIncome(month?: string) {
  const url = month ? `/api/income?month=${month}` : '/api/income';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch income');
  }
  const result = await response.json();
  return result.data;
}

export async function createIncome(income: any) {
  const response = await fetch('/api/income', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(income),
  });
  if (!response.ok) {
    throw new Error('Failed to create income');
  }
  const result = await response.json();
  return result.data;
}

export async function deleteIncome(id: string) {
  const response = await fetch(`/api/income?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete income');
  }
  return true;
}

// External Investment Buffer API
export async function fetchExternalInvestmentBuffer(month?: string) {
  const url = month ? `/api/external-investment-buffer?month=${month}` : '/api/external-investment-buffer';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch external investment buffer');
  }
  const result = await response.json();
  return result.data;
}

export async function createExternalInvestmentBuffer(buffer: any) {
  const response = await fetch('/api/external-investment-buffer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buffer),
  });
  if (!response.ok) {
    throw new Error('Failed to create external investment buffer');
  }
  const result = await response.json();
  return result.data;
}

export async function deleteExternalInvestmentBuffer(id: string) {
  const response = await fetch(`/api/external-investment-buffer?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete external investment buffer');
  }
  return true;
}

// Utility function to format month for API calls
export function formatMonthForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}