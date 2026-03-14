import { useState, useCallback } from 'react'
import {
  PenSquare, Wand2, Copy, RefreshCw, Hash, Sparkles,
  ChevronDown, Check, Loader2,
} from 'lucide-react'
import { cn } from '@/app/lib/@system/utils'

const TONES = ['Professional', 'Casual', 'Bold', 'Inspirational', 'Storytelling', 'Educational']
const LENGTHS = ['Short (~100 words)', 'Medium (~200 words)', 'Long (~300 words)']
const FORMATS = ['Text post', 'Listicle', 'Story', 'How-to', 'Hot take', 'Question']

function StatBadge({ label, value }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
      {label}: <span className="text-foreground">{value}</span>
    </span>
  )
}

function SelectDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground hover:bg-accent/50 transition-colors"
      >
        {value}
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <ul className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-card shadow-lg">
          {options.map(opt => (
            <li key={opt}>
              <button
                type="button"
                onClick={() => { onChange(opt); setOpen(false) }}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors',
                  opt === value && 'text-primary font-medium'
                )}
              >
                {opt === value && <Check className="h-3.5 w-3.5" />}
                <span className={opt !== value ? 'pl-5.5' : ''}>{opt}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Mock generated post for demo
const SAMPLE_POST = `🚀 3 Lessons I Learned After 1,000 LinkedIn Posts

After publishing consistently for 2 years, here's what actually moved the needle:

1. Hook > Content
Your first line determines if anyone reads the rest. Spend 50% of your writing time on the hook.

2. Stories beat tips
People scroll past "5 tips for X" but stop for "I lost my biggest client last week..."

3. Engagement is a two-way street
For every post you publish, comment on 10 others. The algorithm rewards conversation.

The biggest myth? You need to post daily. Quality > quantity. 3 great posts per week beats 7 mediocre ones.

What's your #1 LinkedIn lesson? 👇

#LinkedInGrowth #ContentStrategy #PersonalBranding`

export default function AIPostWriter() {
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState(TONES[0])
  const [length, setLength] = useState(LENGTHS[1])
  const [format, setFormat] = useState(FORMATS[0])
  const [generating, setGenerating] = useState(false)
  const [generatedPost, setGeneratedPost] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = useCallback(() => {
    if (!topic.trim()) return
    setGenerating(true)
    setGeneratedPost('')
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedPost(SAMPLE_POST)
      setGenerating(false)
    }, 2000)
  }, [topic])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(generatedPost)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [generatedPost])

  const handleRegenerate = useCallback(() => {
    setGenerating(true)
    setTimeout(() => {
      setGeneratedPost(SAMPLE_POST)
      setGenerating(false)
    }, 1500)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Post Writer</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate high-quality LinkedIn posts with AI. Pick your topic, tone, and format.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Panel */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center gap-2 text-foreground">
            <Wand2 className="h-5 w-5" style={{ color: '#0891B2' }} />
            <h2 className="font-semibold">Configure Your Post</h2>
          </div>

          {/* Topic */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Topic or Idea</label>
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g., Why most LinkedIn advice is wrong, Lessons from scaling a startup to $1M ARR..."
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Tone, Length, Format */}
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectDropdown label="Tone" options={TONES} value={tone} onChange={setTone} />
            <SelectDropdown label="Length" options={LENGTHS} value={length} onChange={setLength} />
            <SelectDropdown label="Format" options={FORMATS} value={format} onChange={setFormat} />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || generating}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors',
              topic.trim() && !generating
                ? 'bg-[#0891B2] hover:bg-[#0891B2]/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Post
              </>
            )}
          </button>
        </div>

        {/* Output Panel */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-foreground">
              <PenSquare className="h-5 w-5" style={{ color: '#0891B2' }} />
              <h2 className="font-semibold">Generated Post</h2>
            </div>
            {generatedPost && (
              <div className="flex items-center gap-2">
                <StatBadge label="Words" value={generatedPost.split(/\s+/).length} />
                <StatBadge label="Chars" value={generatedPost.length} />
              </div>
            )}
          </div>

          {generatedPost ? (
            <>
              <div className="rounded-lg border border-border bg-background p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                {generatedPost}
              </div>

              {/* Hashtag suggestions */}
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Hash className="h-3.5 w-3.5" /> Suggested hashtags
                </p>
                <div className="flex flex-wrap gap-2">
                  {['#LinkedInGrowth', '#ContentStrategy', '#PersonalBranding', '#LinkedInTips', '#B2BMarketing'].map(tag => (
                    <span key={tag} className="rounded-full bg-[#0891B2]/10 px-3 py-1 text-xs font-medium" style={{ color: '#0891B2' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={generating}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                >
                  <RefreshCw className={cn('h-4 w-4', generating && 'animate-spin')} />
                  Regenerate
                </button>
                <button
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
                  style={{ backgroundColor: '#0891B2' }}
                >
                  <PenSquare className="h-4 w-4" />
                  Schedule Post
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Sparkles className="mb-3 h-10 w-10 opacity-30" />
              <p className="text-sm">Enter a topic and click Generate to create your post</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
