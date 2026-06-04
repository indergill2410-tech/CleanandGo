import { createAdminClient } from '@/lib/supabase/admin'
import { BLOG_POSTS, type BlogPost } from '@/lib/content'

type Row = {
  slug: string; title: string; excerpt: string | null; category: string | null
  keywords: string[] | null; read_time: string | null; sections: BlogPost['sections']
  published_at: string | null; created_at: string
}

function rowToPost(r: Row): BlogPost {
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt || '',
    date: (r.published_at || r.created_at).slice(0, 10),
    readTime: r.read_time || '4 min read',
    category: r.category || 'Newsletter',
    keywords: r.keywords || [],
    sections: r.sections || [],
  }
}

// Published posts stored in the DB (AI newsletter + editorial). Never throws —
// returns [] if the DB/env isn't available (e.g. during a build without secrets).
export async function getPublishedDbPosts(): Promise<BlogPost[]> {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
    return (data || []).map(rowToPost)
  } catch {
    return []
  }
}

// All posts (static editorial + published DB), newest first.
export async function getAllPosts(): Promise<BlogPost[]> {
  const db = await getPublishedDbPosts()
  return [...BLOG_POSTS, ...db].sort((a, b) => +new Date(b.date) - +new Date(a.date))
}

// A single post by slug — checks the static set first, then the DB.
export async function getAnyPost(slug: string): Promise<BlogPost | null> {
  const staticPost = BLOG_POSTS.find((p) => p.slug === slug)
  if (staticPost) return staticPost
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
    return data ? rowToPost(data as Row) : null
  } catch {
    return null
  }
}
