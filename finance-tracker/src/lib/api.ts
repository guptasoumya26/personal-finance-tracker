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

// Utility function to format month for API calls
export function formatMonthForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}