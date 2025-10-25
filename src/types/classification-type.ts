export interface Classification {
  id?: string | number
  title: string
  description: string
  user_id: string | number
  image_path: string
  has_classificated: boolean
  result?: object | null
  created_at?: string
}
