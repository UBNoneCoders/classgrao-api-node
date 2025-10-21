import { supabase } from '@/config/supabase'

export default class UserRepository {
  static async findByUsername(username: string) {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, password_hash, active, name, role')
      .eq('username', username)
      .single()

    if (userError) {
      return { data: null, error: userError }
    }

    return { data: user, error: null }
  }

  static async findyById(id: string) {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, active, name, role')
      .eq('id', id)
      .single()

    if (userError) {
      return { data: null, error: userError }
    }

    return { data: user, error: null }
  }
}
