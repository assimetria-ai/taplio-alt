// @custom — AI Content Suggestions page for LinkedIn growth tool
import { useState, useCallback } from 'react'
import {
  Lightbulb, Sparkles, Clock, BarChart2, Copy, Send, RefreshCw,
  ChevronRight, TrendingUp, MessageSquare, Heart, Eye, X, Hash,
} from 'lucide-react'
import { DashboardLayout } from '../../../components/@system/Dashboard'
import { Button } from '../../../components/@system/ui/button'
import { TAPLIO_NAV_ITEMS } from '../../../config/@custom/navigation'
import { contentSuggestionsApi } from '../../../lib/@custom/content-suggestions'

// ── Constants ────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  'Technology', 'Marketing', 'Finance', 'Healthcare', 'Education',
  'Consulting', 'SaaS', 'E-commerce', 'Real Estate', 'HR & Recruiting',
]

const TONES = ['Professional', 'Casual', 'Bold', 'Inspirational', 'Educational', 'Storytelling']

const FORMAT_LABELS = {
  text_post: 'Text Post',
  listicle: 'Listicle',
  story: 'Story',
  how_to: 'How-To',
  hot_take: 'Hot Take',
  carousel_outline: 'Carousel',
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const TABS = ['suggestions', 'optimal-times', 'predict']

// ── Sub-components ───────────────────────────────────────────────────────────

function TabBar({ active, onChange }) {
  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
      {[
        { id: 'suggestions', label: 'Ideas', icon: Lightbulb },
        { id: 'optimal-times', label: 'Best Times', icon: Clock },
        { id: 'predict', label: 'Predict', icon: BarChart2 },
      ].map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            active === id
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  )
}

function TagInput({ label, value, onChange, placeholder }) {
  const [input, setInput] = useState('')

  const addTag = useCallback(() => {
    const trimmed = input.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInput('')
  }, [input, value, onChange])

  const removeTag = useCallback(
    (tag) => onChange(value.filter((t) => t !== tag)),
    [value, onChange]
  )

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex flex-wrap gap-1.5 min-h-[42px] rounded-lg border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-primary/50">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
          >
            {tag}
            <button onClick={() => removeTag(tag)} className="hover:text-primary/70">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              addTag()
            }
          }}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
      </div>
      <p className="text-xs text-muted-foreground">Press Enter or comma to add</p>
    </div>
  )
}

function SuggestionCard({ suggestion, index }) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(suggestion.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [suggestion.content])

  const handleSchedule = useCallback(() => {
    window.location.href = `/app/scheduler?content=${encodeURIComponent(suggestion.content)}`
  }, [suggestion.content])

  const { estimated_engagement: eng } = suggestion

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
            {index + 1}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground leading-snug">{suggestion.title}</h3>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
              {FORMAT_LABELS[suggestion.format] || suggestion.format}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 px-2">
            <Copy className="h-3.5 w-3.5" />
            <span className="ml-1.5 text-xs">{copied ? 'Copied!' : 'Copy'}</span>
          </Button>
          <Button size="sm" onClick={handleSchedule} className="h-8 px-2">
            <Send className="h-3.5 w-3.5" />
            <span className="ml-1.5 text-xs">Schedule</span>
          </Button>
        </div>
      </div>

      {/* Content preview */}
      <div
        className={`text-sm text-muted-foreground leading-relaxed bg-muted/30 rounded-lg p-3 border border-border/50 whitespace-pre-wrap cursor-pointer ${
          expanded ? '' : 'line-clamp-4'
        }`}
        onClick={() => setExpanded((v) => !v)}
      >
        {suggestion.content}
      </div>
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="text-xs text-primary hover:underline -mt-2"
        >
          Show full post
        </button>
      )}

      {/* Hashtags */}
      {suggestion.hashtags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestion.hashtags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs"
            >
              <Hash className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Engagement estimate */}
      {eng && (
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border/50">
          {[
            { icon: Eye, label: 'Impressions', value: formatNum(eng.impressions) },
            { icon: Heart, label: 'Likes', value: formatNum(eng.likes) },
            { icon: MessageSquare, label: 'Comments', value: formatNum(eng.comments) },
            { icon: TrendingUp, label: 'Eng. Rate', value: eng.engagement_rate },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Icon className="h-3 w-3" />
                <span className="text-xs">{label}</span>
              </div>
              <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function OptimalTimesPanel() {
  const [timezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [source, setSource] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await contentSuggestionsApi.getOptimalTimes({ timezone })
      setSlots(data.slots || [])
      setSource(data.source)
    } catch {
      setError('Failed to load optimal times. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [timezone])

  // Group by day
  const byDay = slots.reduce((acc, slot) => {
    const day = slot.day_of_week
    if (!acc[day]) acc[day] = []
    acc[day].push(slot)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Optimal Posting Times</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Best times to post in <span className="font-medium">{timezone}</span>
          </p>
        </div>
        <Button onClick={load} disabled={loading} className="gap-2">
          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
          {slots.length > 0 ? 'Refresh' : 'Analyze Times'}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {slots.length === 0 && !loading && !error && (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center">
          <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Click "Analyze Times" to get AI-powered posting time recommendations.
          </p>
        </div>
      )}

      {slots.length > 0 && (
        <>
          {source === 'ai' && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              AI-powered recommendations based on LinkedIn engagement research
            </p>
          )}

          {/* Heat-map style grid */}
          <div className="space-y-3">
            {Object.entries(byDay)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([day, daySlots]) => (
                <div key={day} className="flex items-center gap-3">
                  <span className="w-8 text-xs font-medium text-muted-foreground text-right flex-shrink-0">
                    {DAY_NAMES[Number(day)]}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {daySlots
                      .sort((a, b) => a.hour - b.hour)
                      .map((slot) => (
                        <div
                          key={`${slot.day_of_week}-${slot.hour}`}
                          title={slot.rationale}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            slot.confidence === 'high'
                              ? 'bg-primary text-primary-foreground'
                              : slot.confidence === 'medium'
                              ? 'bg-primary/30 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {slot.time_label}
                          <span className="ml-1.5 opacity-70">{Math.round(slot.score)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>

          <div className="flex items-center gap-4 pt-2">
            {[
              { color: 'bg-primary', label: 'High (80+)' },
              { color: 'bg-primary/30', label: 'Medium (50-79)' },
              { color: 'bg-muted', label: 'Low (<50)' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded-sm ${color}`} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function PredictPanel() {
  const [content, setContent] = useState('')
  const [format, setFormat] = useState('text_post')
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handlePredict = useCallback(async () => {
    if (!content.trim()) return
    setLoading(true)
    setError(null)
    try {
      const data = await contentSuggestionsApi.predictPerformance({ content, format })
      setPrediction(data.prediction)
    } catch {
      setError('Failed to predict performance. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [content, format])

  const p = prediction

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">Performance Predictor</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Paste your LinkedIn post to get AI-powered performance predictions before you publish.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Post Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your LinkedIn post here..."
            className="w-full min-h-[140px] rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            maxLength={3000}
          />
          <p className="text-xs text-muted-foreground text-right">{content.length}/3000</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Format</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(FORMAT_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFormat(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  format === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handlePredict}
          disabled={!content.trim() || loading}
          className="gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <BarChart2 className="h-4 w-4" />
              Predict Performance
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {p && (
        <div className="space-y-4">
          {/* Score */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">Performance Score</span>
              <span
                className={`text-2xl font-bold ${
                  p.performance_score >= 70
                    ? 'text-green-500'
                    : p.performance_score >= 40
                    ? 'text-yellow-500'
                    : 'text-red-500'
                }`}
              >
                {p.performance_score}/100
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  p.performance_score >= 70
                    ? 'bg-green-500'
                    : p.performance_score >= 40
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${p.performance_score}%` }}
              />
            </div>
          </div>

          {/* Predicted metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Eye, label: 'Impressions', value: formatNum(p.predicted_impressions), color: 'text-blue-500' },
              { icon: Heart, label: 'Likes', value: formatNum(p.predicted_likes), color: 'text-red-500' },
              { icon: MessageSquare, label: 'Comments', value: formatNum(p.predicted_comments), color: 'text-green-500' },
              { icon: TrendingUp, label: 'Eng. Rate', value: p.engagement_rate, color: 'text-purple-500' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-4 text-center">
                <Icon className={`h-5 w-5 mx-auto mb-1 ${color}`} />
                <p className="text-lg font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Hook analysis */}
          {p.hook_analysis && (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Hook Analysis</p>
              <p className="text-sm text-foreground">{p.hook_analysis}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strengths */}
            {p.strengths?.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                <p className="text-xs font-medium text-green-600 uppercase tracking-wider">Strengths</p>
                <ul className="space-y-1.5">
                  {p.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {p.improvements?.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                <p className="text-xs font-medium text-yellow-600 uppercase tracking-wider">Improvements</p>
                <ul className="space-y-1.5">
                  {p.improvements.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="text-yellow-500 mt-0.5 flex-shrink-0">→</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {p.best_time_to_post && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-primary flex-shrink-0" />
              <span>Best time to post: <span className="font-medium text-foreground">{p.best_time_to_post}</span></span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export function ContentSuggestionsPage() {
  const [activeTab, setActiveTab] = useState('suggestions')

  // Suggestions tab state
  const [industry, setIndustry] = useState('')
  const [topics, setTopics] = useState([])
  const [tone, setTone] = useState('Professional')
  const [count, setCount] = useState(5)
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGenerate = useCallback(async () => {
    if (!industry && topics.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const data = await contentSuggestionsApi.generate({
        industry,
        topics,
        tone: tone.toLowerCase(),
        count,
      })
      setSuggestions(data.suggestions || [])
    } catch {
      setError('Failed to generate suggestions. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [industry, topics, tone, count])

  return (
    <DashboardLayout navItems={TAPLIO_NAV_ITEMS}>
      <div className="max-w-4xl mx-auto space-y-8 p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            Content Suggestions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered LinkedIn content ideas, optimal posting times, and performance predictions.
          </p>
        </div>

        <TabBar active={activeTab} onChange={setActiveTab} />

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              {/* Industry selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Industry</label>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES.map((ind) => (
                    <button
                      key={ind}
                      onClick={() => setIndustry(ind === industry ? '' : ind)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        industry === ind
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>

              <TagInput
                label="Topics"
                value={topics}
                onChange={setTopics}
                placeholder="e.g. remote work, leadership, AI trends..."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Tone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Tone</label>
                  <div className="flex flex-wrap gap-2">
                    {TONES.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTone(t)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          tone === t
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Count */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Number of ideas: <span className="text-primary">{count}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={(!industry && topics.length === 0) || loading}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating ideas...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Ideas
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {suggestions.length} ideas generated
                  </h2>
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Regenerate
                  </button>
                </div>
                {suggestions.map((s, i) => (
                  <SuggestionCard key={i} suggestion={s} index={i} />
                ))}
              </div>
            )}

            {suggestions.length === 0 && !loading && !error && (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center">
                <Lightbulb className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Select an industry or add topics, then click Generate Ideas.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Optimal Times Tab */}
        {activeTab === 'optimal-times' && <OptimalTimesPanel />}

        {/* Predict Tab */}
        {activeTab === 'predict' && <PredictPanel />}
      </div>
    </DashboardLayout>
  )
}

export default ContentSuggestionsPage

// ── Utils ────────────────────────────────────────────────────────────────────

function formatNum(n) {
  if (!n && n !== 0) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}
