import type { createAdminClient } from '@/lib/supabase/admin'

type AdminClient = ReturnType<typeof createAdminClient>

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cleanandgo.onrender.com'

/**
 * Ensure a Supabase auth account exists for a staff email and return a
 * "set your password" action link. New emails get an invite link (which
 * creates the user); existing emails get a recovery link. The caller links
 * the returned userId to the staff row and emails the link.
 */
export async function provisionStaffLogin(
  supabase: AdminClient,
  email: string
): Promise<{ userId: string; actionLink: string } | { error: string }> {
  const redirectTo = `${APP_URL}/set-password`

  let res = await supabase.auth.admin.generateLink({ type: 'invite', email, options: { redirectTo } })
  if (res.error && /(already|exist|registered)/i.test(res.error.message)) {
    res = await supabase.auth.admin.generateLink({ type: 'recovery', email, options: { redirectTo } })
  }

  const link = res.data?.properties?.action_link
  const userId = res.data?.user?.id
  if (res.error || !userId || !link) {
    return { error: res.error?.message || 'Could not generate login link' }
  }
  return { userId, actionLink: link }
}
