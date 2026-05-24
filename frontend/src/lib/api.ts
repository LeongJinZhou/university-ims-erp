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
  getAll: () => api.get('/programmes'),
  getById: (id: string) => api.get(`/programmes/${id}`),
  getMqaPlans: (id: string) => api.get(`/programmes/${id}/mqa`),
}

export const studentApi = {
  getAll: () => api.get('/students'),
  getById: (id: string) => api.get(`/students/${id}`),
  create: (data: any) => api.post('/students', data),
}

export const courseApi = {
  getAll: () => api.get('/courses'),
  create: (data: any) => api.post('/courses', data),
}

export const venueApi = {
  getAll: () => api.get('/venues'),
  create: (data: any) => api.post('/venues', data),
}

export const examApi = {
  getAll: () => api.get('/exams'),
  create: (data: any) => api.post('/exams', data),
}

export const enrolmentApi = {
  getAll: () => api.get('/enrolments'),
  create: (data: any) => api.post('/enrolments', data),
}

export const hrApi = {
  getAll: () => api.get('/lecturers'),
  create: (data: any) => api.post('/lecturers', data),
}

export const financeApi = {
  getAll: () => api.get('/fees'),
  create: (data: any) => api.post('/fees', data),
}

export const notificationApi = {
  getAll: () => api.get('/notifications'),
  create: (data: any) => api.post('/notifications', data),
}