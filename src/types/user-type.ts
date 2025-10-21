export interface User {
  id: string
  name: string
  username: string
  role: string
  active: boolean
  created_at?: Date
  updated_at?: Date
}
