// @custom — AI Post Writer page for LinkedIn content generation
import { useState, useCallback } from 'react'
import { Sparkles, Copy, RefreshCw, Send, ChevronDown, Hash, Wand2, FileText, Zap } from 'lucide-react'
import { DashboardLayout } from '../../../components/@system/Dashboard'
import { Button } from '../../../components/@system/ui/button'
import { TAPLIO_NAV_ITEMS } from '../../../config/@custom/navigation'

const TONES = ['Professional', 'Casual', 'Bold', 'Inspirational', 'Educational', 'Humorous']
const LENGTHS = ['Short (~100 words)', 'Medium (~200 words)', 'Long (~300+ words)']
const FORMATS = ['Text Post', 'Listicle', 'Story', 'How-To', 'Hot Take', 'Carousel Outline']

const EXAMPLE_POSTS = [
  {
    tone: 'Professional',
    content: `I've spent 10 years building startups. Here's what nobody tells you about the first 90 days:\n\n1. Your product doesn't matter yet — distribution does\n2. Talk to 50 customers before writing a line of code\n3. Revenue > Vanity metrics. Always.\n4. Your first hire will make or break you\n5. Move fast, but document everything\n\nThe best founders I know didn't have the best ideas. They had the best execution.\n\nWhat would you add to this list?\n\n#startups #entrepreneurship #leadership`,
  },
  {
    tone: 'Casual',
    content: `Hot take: Most LinkedIn posts about "productivity" are actually just procrastination in disguise 😅\n\nInstead of reading another "5 habits of successful people" post, try this:\n\n→ Pick ONE thing\n→ Do it for 25 minutes\n→ Take a break\n→ Repeat\n\nThat's it. That's the tweet... er, LinkedIn post.\n\nWho else is guilty of this? 🙋‍♂️\n\n#productivity #realtalk #worklife`,
  },
]

function TopicInput({ value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Topic or Idea</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., Why remote work is the future of productivity, or lessons learned from scaling a SaaS to $1M ARR..."
        className="w-full min-h-[100px] rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        maxLength={500}
      />
      <p className="text-xs text-muted-foreground text-right">{value.length}/500</p>
    </div>
  )
}

function OptionSelector({ label, options, selected, onSelect }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onSelect(option)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selected === option
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

function GeneratedPost({ content, onCopy, onRewrite, onSchedule }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onCopy?.()
  }, [content, onCopy])

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Generated Post</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onRewrite}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Rewrite
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button size="sm" onClick={onSchedule}>
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Schedule
          </Button>
        </div>
      </div>
      <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed bg-muted/30 rounded-lg p-4 border border-border/50">
        {content}
      </div>
    </div>
  )
}

function HashtagSuggestions({ hashtags }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Hash className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Suggested Hashtags</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {hashtags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium cursor-pointer hover:bg-primary/20 transition-colors"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  )
}

export function AIPostWriterPage() {
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('Professional')
  const [length, setLength] = useState('Medium (~200 words)')
  const [format, setFormat] = useState('Text Post')
  const [generatedPost, setGeneratedPost] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [variations, setVariations] = useState([])

  const suggestedHashtags = ['linkedintips', 'leadership', 'startup', 'saas', 'growthhacking', 'productivity', 'entrepreneurship', 'marketing']

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return
    setIsGenerating(true)

    // Simulate AI generation (in production, this would call the backend AI endpoint)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const example = EXAMPLE_POSTS[Math.floor(Math.random() * EXAMPLE_POSTS.length)]
    const generated = `${topic.trim()}\n\n${example.content}`
    setGeneratedPost(generated)
    setVariations([])
    setIsGenerating(false)
  }, [topic])

  const handleRewrite = useCallback(async () => {
    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const example = EXAMPLE_POSTS[Math.floor(Math.random() * EXAMPLE_POSTS.length)]
    setGeneratedPost(example.content)
    setIsGenerating(false)
  }, [])

  const handleSchedule = useCallback(() => {
    // Navigate to post scheduler with the generated content
    window.location.href = `/app/posts/new?content=${encodeURIComponent(generatedPost || '')}`
  }, [generatedPost])

  const handleGenerateVariations = useCallback(async () => {
    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setVariations(EXAMPLE_POSTS.map((p) => p.content))
    setIsGenerating(false)
  }, [])

  return (
    <DashboardLayout navItems={TAPLIO_NAV_ITEMS}>
      <div className="max-w-4xl mx-auto space-y-8 p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-primary" />
            AI Post Writer
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate high-quality LinkedIn posts with AI. Enter a topic and let AI craft the perfect post.
          </p>
        </div>

        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <TopicInput value={topic} onChange={setTopic} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <OptionSelector label="Tone" options={TONES} selected={tone} onSelect={setTone} />
            <OptionSelector label="Length" options={LENGTHS} selected={length} onSelect={setLength} />
            <OptionSelector label="Format" options={FORMATS} selected={format} onSelect={setFormat} />
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleGenerate}
              disabled={!topic.trim() || isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Post
                </>
              )}
            </Button>
            {generatedPost && (
              <Button variant="outline" onClick={handleGenerateVariations} disabled={isGenerating}>
                <Zap className="h-4 w-4 mr-1.5" />
                Generate Variations
              </Button>
            )}
          </div>
        </div>

        {/* Generated Post */}
        {generatedPost && (
          <GeneratedPost
            content={generatedPost}
            onCopy={() => {}}
            onRewrite={handleRewrite}
            onSchedule={handleSchedule}
          />
        )}

        {/* Variations */}
        {variations.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Variations
            </h3>
            {variations.map((v, i) => (
              <GeneratedPost
                key={i}
                content={v}
                onCopy={() => {}}
                onRewrite={handleRewrite}
                onSchedule={handleSchedule}
              />
            ))}
          </div>
        )}

        {/* Hashtag Suggestions */}
        <HashtagSuggestions hashtags={suggestedHashtags} />

        {/* Tips Section */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-3">
          <h3 className="text-sm font-medium text-foreground">Tips for Better Results</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Be specific with your topic — "5 lessons from scaling a SaaS" works better than "startup advice"
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Use "Bold" tone for controversial takes that drive engagement
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Listicles and How-To formats tend to get 2x more engagement on LinkedIn
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Always add a question at the end to encourage comments
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AIPostWriterPage
