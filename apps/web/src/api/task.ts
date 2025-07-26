import { axiosInstance } from './instance'

export interface TaskList {
  id: number
  name: string
  tasks: any[]
  status: number
}

export function fetchTaskList() {
  return axiosInstance.get<TaskList[]>('/api/v1/task-lists')
}
