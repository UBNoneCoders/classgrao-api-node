import { supabase } from "@/config/supabase"
import { Roles } from "@/constants"
import { User } from "@/types/user-type"

export default class UserRepository {
  static async findAll() {
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, username, active, name, role")

    if (usersError) {
      return { data: null, error: usersError }
    }

    return { data: users, error: null }
  }

  static async findByUsername(username: string) {
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, username, password_hash, active, name, role")
      .eq("username", username)
      .single()

    if (userError) {
      return { data: null, error: userError }
    }

    return { data: user, error: null }
  }

  static async findById(id: string) {
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, username, active, name, role")
      .eq("id", id)
      .single()

    if (userError) {
      return { data: null, error: userError }
    }

    return { data: user, error: null }
  }

  static async createUser(
    username: string,
    passwordHash: string,
    name: string
  ) {
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        username,
        password_hash: passwordHash,
        name,
        role: Roles.FARMER,
        active: true,
      })
      .select("id, username, active, name, role")
      .single()

    if (userError) {
      return { data: null, error: userError }
    }

    return { data: user, error: null }
  }

  static async updateUser(id: string, updates: Partial<User>) {
    const { data: user, error: userError } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select("id, username, active, name, role")
      .single()

    if (userError) {
      return { data: null, error: userError }
    }

    return { data: user, error: null }
  }

  static async deleteUser(id: string) {
    const { data: user, error: userError } = await supabase
      .from("users")
      .delete()
      .eq("id", id)
      .select("id, username, active, name, role")
      .single()

    if (userError) {
      return { data: null, error: userError }
    }

    return { data: user, error: null }
  }

  static async toggleUserStatus(id: string, currentStatus: boolean) {
    const { data: user, error: userError } = await supabase
      .from("users")
      .update({ active: !currentStatus })
      .eq("id", id)
      .select("id, username, active, name, role")
      .single()

    if (userError) {
      return { data: null, error: userError }
    }

    return { data: user, error: null }
  }
}
