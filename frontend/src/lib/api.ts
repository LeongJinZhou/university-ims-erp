const API_BASE = '/api'

const request = async (endpoint: string) => {
  const res = await fetch(`${API_BASE}${endpoint}`)
  return res.json()
}

const post = async (endpoint: string, data: any) => {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export const programmeApi = {
  getAll: () => request('/programmes'),
  getById: (id: string) => request(`/programmes/${id}`),
  getMqaPlans: (id: string) => request(`/programmes/${id}/mqa`),
  create: (data: any) => post('/programmes', data),
}

export const studentApi = {
  getAll: () => request('/student'),
  getById: (id: string) => request(`/student/${id}`),
  create: (data: any) => post('/student', data),
}

export const courseApi = {
  getAll: () => request('/courses'),
  create: (data: any) => post('/courses', data),
}

export const venueApi = {
  getAll: () => request('/venue/venues'),
  create: (data: any) => post('/venue/venues', data),
}

export const examApi = {
  getAll: () => request('/exam/retake-plans'),
  create: (data: any) => post('/exam/retake-plans', data),
}

export const enrolmentApi = {
  getAll: () => request('/enrolment/enrolments'),
  create: (data: any) => post('/enrolment/enrol', data),
}

export const hrApi = {
  getAll: () => request('/hr/lecturers'),
  create: (data: any) => post('/hr/lecturers', data),
}

export const financeApi = {
  getAll: () => request('/finance/invoices'),
  create: (data: any) => post('/finance/invoices', data),
}

export const notificationApi = {
  getAll: () => request('/notifications'),
  create: (data: any) => post('/notifications', data),
}