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
  getAll: () => request('/venues'),
  create: (data: any) => post('/venues', data),
}

export const examApi = {
  getAll: () => request('/exams'),
  create: (data: any) => post('/exams', data),
}

export const enrolmentApi = {
  getAll: () => request('/enrolments'),
  create: (data: any) => post('/enrolments', data),
}

export const hrApi = {
  getAll: () => request('/lecturers'),
  create: (data: any) => post('/lecturers', data),
}

export const financeApi = {
  getAll: () => request('/fees'),
  create: (data: any) => post('/fees', data),
}

export const notificationApi = {
  getAll: () => request('/notifications'),
  create: (data: any) => post('/notifications', data),
}