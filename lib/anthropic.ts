import Anthropic from '@anthropic-ai/sdk'

// Lazily construct so `next build` doesn't require the key at build time.
let _client: Anthropic | null = null
export function getAnthropic(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _client
}

export function hasAnthropic() {
  return !!process.env.ANTHROPIC_API_KEY
}
