'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ==================== TYPES ====================
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  files?: AttachedFile[]
  timestamp: Date
}

interface AttachedFile {
  name: string
  type: string
  size: number
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  model: string
  createdAt: string
}

interface User {
  email: string
  name: string
}

interface AIModel {
  id: string
  name: string
  provider: string
  icon: string
  maxTokens: number
}

// ==================== CONFIGURATION ====================
const AI_MODELS: AIModel[] = [
  // Existing Models
  { id: 'qwen/qwen3-coder-480b-a35b', name: 'Qwen3 Coder 480B', provider: 'Qwen', icon: '💻', maxTokens: 32768 },
  { id: 'google/gemma-3n-2b', name: 'Gemma 3n 2B', provider: 'Google', icon: '🔷', maxTokens: 8192 },
  { id: 'google/gemma-3n-4b', name: 'Gemma 3n 4B', provider: 'Google', icon: '🔷', maxTokens: 8192 },
  { id: 'qwen/qwen3-4b', name: 'Qwen3 4B', provider: 'Qwen', icon: '💻', maxTokens: 16384 },
  { id: 'mistral/mistral-small-3.1-24b', name: 'Mistral Small 3.1', provider: 'Mistral', icon: '🌀', maxTokens: 32768 },
  { id: 'google/gemma-3-4b', name: 'Gemma 3 4B', provider: 'Google', icon: '🔷', maxTokens: 8192 },
  { id: 'google/gemma-3-12b', name: 'Gemma 3 12B', provider: 'Google', icon: '🔷', maxTokens: 8192 },
  { id: 'google/gemma-3-27b', name: 'Gemma 3 27B', provider: 'Google', icon: '🔷', maxTokens: 8192 },
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', provider: 'Meta', icon: '🦙', maxTokens: 131072 },
  { id: 'meta-llama/llama-3.2-3b-instruct', name: 'Llama 3.2 3B', provider: 'Meta', icon: '🦙', maxTokens: 131072 },
  { id: 'deepseek/deepseek-r1-0528', name: 'DeepSeek R1', provider: 'DeepSeek', icon: '🔍', maxTokens: 65536 },
  { id: 'z-ai/glm-4.5-air', name: 'GLM 4.5 Air', provider: 'Z.ai', icon: '✨', maxTokens: 32768 },
  // New Models
  { id: 'arcee-ai/trinity-large-preview', name: 'Trinity Large Preview', provider: 'Arcee AI', icon: '🔺', maxTokens: 32768 },
  { id: 'arcee-ai/trinity-mini', name: 'Trinity Mini', provider: 'Arcee AI', icon: '🔺', maxTokens: 16384 },
  { id: 'nous/hermes-3-405b-instruct', name: 'Hermes 3 405B', provider: 'Nous', icon: '⚡', maxTokens: 65536 },
  { id: 'venice/uncensored', name: 'Venice Uncensored', provider: 'Venice', icon: '🎭', maxTokens: 32768 },
  { id: 'stepfun/step-3.5-flash', name: 'Step 3.5 Flash', provider: 'StepFun', icon: '⚡', maxTokens: 32768 },
  { id: 'upstage/solar-pro-3', name: 'Solar Pro 3', provider: 'Upstage', icon: '☀️', maxTokens: 32768 },
  { id: 'liquid/lfm2.5-1.2b-thinking', name: 'LFM2.5 Thinking', provider: 'LiquidAI', icon: '💧', maxTokens: 8192 },
  { id: 'liquid/lfm2.5-1.2b-instruct', name: 'LFM2.5 Instruct', provider: 'LiquidAI', icon: '💧', maxTokens: 8192 },
  { id: 'nvidia/nemotron-3-nano-30b-a3b', name: 'Nemotron Nano 30B', provider: 'NVIDIA', icon: '🟢', maxTokens: 32768 },
  { id: 'nvidia/nemotron-nano-12b-2-vl', name: 'Nemotron 12B VL', provider: 'NVIDIA', icon: '🟢', maxTokens: 16384 },
  { id: 'qwen/qwen3-next-80b-a3b-instruct', name: 'Qwen3 Next 80B', provider: 'Qwen', icon: '💻', maxTokens: 65536 },
  { id: 'nvidia/nemotron-nano-9b-v2', name: 'Nemotron 9B V2', provider: 'NVIDIA', icon: '🟢', maxTokens: 16384 },
  { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B', provider: 'OpenAI', icon: '🤖', maxTokens: 65536 },
  { id: 'openai/gpt-oss-20b', name: 'GPT OSS 20B', provider: 'OpenAI', icon: '🤖', maxTokens: 32768 }
]

const ALLOWED_USERS: User[] = [
  { email: 'user1@dohdoh.ai', name: 'User One' },
  { email: 'user2@dohdoh.ai', name: 'User Two' },
  { email: 'user3@dohdoh.ai', name: 'User Three' },
  { email: 'user4@dohdoh.ai', name: 'User Four' },
  { email: 'admin@dohdoh.ai', name: 'Admin' }
]

const USER_PASSWORDS: Record<string, string> = {
  'user1@dohdoh.ai': 'user123',
  'user2@dohdoh.ai': 'user123',
  'user3@dohdoh.ai': 'user123',
  'user4@dohdoh.ai': 'user123',
  'admin@dohdoh.ai': 'admin123'
}

const SETTINGS_PASSWORD = 'dohdoh2024'

// ==================== TRANSLATIONS ====================
const TRANSLATIONS = {
  en: {
    appName: 'Doh Doh Ai',
    loginSubtitle: 'Sign in to start chatting',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Password',
    signIn: 'Sign In',
    logout: 'Logout',
    newChat: 'New Chat',
    chatHistory: 'Chat History',
    settings: 'Settings',
    language: 'Language',
    theme: 'Theme',
    typeMessage: 'Message Doh Doh Ai...',
    noChats: 'No chat history yet',
    clearHistory: 'Clear All',
    welcome: "Hello, I'm Doh Doh Ai!",
    welcomeDesc: 'Your intelligent AI assistant. Ask me anything!',
    thinking: 'Doh Doh is thinking...',
    error: 'Something went wrong',
    invalidCredentials: 'Invalid email or password',
    copied: 'Copied to clipboard!',
    online: 'Online',
    ttsDesc: 'Read AI responses aloud',
    soundDesc: 'Play sounds for messages',
    autoscrollDesc: 'Auto scroll to new messages',
    regenerate: 'Regenerate',
    copy: 'Copy',
    exportChat: 'Export Chat',
    apiKey: 'API Key',
    apiKeyDesc: 'Enter your API key for authentication',
    apiKeyPlaceholder: 'Enter API key...',
    saveApiKey: 'Save API Key',
    removeApiKey: 'Remove API Key',
    apiKeySaved: 'API Key saved successfully!',
    apiKeyRemoved: 'API Key removed!',
    passwordRequired: 'Password Required',
    enterPassword: 'Enter password to access this feature',
    wrongPassword: 'Incorrect password',
    keyboardShortcuts: 'Keyboard Shortcuts',
    shortcutsDesc: 'Enable keyboard shortcuts',
    streamingMode: 'Streaming Mode',
    streamingDesc: 'Stream AI responses in real-time',
    confirmPassword: 'Confirm',
    cancel: 'Cancel'
  },
  my: {
    appName: 'Doh Doh Ai',
    loginSubtitle: 'စကားပြောရန် လော့ဂ်အင်ဝင်ရန်',
    emailPlaceholder: 'အီးမေးလ်',
    passwordPlaceholder: 'စကားဝှက်',
    signIn: 'ဝင်ရောက်ရန်',
    logout: 'ထွက်ရန်',
    newChat: 'စကားဝှက်အသစ်',
    chatHistory: 'စကားဝှက်မှတ်တမ်း',
    settings: 'ဆက်တင်များ',
    language: 'ဘာသာစကား',
    theme: 'အပြင်အဆင်',
    typeMessage: 'Doh Doh Ai ကိုမက်ဆေ့ပို့ပါ...',
    noChats: 'စကားဝှက်မှတ်တမ်းမရှိသေးပါ',
    clearHistory: 'အားလုံးဖျက်ရန်',
    welcome: 'မင်္ဂလာပါ! Doh Doh Ai ဖြစ်ပါသည်!',
    welcomeDesc: 'သင့်ဉာဏ်ရည် AI လုပ်ငန်းဆောင်ရွက်မှု။ ဘာမဆိုမေးပါ!',
    thinking: 'Doh Doh တွေးနေသည်...',
    error: 'အမှားတစ်ခုဖြစ်ပွားသည်',
    invalidCredentials: 'အီးမေးလ် သို့မဟုတ် စကားဝှက်မှားယွင်းနေပါသည်',
    copied: 'ကလစ်ဘုတ်သို့ကူးယူပြီးပါပြီ!',
    online: 'အွန်လိုင်း',
    ttsDesc: 'AI အဖြေများကိုအသံဖြင့်ဖတ်ပါ',
    soundDesc: 'မက်ဆေ့များအတွက်အသံများဖွင့်ပါ',
    autoscrollDesc: 'မက်ဆေ့အသစ်သို့အလိုအလျောက်ရွှေ့ပါ',
    regenerate: 'ပြန်လည်ဖန်တီး',
    copy: 'ကူးယူရန်',
    exportChat: 'တင်ပို့ရန်',
    apiKey: 'API Key',
    apiKeyDesc: 'အထောက်အထားအတွက် API key ထည့်ပါ',
    apiKeyPlaceholder: 'API key ထည့်ပါ...',
    saveApiKey: 'API Key သိမ်းဆည်းရန်',
    removeApiKey: 'API Key ဖယ်ရှားရန်',
    apiKeySaved: 'API Key အောင်မြင်စွာသိမ်းဆည်းပြီး!',
    apiKeyRemoved: 'API Key ဖယ်ရှားပြီး!',
    passwordRequired: 'စကားဝှက်လိုအပ်သည်',
    enterPassword: 'ဤအင်္ဂါရပ်ကိုအသုံးပြုရန်စကားဝှက်ထည့်ပါ',
    wrongPassword: 'စကားဝှက်မမှန်ပါ',
    keyboardShortcuts: 'ကီးဘုတ်အတိုကောက်များ',
    shortcutsDesc: 'ကီးဘုတ်အတိုကောက်များအသုံးပြုပါ',
    streamingMode: 'စီးဆင်းမှုမုဒ်',
    streamingDesc: 'AI အဖြေများကိုအချိန်နှင့်တပြေးညီပြပါ',
    confirmPassword: 'အတည်ပြုပါ',
    cancel: 'ပယ်ဖျက်ပါ'
  }
}

type LangKey = keyof typeof TRANSLATIONS
type ThemeKey = 'light' | 'dark' | 'pink' | 'ocean' | 'forest'

// ==================== MAIN COMPONENT ====================
export default function Home() {
  // State
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentLang, setCurrentLang] = useState<LangKey>('en')
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>('light')
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id)
  const [messages, setMessages] = useState<Message[]>([])
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([])
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [lastUserMessage, setLastUserMessage] = useState('')
  
  // Feature toggles
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)
  const [streamingEnabled, setStreamingEnabled] = useState(true)
  const [shortcutsEnabled, setShortcutsEnabled] = useState(true)
  
  // API Settings
  const [apiKey, setApiKey] = useState('')
  const [maxTokens, setMaxTokens] = useState(4096)
  const [autoTokens, setAutoTokens] = useState(true)
  const [showApiKeySection, setShowApiKeySection] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordAction, setPasswordAction] = useState<'view' | 'edit'>('view')
  
  // Modals
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showModelSelector, setShowModelSelector] = useState(false)
  
  // Login
  const [emailInput, setEmailInput] = useState('')
  const [passwordInput_login, setPasswordInput_login] = useState('')
  const [loginError, setLoginError] = useState('')
  
  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  // Refs
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const messagesListRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const [isRecording, setIsRecording] = useState(false)

  // ==================== EFFECTS ====================
  useEffect(() => {
    // Load saved preferences
    const savedUser = localStorage.getItem('dohdoh-user')
    const savedLang = localStorage.getItem('dohdoh-lang')
    const savedTheme = localStorage.getItem('dohdoh-theme')
    const savedHistory = localStorage.getItem('dohdoh-history')
    const savedTTS = localStorage.getItem('dohdoh-tts')
    const savedSound = localStorage.getItem('dohdoh-sound')
    const savedAutoScroll = localStorage.getItem('dohdoh-autoscroll')
    const savedModel = localStorage.getItem('dohdoh-model')
    const savedApiKey = localStorage.getItem('dohdoh-apikey')
    const savedStreaming = localStorage.getItem('dohdoh-streaming')
    const savedShortcuts = localStorage.getItem('dohdoh-shortcuts')
    const savedMaxTokens = localStorage.getItem('dohdoh-maxtokens')
    const savedAutoTokens = localStorage.getItem('dohdoh-autotokens')

    if (savedLang) setCurrentLang(savedLang as LangKey)
    if (savedTheme) setCurrentTheme(savedTheme as ThemeKey)
    if (savedHistory) {
      try {
        setChatHistory(JSON.parse(savedHistory))
      } catch { }
    }
    if (savedTTS !== null) setTtsEnabled(savedTTS === 'true')
    if (savedSound !== null) setSoundEnabled(savedSound === 'true')
    if (savedAutoScroll !== null) setAutoScrollEnabled(savedAutoScroll === 'true')
    if (savedModel) setSelectedModel(savedModel)
    if (savedApiKey) setApiKey(savedApiKey)
    if (savedStreaming !== null) setStreamingEnabled(savedStreaming === 'true')
    if (savedShortcuts !== null) setShortcutsEnabled(savedShortcuts === 'true')
    if (savedMaxTokens) setMaxTokens(parseInt(savedMaxTokens))
    if (savedAutoTokens !== null) setAutoTokens(savedAutoTokens === 'true')

    // Show loading screen
    const timer = setTimeout(() => {
      setIsLoading(false)
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser))
          setIsLoggedIn(true)
        } catch {
          // Invalid saved user
        }
      }
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Keyboard shortcuts
    if (!shortcutsEnabled) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N: New Chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        startNewChat()
      }
      // Ctrl/Cmd + H: History
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault()
        setShowHistory(true)
      }
      // Ctrl/Cmd + ,: Settings
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault()
        setShowSettings(true)
      }
      // Escape: Close modals
      if (e.key === 'Escape') {
        setShowSettings(false)
        setShowHistory(false)
        setShowModelDropdown(false)
        setShowPasswordModal(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcutsEnabled, messages])

  // ==================== ULTRA SMOOTH AUTO SCROLL ====================
  const scrollAnimationRef = useRef<number | null>(null)
  const lastScrollTargetRef = useRef<number>(0)
  
  // Easing function for smooth animation
  const easeOutExpo = (t: number): number => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
  }
  
  // Ultra smooth scroll with animation
  const smoothScrollToBottom = useCallback((instant: boolean = false) => {
    if (!autoScrollEnabled || !messagesContainerRef.current) return
    
    const container = messagesContainerRef.current
    const targetScroll = container.scrollHeight - container.clientHeight
    
    // If instant scroll (during typing), just jump to position
    if (instant) {
      container.scrollTop = targetScroll
      return
    }
    
    // Cancel any ongoing animation
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current)
    }
    
    const startScroll = container.scrollTop
    const distance = targetScroll - startScroll
    
    // If already at bottom or very close, don't animate
    if (Math.abs(distance) < 5) {
      container.scrollTop = targetScroll
      return
    }
    
    const duration = 400 // milliseconds
    const startTime = performance.now()
    
    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutExpo(progress)
      
      container.scrollTop = startScroll + (distance * easedProgress)
      
      if (progress < 1) {
        scrollAnimationRef.current = requestAnimationFrame(animateScroll)
      } else {
        scrollAnimationRef.current = null
      }
    }
    
    scrollAnimationRef.current = requestAnimationFrame(animateScroll)
  }, [autoScrollEnabled])
  
  // Instant scroll for typewriter effect
  const instantScrollToBottom = useCallback(() => {
    if (!autoScrollEnabled || !messagesContainerRef.current) return
    
    const container = messagesContainerRef.current
    const targetScroll = container.scrollHeight - container.clientHeight
    container.scrollTop = targetScroll
  }, [autoScrollEnabled])

  // Scroll on messages change
  useEffect(() => {
    smoothScrollToBottom(false)
  }, [messages, smoothScrollToBottom])
  
  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current)
      }
    }
  }, [])

  // ==================== SPEECH RECOGNITION ====================
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = currentLang === 'my' ? 'my-MM' : 'en-US'

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('')
        setInputValue(transcript)
      }

      recognitionRef.current.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current.onerror = () => {
        setIsRecording(false)
        showToast('Voice input error', 'error')
      }
    }
  }, [currentLang])

  // ==================== HELPERS ====================
  const t = TRANSLATIONS[currentLang]

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const playSound = (type: 'send' | 'receive' | 'click' | 'success' | 'error') => {
    if (!soundEnabled || typeof window === 'undefined') return
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      const frequencies: Record<string, number> = {
        send: 800,
        receive: 600,
        click: 1000,
        success: 1200,
        error: 300
      }

      oscillator.frequency.value = frequencies[type] || 500
      gainNode.gain.value = 0.08
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch { }
  }

  // ==================== AUTH ====================
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const user = ALLOWED_USERS.find(u => u.email === emailInput)
    const password = USER_PASSWORDS[emailInput]

    if (user && password === passwordInput_login) {
      setCurrentUser(user)
      localStorage.setItem('dohdoh-user', JSON.stringify(user))
      setLoginError('')
      setIsLoggedIn(true)
      playSound('success')
    } else {
      setLoginError(t.invalidCredentials)
      playSound('error')
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('dohdoh-user')
    setMessages([])
    setIsLoggedIn(false)
    setShowSettings(false)
  }

  // ==================== PASSWORD PROTECTION ====================
  const handlePasswordSubmit = () => {
    if (passwordInput === SETTINGS_PASSWORD) {
      setShowPasswordModal(false)
      setPasswordInput('')
      if (passwordAction === 'view') {
        setShowApiKeySection(true)
      }
    } else {
      showToast(t.wrongPassword, 'error')
    }
  }

  const requestPasswordForApiKey = (action: 'view' | 'edit') => {
    setPasswordAction(action)
    setPasswordInput('')
    setShowPasswordModal(true)
  }

  // ==================== API KEY MANAGEMENT ====================
  const saveApiKey = () => {
    localStorage.setItem('dohdoh-apikey', apiKey)
    showToast(t.apiKeySaved, 'success')
    setShowApiKeySection(false)
  }

  const removeApiKey = () => {
    setApiKey('')
    localStorage.removeItem('dohdoh-apikey')
    showToast(t.apiKeyRemoved, 'success')
    setShowApiKeySection(false)
  }

  // ==================== CHAT ====================
  const sendMessage = async () => {
    const text = inputValue.trim()
    if (!text && attachedFiles.length === 0) return
    if (isTyping) return

    setLastUserMessage(text)

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      files: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setAttachedFiles([])
    playSound('send')

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current)
      typingIntervalRef.current = null
    }

    setIsTyping(true)

    try {
      const apiMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content + (m.files ? `\n[Attached files: ${m.files.map(f => f.name).join(', ')}]` : '')
      }))

      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minute timeout

      const response = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          model: selectedModel,
          apiKey: apiKey || undefined,
          maxTokens: autoTokens 
            ? AI_MODELS.find(m => m.id === selectedModel)?.maxTokens || 4096
            : maxTokens
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const aiContent = data.content || t.error

      if (streamingEnabled) {
        typewriterEffect(aiContent)
      } else {
        const aiMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: aiContent,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiMessage])
        setIsTyping(false)
        playSound('receive')
        
        if (ttsEnabled) {
          speakText(aiContent)
        }
      }

    } catch (error: unknown) {
      setIsTyping(false)
      let errorMessage = 'An error occurred. Please try again.'
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again.'
        } else {
          // Clean up the error message - remove prefixes
          let msg = error.message
          // Remove "API request failed with status XXX: " prefix
          msg = msg.replace(/API request failed with status \d+: /, '')
          // Remove JSON error objects
          msg = msg.replace(/\{[^}]*"message"\s*:\s*"([^"]*)"[^}]*\}/g, '$1')
          // Remove "Something went wrong: " prefix
          msg = msg.replace(/^Something went wrong:\s*/i, '')
          errorMessage = msg
        }
      }
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `⚠️ ${errorMessage}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      playSound('error')
    }
  }

  const typewriterEffect = (text: string) => {
    const aiMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, aiMessage])

    let index = 0
    let lastTime = 0
    const baseSpeed = 8 // milliseconds per character (faster = smoother)

    const animate = (currentTime: number) => {
      if (!lastTime) lastTime = currentTime
      const delta = currentTime - lastTime

      // Variable speed based on content for natural feel
      let speed = baseSpeed
      const currentChar = text[index]
      const nextChar = text[index + 1]
      
      // Slow down for punctuation
      if (['.', '!', '?', '。', '！', '？'].includes(currentChar)) {
        speed = baseSpeed * 4
      } else if ([',', ';', ':', '，', '；', '：'].includes(currentChar)) {
        speed = baseSpeed * 2
      } else if (currentChar === '\n') {
        speed = baseSpeed * 3
      } else if (currentChar === '`' || currentChar === '*') {
        speed = baseSpeed * 0.5 // Fast for markdown
      }

      if (delta >= speed) {
        if (index < text.length) {
          const newContent = text.slice(0, index + 1)
          setMessages(prev => prev.map(m => 
            m.id === aiMessage.id ? { ...m, content: newContent } : m
          ))
          index++
          // Ultra smooth instant scroll during typewriter effect
          instantScrollToBottom()
          lastTime = currentTime
        }
      }

      if (index < text.length) {
        requestAnimationFrame(animate)
      } else {
        setIsTyping(false)
        playSound('receive')

        if (ttsEnabled) {
          speakText(text)
        }
      }
    }

    requestAnimationFrame(animate)
  }

  const speakText = (text: string) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return

    window.speechSynthesis.cancel()

    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'code block')
      .replace(/`[^`]+`/g, 'code')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = currentLang === 'my' ? 'my-MM' : 'en-US'
    utterance.rate = 1
    utterance.pitch = 1

    window.speechSynthesis.speak(utterance)
  }

  const startNewChat = () => {
    if (messages.length > 0) {
      const session: ChatSession = {
        id: Date.now().toString(),
        title: messages[0].content.slice(0, 35) + (messages[0].content.length > 35 ? '...' : ''),
        messages: [...messages],
        model: selectedModel,
        createdAt: new Date().toISOString()
      }
      const newHistory = [session, ...chatHistory]
      setChatHistory(newHistory)
      localStorage.setItem('dohdoh-history', JSON.stringify(newHistory))
    }
    setMessages([])
    playSound('click')
  }

  const loadHistorySession = (session: ChatSession) => {
    setMessages([...session.messages])
    setSelectedModel(session.model)
    setShowHistory(false)
    playSound('click')
  }

  const deleteHistorySession = (id: string) => {
    const newHistory = chatHistory.filter(s => s.id !== id)
    setChatHistory(newHistory)
    localStorage.setItem('dohdoh-history', JSON.stringify(newHistory))
  }

  const clearAllHistory = () => {
    setChatHistory([])
    localStorage.setItem('dohdoh-history', '[]')
    showToast('History cleared', 'success')
  }

  const exportChat = () => {
    if (messages.length === 0) return

    const exportData = {
      title: messages[0]?.content.slice(0, 50) || 'Chat Export',
      model: selectedModel,
      exportedAt: new Date().toISOString(),
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp
      }))
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dohdoh-chat-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Chat exported!', 'success')
  }

  const copyMessage = (id: string) => {
    const msg = messages.find(m => m.id === id)
    if (msg) {
      navigator.clipboard.writeText(msg.content)
      showToast(t.copied, 'success')
    }
  }

  const regenerateResponse = async () => {
    if (isTyping || messages.length < 2) return

    const newMessages = messages.slice(0, -1)
    setMessages(newMessages)

    const lastMsg = newMessages[newMessages.length - 1]
    if (lastMsg && lastMsg.role === 'user') {
      setIsTyping(true)

      try {
        const apiMessages = newMessages.map(m => ({
          role: m.role,
          content: m.content
        }))

        // Create AbortController for timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minute timeout

        const response = await fetch('/api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            model: selectedModel,
            apiKey: apiKey || undefined,
            maxTokens: autoTokens 
              ? AI_MODELS.find(m => m.id === selectedModel)?.maxTokens || 4096
              : maxTokens
          }),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        typewriterEffect(data.content || t.error)
      } catch (error: unknown) {
        setIsTyping(false)
        let errorMessage = t.error
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            errorMessage = 'Request timed out. Please try again.'
          } else {
            errorMessage = error.message
          }
        }
        showToast(errorMessage, 'error')
      }
    }
  }

  // ==================== VOICE INPUT ====================
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      showToast('Voice input not supported', 'error')
      return
    }

    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    } else {
      recognitionRef.current.start()
      setIsRecording(true)
      showToast('Listening...', 'success')
    }
  }

  // ==================== FILE HANDLING ====================
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles: AttachedFile[] = Array.from(files).map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      }))
      setAttachedFiles(prev => [...prev, ...newFiles])
      playSound('click')
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // ==================== RENDER HELPERS ====================
  const processContent = (content: string) => {
    return content
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<div class="code-block"><div class="code-header"><span>$1</span></div><div class="code-content"><code>$2</code></div></div>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
  }

  // ==================== RENDER ====================
  return (
    <main className="app-container" data-theme={currentTheme}>
      <style jsx global>{`
        /* ==================== CSS RESET & BASE ==================== */
        *, *::before, *::after {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Myanmar Text', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
          line-height: 1.6;
        }

        .app-container {
          min-height: 100vh;
        }

        /* ==================== THEME VARIABLES ==================== */
        .app-container {
          --bg-gradient: linear-gradient(135deg, #f0f4f8 0%, #ffffff 50%, #e8f4f8 100%);
          --glass-bg: rgba(255, 255, 255, 0.65);
          --glass-bg-strong: rgba(255, 255, 255, 0.85);
          --glass-border: rgba(255, 255, 255, 0.4);
          --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
          --text-primary: #1e293b;
          --text-secondary: #334155;
          --text-muted: #64748b;
          --input-bg: rgba(255, 255, 255, 0.75);
          --input-border: rgba(148, 163, 184, 0.3);
          --btn-secondary: rgba(100, 116, 139, 0.1);
          --btn-secondary-hover: rgba(100, 116, 139, 0.18);
          --btn-primary: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          --btn-primary-hover: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          --user-bubble: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          --ai-bubble: rgba(255, 255, 255, 0.85);
          --ai-bubble-border: rgba(148, 163, 184, 0.2);
          --accent-color: #6366f1;
          --accent-glow: rgba(99, 102, 241, 0.3);
          --success-color: #10b981;
          --error-color: #ef4444;
          --warning-color: #f59e0b;
          --code-bg: #1e293b;
          --code-text: #e2e8f0;
          
          background: var(--bg-gradient);
          color: var(--text-primary);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .app-container[data-theme="dark"] {
          --bg-gradient: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          --glass-bg: rgba(30, 41, 59, 0.65);
          --glass-bg-strong: rgba(30, 41, 59, 0.85);
          --glass-border: rgba(71, 85, 105, 0.4);
          --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2);
          --text-primary: #f1f5f9;
          --text-secondary: #e2e8f0;
          --text-muted: #94a3b8;
          --input-bg: rgba(30, 41, 59, 0.7);
          --input-border: rgba(71, 85, 105, 0.4);
          --btn-secondary: rgba(148, 163, 184, 0.1);
          --btn-secondary-hover: rgba(148, 163, 184, 0.2);
          --ai-bubble: rgba(30, 41, 59, 0.85);
          --ai-bubble-border: rgba(71, 85, 105, 0.3);
          --code-bg: #0f172a;
          --code-text: #e2e8f0;
        }

        .app-container[data-theme="pink"] {
          --bg-gradient: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%);
          --glass-bg: rgba(255, 255, 255, 0.6);
          --glass-bg-strong: rgba(255, 255, 255, 0.85);
          --glass-border: rgba(244, 114, 182, 0.25);
          --glass-shadow: 0 8px 32px rgba(244, 114, 182, 0.12), 0 2px 8px rgba(244, 114, 182, 0.08);
          --text-primary: #831843;
          --text-secondary: #9d174d;
          --text-muted: #be185d;
          --input-bg: rgba(255, 255, 255, 0.7);
          --input-border: rgba(244, 114, 182, 0.35);
          --btn-secondary: rgba(244, 114, 182, 0.12);
          --btn-secondary-hover: rgba(244, 114, 182, 0.22);
          --btn-primary: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
          --btn-primary-hover: linear-gradient(135deg, #db2777 0%, #ec4899 100%);
          --user-bubble: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
          --ai-bubble: rgba(255, 255, 255, 0.8);
          --ai-bubble-border: rgba(244, 114, 182, 0.25);
          --accent-color: #ec4899;
          --accent-glow: rgba(236, 72, 153, 0.3);
          --code-bg: #831843;
          --code-text: #fce7f3;
        }

        .app-container[data-theme="ocean"] {
          --bg-gradient: linear-gradient(135deg, #ecfeff 0%, #cffafe 50%, #a5f3fc 100%);
          --glass-bg: rgba(255, 255, 255, 0.6);
          --glass-bg-strong: rgba(255, 255, 255, 0.85);
          --glass-border: rgba(6, 182, 212, 0.25);
          --glass-shadow: 0 8px 32px rgba(6, 182, 212, 0.12);
          --text-primary: #164e63;
          --text-secondary: #155e75;
          --text-muted: #0891b2;
          --input-bg: rgba(255, 255, 255, 0.7);
          --input-border: rgba(6, 182, 212, 0.35);
          --btn-secondary: rgba(6, 182, 212, 0.12);
          --btn-secondary-hover: rgba(6, 182, 212, 0.22);
          --btn-primary: linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%);
          --btn-primary-hover: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
          --user-bubble: linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%);
          --ai-bubble: rgba(255, 255, 255, 0.8);
          --ai-bubble-border: rgba(6, 182, 212, 0.25);
          --accent-color: #06b6d4;
          --accent-glow: rgba(6, 182, 212, 0.3);
          --code-bg: #164e63;
          --code-text: #cffafe;
        }

        .app-container[data-theme="forest"] {
          --bg-gradient: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%);
          --glass-bg: rgba(255, 255, 255, 0.6);
          --glass-bg-strong: rgba(255, 255, 255, 0.85);
          --glass-border: rgba(34, 197, 94, 0.25);
          --glass-shadow: 0 8px 32px rgba(34, 197, 94, 0.1);
          --text-primary: #14532d;
          --text-secondary: #166534;
          --text-muted: #15803d;
          --input-bg: rgba(255, 255, 255, 0.7);
          --input-border: rgba(34, 197, 94, 0.35);
          --btn-secondary: rgba(34, 197, 94, 0.12);
          --btn-secondary-hover: rgba(34, 197, 94, 0.22);
          --btn-primary: linear-gradient(135deg, #22c55e 0%, #4ade80 100%);
          --btn-primary-hover: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
          --user-bubble: linear-gradient(135deg, #22c55e 0%, #4ade80 100%);
          --ai-bubble: rgba(255, 255, 255, 0.8);
          --ai-bubble-border: rgba(34, 197, 94, 0.25);
          --accent-color: #22c55e;
          --accent-glow: rgba(34, 197, 94, 0.3);
          --code-bg: #14532d;
          --code-text: #dcfce7;
        }

        /* ==================== ULTRA SMOOTH ANIMATIONS ==================== */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.98); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px var(--accent-glow); }
          50% { box-shadow: 0 0 40px var(--accent-glow), 0 0 60px var(--accent-glow); }
        }

        @keyframes ripple {
          to { transform: scale(4); opacity: 0; }
        }

        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.3); }
          28% { transform: scale(1); }
          42% { transform: scale(1.3); }
          70% { transform: scale(1); }
        }

        @keyframes elasticIn {
          0% { transform: scale(0); opacity: 0; }
          55% { transform: scale(1.1); }
          70% { transform: scale(0.95); }
          85% { transform: scale(1.02); }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes smoothSlide {
          0% { transform: translateY(20px) scale(0.95); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }

        @keyframes rotateIn {
          from { transform: rotate(-180deg) scale(0); opacity: 0; }
          to { transform: rotate(0deg) scale(1); opacity: 1; }
        }

        @keyframes zoomIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes slideInFromRight {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes slideInFromLeft {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes slideInFromBottom {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes typewriterCursor {
          0%, 50% { border-right-color: var(--accent-color); }
          51%, 100% { border-right-color: transparent; }
        }

        .animate-fade-in { animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .animate-fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .animate-fade-in-down { animation: fadeInDown 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .animate-scale-in { animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-elastic-in { animation: elasticIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-slide-in-up { animation: slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .animate-slide-in-right { animation: slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .animate-slide-in-left { animation: slideInLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .animate-smooth-slide { animation: smoothSlide 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }
        .animate-bounce { animation: bounce 2s ease-in-out infinite; }
        .animate-spin { animation: spin 1.5s linear infinite; }
        .animate-float { animation: float 5s ease-in-out infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-heartbeat { animation: heartbeat 1.5s ease-in-out infinite; }

        /* ==================== GLASS EFFECT ==================== */
        .glass {
          background: var(--glass-bg);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow);
        }

        .glass-strong {
          background: var(--glass-bg-strong);
          backdrop-filter: blur(32px) saturate(200%);
          -webkit-backdrop-filter: blur(32px) saturate(200%);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        /* ==================== LOADING SCREEN ==================== */
        .loading-screen {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 200;
          background: var(--bg-gradient);
        }

        .loading-logo {
          width: 120px;
          height: 120px;
          position: relative;
          margin-bottom: 2rem;
        }

        .loading-logo-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 4px solid transparent;
          border-top-color: var(--accent-color);
          animation: spin 1.2s linear infinite;
        }

        .loading-logo-ring:nth-child(2) {
          inset: 10px;
          border-top-color: transparent;
          border-right-color: var(--accent-color);
          animation-duration: 1.8s;
          animation-direction: reverse;
        }

        .loading-logo-ring:nth-child(3) {
          inset: 20px;
          border-top-color: var(--accent-color);
          animation-duration: 2.4s;
        }

        .loading-logo-inner {
          position: absolute;
          inset: 30px;
          border-radius: 50%;
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
        }

        .loading-title {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, var(--accent-color), #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .loading-subtitle {
          color: var(--text-muted);
          margin-bottom: 2rem;
          font-size: 1rem;
        }

        .loading-progress {
          width: 200px;
          height: 4px;
          background: var(--btn-secondary);
          border-radius: 2px;
          overflow: hidden;
        }

        .loading-progress-bar {
          height: 100%;
          background: var(--btn-primary);
          border-radius: 2px;
          animation: shimmer 1.5s infinite;
          background-size: 200% 100%;
        }

        /* ==================== LOGIN SCREEN ==================== */
        .login-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          border-radius: 28px;
          padding: 2.5rem;
        }

        .login-logo {
          width: 90px;
          height: 90px;
          margin: 0 auto 1.5rem;
          position: relative;
        }

        .login-logo::before {
          content: '';
          position: absolute;
          inset: -5px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-color), #ec4899);
          opacity: 0.4;
          filter: blur(20px);
          animation: pulse 2s ease-in-out infinite;
        }

        .login-logo-inner {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
        }

        .login-title {
          font-size: 2rem;
          font-weight: 800;
          text-align: center;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, var(--accent-color), #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .login-subtitle {
          text-align: center;
          color: var(--text-muted);
          margin-bottom: 2rem;
          font-size: 0.95rem;
        }

        /* ==================== FORM ELEMENTS ==================== */
        .input-group {
          margin-bottom: 1rem;
        }

        .input-field {
          width: 100%;
          padding: 1rem 1.25rem;
          border-radius: 16px;
          border: 2px solid var(--input-border);
          background: var(--input-bg);
          backdrop-filter: blur(10px);
          font-size: 1rem;
          color: var(--text-primary);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
        }

        .input-field::placeholder {
          color: var(--text-muted);
        }

        .input-field:focus {
          border-color: var(--accent-color);
          box-shadow: 0 0 0 4px var(--accent-glow);
        }

        .btn {
          padding: 0.9rem 1.5rem;
          border-radius: 14px;
          border: none;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          position: relative;
          overflow: hidden;
        }

        .btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
          transform: scale(0);
          transition: transform 0.5s ease;
        }

        .btn:active::after {
          transform: scale(2);
        }

        .btn:active {
          transform: scale(0.97);
        }

        .btn-primary {
          background: var(--btn-primary);
          color: white;
          box-shadow: 0 4px 20px var(--accent-glow);
        }

        .btn-primary:hover {
          background: var(--btn-primary-hover);
          box-shadow: 0 8px 30px var(--accent-glow);
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: var(--btn-secondary);
          color: var(--text-primary);
        }

        .btn-secondary:hover {
          background: var(--btn-secondary-hover);
          transform: translateY(-1px);
        }

        .btn-icon {
          padding: 0.75rem;
          border-radius: 12px;
        }

        .btn-full {
          width: 100%;
        }

        .btn-danger {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error-color);
        }

        .btn-danger:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        .error-message {
          color: var(--error-color);
          font-size: 0.875rem;
          text-align: center;
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 10px;
          animation: fadeIn 0.3s ease;
        }

        /* ==================== MAIN CHAT SCREEN ==================== */
        .chat-screen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          height: 100vh;
          height: 100dvh; /* Dynamic viewport height for mobile */
        }

        /* Header */
        .chat-header {
          position: relative;
          z-index: 50;
          padding: 0.6rem 0.75rem;
          flex-shrink: 0;
          background: var(--glass-bg-strong);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid var(--glass-border);
        }

        @media (min-width: 640px) {
          .chat-header {
            padding: 0.75rem 1rem;
          }
        }

        .chat-header-inner {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .chat-header-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .chat-header-logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: var(--btn-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px var(--accent-glow);
          font-size: 1.25rem;
        }

        .chat-header-title {
          font-weight: 800;
          font-size: 1.2rem;
          background: linear-gradient(135deg, var(--accent-color), #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .chat-header-actions {
          display: flex;
          gap: 0.5rem;
        }

        .chat-header-status {
          display: none;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border-radius: 20px;
          background: var(--btn-secondary);
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        @media (min-width: 640px) {
          .chat-header-status {
            display: flex;
          }
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--success-color);
          animation: pulse 2s infinite;
        }

        /* Messages Container */
        .messages-container {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          scroll-behavior: auto;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          padding: 0.75rem;
          padding-bottom: 1.5rem;
          min-height: 0; /* Important for flex child scrolling */
        }

        @media (min-width: 640px) {
          .messages-container {
            padding: 1rem;
          }
        }

        .messages-container::-webkit-scrollbar {
          width: 4px;
        }

        @media (min-width: 640px) {
          .messages-container::-webkit-scrollbar {
            width: 6px;
          }
        }

        .messages-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .messages-container::-webkit-scrollbar-thumb {
          background: var(--input-border);
          border-radius: 3px;
        }

        .messages-container::-webkit-scrollbar-thumb:hover {
          background: var(--text-muted);
        }

        /* Chat Input */
        .chat-input-container {
          position: relative;
          z-index: 50;
          padding: 0.5rem;
          padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
          flex-shrink: 0;
          background: var(--glass-bg-strong);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-top: 1px solid var(--glass-border);
        }

        @media (min-width: 640px) {
          .chat-input-container {
            padding: 0.75rem;
            padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
          }
        }

        .chat-input-inner {
          max-width: 900px;
          margin: 0 auto;
        }

        .welcome-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
          animation: fadeIn 0.8s ease;
        }

        .welcome-icon {
          width: 120px;
          height: 120px;
          margin-bottom: 2rem;
          position: relative;
        }

        .welcome-icon::before {
          content: '';
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-color), #ec4899);
          opacity: 0.3;
          filter: blur(30px);
          animation: pulse 3s ease-in-out infinite;
        }

        .welcome-icon-inner {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: float 5s ease-in-out infinite;
          font-size: 3rem;
        }

        .welcome-title {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 0.75rem;
          background: linear-gradient(135deg, var(--accent-color), #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .welcome-subtitle {
          color: var(--text-muted);
          font-size: 1.1rem;
          max-width: 400px;
        }

        .welcome-suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
          margin-top: 2rem;
        }

        .suggestion-chip {
          padding: 0.75rem 1.25rem;
          border-radius: 20px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .suggestion-chip:hover {
          background: var(--btn-secondary-hover);
          border-color: var(--accent-color);
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 20px var(--accent-glow);
        }

        /* Message Bubbles */
        .message {
          display: flex;
          margin-bottom: 1.25rem;
          animation: smoothSlide 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .message-user {
          justify-content: flex-end;
        }

        .message-ai {
          justify-content: flex-start;
        }

        .message-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          flex-shrink: 0;
          margin: 0 0.75rem;
          transition: transform 0.3s ease;
        }

        .message-avatar:hover {
          transform: scale(1.1);
        }

        .message-avatar.ai {
          background: var(--btn-primary);
          box-shadow: 0 4px 15px var(--accent-glow);
        }

        .message-avatar.user {
          background: var(--btn-secondary);
        }

        .message-content {
          max-width: 75%;
        }

        .message-bubble {
          padding: 1rem 1.25rem;
          border-radius: 22px;
          font-size: 0.95rem;
          line-height: 1.6;
          word-wrap: break-word;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .message-user .message-bubble {
          background: var(--user-bubble);
          color: white;
          border-bottom-right-radius: 6px;
          box-shadow: 0 4px 20px var(--accent-glow);
        }

        .message-ai .message-bubble {
          background: var(--ai-bubble);
          border: 1px solid var(--ai-bubble-border);
          color: var(--text-primary);
          border-bottom-left-radius: 6px;
        }

        .message-bubble:hover {
          transform: translateY(-1px);
        }

        .message-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .message:hover .message-actions {
          opacity: 1;
        }

        .message-action-btn {
          padding: 0.35rem 0.6rem;
          border-radius: 8px;
          background: var(--btn-secondary);
          border: none;
          color: var(--text-muted);
          font-size: 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          transition: all 0.2s ease;
        }

        .message-action-btn:hover {
          background: var(--btn-secondary-hover);
          color: var(--text-primary);
          transform: translateY(-1px);
        }

        .message-action-btn svg {
          width: 14px;
          height: 14px;
        }

        /* Code Block */
        .code-block {
          margin: 0.75rem 0;
          border-radius: 12px;
          overflow: hidden;
          background: var(--code-bg);
        }

        .code-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 1rem;
          background: rgba(0, 0, 0, 0.2);
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .code-content {
          padding: 1rem;
          overflow-x: auto;
          font-family: 'Monaco', 'Consolas', monospace;
          font-size: 0.85rem;
          line-height: 1.5;
          color: var(--code-text);
        }

        .code-content code {
          white-space: pre;
        }

        /* Inline Code */
        .message-bubble code:not(.code-content code) {
          background: rgba(0, 0, 0, 0.08);
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          font-family: 'Monaco', 'Consolas', monospace;
          font-size: 0.85em;
        }

        .message-user .message-bubble code:not(.code-content code) {
          background: rgba(255, 255, 255, 0.2);
        }

        /* Typing Indicator */
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          background: var(--ai-bubble);
          border: 1px solid var(--ai-bubble-border);
          border-radius: 22px;
          border-bottom-left-radius: 6px;
          animation: fadeInUp 0.3s ease;
        }

        .typing-dots {
          display: flex;
          gap: 5px;
        }

        .typing-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: var(--accent-color);
          animation: bounce 1.2s ease-in-out infinite;
        }

        .typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .typing-dot:nth-child(3) { animation-delay: 0.3s; }

        .typing-text {
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        /* Model Selector */
        .model-selector {
          margin-bottom: 0.75rem;
        }

        .model-selector-btn {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 14px;
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border: 1px solid var(--glass-border);
          color: var(--text-primary);
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .model-selector-btn:hover {
          background: var(--btn-secondary-hover);
          border-color: var(--accent-color);
        }

        .model-selector-btn svg {
          width: 18px;
          height: 18px;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .model-selector-btn.open svg {
          transform: rotate(180deg);
        }

        .model-selector-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .model-dropdown {
          margin-top: 0.5rem;
          border-radius: 14px;
          background: var(--glass-bg-strong);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          max-height: 280px;
          overflow-y: auto;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          transform-origin: top;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .model-dropdown.hidden {
          display: none;
        }

        .model-dropdown:not(.hidden) {
          animation: elasticIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .model-option {
          padding: 0.85rem 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.2s ease;
          border-bottom: 1px solid var(--glass-border);
        }

        .model-option:last-child {
          border-bottom: none;
        }

        .model-option:hover {
          background: var(--btn-secondary);
          transform: translateX(5px);
        }

        .model-option.selected {
          background: var(--btn-secondary);
          border-left: 3px solid var(--accent-color);
        }

        .model-option-name {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .model-option-provider {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .model-badge {
          font-size: 0.7rem;
          padding: 0.25rem 0.6rem;
          border-radius: 12px;
          background: rgba(16, 185, 129, 0.15);
          color: var(--success-color);
          font-weight: 600;
        }

        /* Attached Files */
        .attached-files {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .attached-file {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 0.85rem;
          border-radius: 12px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          font-size: 0.85rem;
          animation: elasticIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .attached-file-remove {
          cursor: pointer;
          color: var(--error-color);
          display: flex;
          transition: transform 0.2s ease;
        }

        .attached-file-remove:hover {
          transform: scale(1.2) rotate(90deg);
        }

        .attached-file-remove svg {
          width: 16px;
          height: 16px;
        }

        /* Input Row */
        .input-row {
          display: flex;
          gap: 0.5rem;
          align-items: flex-end;
        }

        .chat-textarea {
          flex: 1;
          padding: 1rem 1.15rem;
          border-radius: 18px;
          border: 2px solid var(--input-border);
          background: var(--input-bg);
          backdrop-filter: blur(10px);
          font-size: 1rem;
          color: var(--text-primary);
          resize: none;
          min-height: 54px;
          max-height: 180px;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: inherit;
          line-height: 1.5;
        }

        .chat-textarea::placeholder {
          color: var(--text-muted);
        }

        .chat-textarea:focus {
          border-color: var(--accent-color);
          box-shadow: 0 0 0 4px var(--accent-glow);
        }

        .voice-btn.recording {
          background: var(--error-color);
          color: white;
          animation: pulse 1s infinite;
        }

        .char-counter {
          text-align: right;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.35rem;
          transition: color 0.3s ease;
        }

        /* ==================== MOBILE RESPONSIVE ==================== */
        @media (max-width: 640px) {
          .chat-screen {
            /* Ensure proper height on mobile browsers */
            height: 100vh;
            height: 100dvh;
            height: -webkit-fill-available;
          }
          
          .chat-header {
            padding: 0.5rem 0.6rem;
          }
          
          .chat-header-title {
            font-size: 1rem;
          }
          
          .chat-header-logo-icon {
            width: 36px;
            height: 36px;
            font-size: 1rem;
          }
          
          .messages-container {
            padding: 0.5rem;
            -webkit-overflow-scrolling: touch;
          }
          
          .chat-input-container {
            padding: 0.4rem;
            padding-bottom: max(0.4rem, env(safe-area-inset-bottom));
          }
          
          .chat-textarea {
            padding: 0.75rem 0.9rem;
            font-size: 16px; /* Prevents zoom on iOS */
            min-height: 44px;
            border-radius: 16px;
          }
          
          .input-row {
            gap: 0.4rem;
          }
          
          .btn-icon {
            width: 42px;
            height: 42px;
            padding: 0.6rem;
          }
          
          .message {
            margin-bottom: 0.75rem;
          }
          
          .message-bubble {
            font-size: 0.95rem;
            padding: 0.75rem 1rem;
          }
          
          .welcome-title {
            font-size: 1.5rem;
          }
          
          .welcome-subtitle {
            font-size: 1rem;
          }
          
          .welcome-icon {
            width: 100px;
            height: 100px;
          }
          
          .suggestion-chip {
            padding: 0.6rem 1rem;
            font-size: 0.85rem;
          }
          
          /* Larger touch targets */
          .btn {
            min-height: 44px;
          }
          
          .message-action-btn {
            min-height: 36px;
            padding: 0.4rem 0.7rem;
          }
          
          /* Hide some elements on mobile */
          .char-counter {
            font-size: 0.7rem;
          }
        }

        /* Landscape mobile */
        @media (max-width: 896px) and (orientation: landscape) {
          .chat-screen {
            height: 100vh;
            height: 100dvh;
          }
          
          .welcome-screen {
            min-height: 50vh;
          }
          
          .welcome-icon {
            width: 70px;
            height: 70px;
            margin-bottom: 1rem;
          }
          
          .welcome-title {
            font-size: 1.2rem;
          }
        }

        /* ==================== MODALS ==================== */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 100;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .modal-overlay.open {
          opacity: 1;
          visibility: visible;
        }

        .modal {
          width: 100%;
          max-width: 450px;
          max-height: 85vh;
          border-radius: 28px;
          padding: 1.75rem;
          overflow-y: auto;
          transform: scale(0.9) translateY(20px);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .modal-overlay.open .modal {
          transform: scale(1) translateY(0);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .modal-title {
          font-size: 1.35rem;
          font-weight: 700;
        }

        .modal-close {
          padding: 0.6rem;
          border-radius: 12px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background: var(--btn-secondary);
          color: var(--text-primary);
          transform: rotate(90deg);
        }

        .modal-close svg {
          width: 22px;
          height: 22px;
        }

        /* Settings */
        .settings-section {
          margin-bottom: 1.75rem;
        }

        .settings-label {
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 0.85rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .settings-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.6rem;
        }

        .settings-options.three-col {
          grid-template-columns: repeat(3, 1fr);
        }

        .settings-options.five-col {
          grid-template-columns: repeat(5, 1fr);
        }

        .settings-option {
          padding: 0.9rem;
          border-radius: 14px;
          background: var(--btn-secondary);
          border: 2px solid transparent;
          cursor: pointer;
          text-align: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .settings-option:hover {
          background: var(--btn-secondary-hover);
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .settings-option.active {
          border-color: var(--accent-color);
          background: var(--btn-secondary-hover);
          box-shadow: 0 4px 15px var(--accent-glow);
        }

        .settings-option-icon {
          font-size: 1.6rem;
          margin-bottom: 0.35rem;
        }

        .settings-option-text {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .user-card {
          padding: 1.1rem;
          border-radius: 16px;
          background: var(--glass-bg);
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
          border: 1px solid var(--glass-border);
          transition: all 0.3s ease;
        }

        .user-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--btn-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.2rem;
          box-shadow: 0 4px 15px var(--accent-glow);
        }

        .user-info-name {
          font-weight: 700;
          font-size: 1.05rem;
        }

        .user-info-email {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .logout-btn {
          width: 100%;
          padding: 1rem;
          border-radius: 14px;
          background: rgba(239, 68, 68, 0.1);
          border: none;
          color: var(--error-color);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: translateY(-2px);
        }

        /* Settings Toggles */
        .settings-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          border-radius: 14px;
          background: var(--btn-secondary);
          margin-bottom: 0.6rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .settings-toggle:hover {
          background: var(--btn-secondary-hover);
          transform: translateX(5px);
        }

        .settings-toggle-label {
          font-weight: 600;
        }

        .settings-toggle-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .toggle-switch {
          width: 52px;
          height: 30px;
          background: var(--input-border);
          border-radius: 15px;
          position: relative;
          transition: background 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .toggle-switch.active {
          background: var(--accent-color);
        }

        .toggle-switch::after {
          content: '';
          position: absolute;
          top: 3px;
          left: 3px;
          width: 24px;
          height: 24px;
          background: white;
          border-radius: 50%;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .toggle-switch.active::after {
          transform: translateX(22px);
        }

        /* API Key Section */
        .api-key-section {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 14px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          animation: fadeInUp 0.3s ease;
        }

        .api-key-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          background: var(--btn-secondary);
          margin-bottom: 1rem;
        }

        .api-key-status-icon {
          font-size: 1.2rem;
        }

        .api-key-status-text {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        /* History */
        .history-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          max-height: 450px;
          overflow-y: auto;
        }

        .history-empty {
          text-align: center;
          padding: 3rem;
          color: var(--text-muted);
        }

        .history-empty svg {
          width: 56px;
          height: 56px;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .history-item {
          padding: 1.1rem;
          border-radius: 16px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .history-item:hover {
          background: var(--btn-secondary-hover);
          border-color: var(--accent-color);
          transform: translateX(8px);
          box-shadow: 0 8px 20px var(--accent-glow);
        }

        .history-item-title {
          font-weight: 600;
          margin-bottom: 0.35rem;
        }

        .history-item-meta {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .history-item-delete {
          padding: 0.6rem;
          border-radius: 10px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .history-item-delete:hover {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error-color);
          transform: scale(1.1);
        }

        .history-item-delete svg {
          width: 18px;
          height: 18px;
        }

        .clear-history-btn {
          padding: 0.6rem 1rem;
          border-radius: 10px;
          background: transparent;
          border: none;
          color: var(--error-color);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clear-history-btn:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        /* ==================== TOAST NOTIFICATIONS ==================== */
        .toast-container {
          position: fixed;
          bottom: 100px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 150;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .toast {
          padding: 0.85rem 1.25rem;
          border-radius: 14px;
          background: var(--glass-bg-strong);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          animation: elasticIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .toast.success {
          border-color: rgba(16, 185, 129, 0.3);
        }

        .toast.error {
          border-color: rgba(239, 68, 68, 0.3);
        }

        .toast.hide {
          animation: fadeOut 0.3s ease forwards;
        }

        @keyframes fadeOut {
          to { opacity: 0; transform: translateY(10px); }
        }

        /* ==================== SCROLLBAR ==================== */
        ::-webkit-scrollbar {
          width: 7px;
          height: 7px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(128, 128, 128, 0.25);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(128, 128, 128, 0.4);
        }

        /* ==================== RESPONSIVE ==================== */
        @media (max-width: 640px) {
          .chat-header-title {
            display: none;
          }

          .chat-header-status {
            display: none;
          }

          .message-content {
            max-width: 88%;
          }

          .message-avatar {
            display: none;
          }

          .login-card {
            padding: 1.75rem;
          }

          .modal {
            max-height: 90vh;
            border-radius: 24px;
          }

          .welcome-title {
            font-size: 1.6rem;
          }

          .welcome-suggestions {
            flex-direction: column;
            align-items: center;
          }

          .settings-options.five-col {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>

      {/* Toast Container */}
      <div className="toast-container">
        {toast && (
          <div className={`toast ${toast.type}`}>
            <span>{toast.type === 'success' ? '✅' : '❌'}</span>
            <span>{toast.message}</span>
          </div>
        )}
      </div>

      {/* Loading Screen */}
      {isLoading && (
        <div className="loading-screen">
          <div className="loading-logo">
            <div className="loading-logo-ring"></div>
            <div className="loading-logo-ring"></div>
            <div className="loading-logo-ring"></div>
            <div className="loading-logo-inner">🤖</div>
          </div>
          <h1 className="loading-title">{t.appName}</h1>
          <p className="loading-subtitle">Your Intelligent AI Assistant</p>
          <div className="loading-progress">
            <div className="loading-progress-bar" style={{ width: '100%' }}></div>
          </div>
        </div>
      )}

      {/* Login Screen */}
      {!isLoading && !isLoggedIn && (
        <div className="login-screen animate-fade-in">
          <div className="login-card glass-strong">
            <div className="login-logo">
              <div className="login-logo-inner">🤖</div>
            </div>
            <h1 className="login-title">{t.appName}</h1>
            <p className="login-subtitle">{t.loginSubtitle}</p>

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <input
                  type="email"
                  className="input-field"
                  placeholder={`📧 ${t.emailPlaceholder}`}
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  className="input-field"
                  placeholder={`🔒 ${t.passwordPlaceholder}`}
                  value={passwordInput_login}
                  onChange={(e) => setPasswordInput_login(e.target.value)}
                  required
                />
              </div>
              {loginError && <p className="error-message">{loginError}</p>}
              <button type="submit" className="btn btn-primary btn-full">
                <span>✨</span>
                <span>{t.signIn}</span>
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              🚀 Powered by Advanced AI Technology
            </p>
          </div>
        </div>
      )}

      {/* Chat Screen */}
      {!isLoading && isLoggedIn && (
        <div className="chat-screen">
          {/* Header */}
          <header className="chat-header glass">
            <div className="chat-header-inner">
              <div className="chat-header-logo">
                <div className="chat-header-logo-icon">🤖</div>
                <span className="chat-header-title">{t.appName}</span>
              </div>
              <div className="chat-header-status">
                <div className="status-dot"></div>
                <span>{t.online}</span>
              </div>
              <div className="chat-header-actions">
                {/* New Chat Button - Moved to Header beside Settings */}
                <button
                  className="btn btn-secondary btn-icon"
                  onClick={startNewChat}
                  title={t.newChat}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <button
                  className="btn btn-secondary btn-icon"
                  onClick={() => setShowHistory(true)}
                  title={t.chatHistory}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </button>
                <button
                  className="btn btn-secondary btn-icon"
                  onClick={() => setShowSettings(true)}
                  title={t.settings}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </header>

          {/* Messages Container */}
          <div className="messages-container" ref={messagesContainerRef}>
            {messages.length === 0 ? (
              <div className="welcome-screen">
                <div className="welcome-icon">
                  <div className="welcome-icon-inner">🤖</div>
                </div>
                <h2 className="welcome-title">{t.welcome}</h2>
                <p className="welcome-subtitle">{t.welcomeDesc}</p>
                <div className="welcome-suggestions">
                  {[
                    { msg: 'What AI model are you?', icon: '🤖', label: 'What are you?' },
                    { msg: 'Help me write code', icon: '💻', label: 'Help with code' },
                    { msg: 'Explain quantum physics', icon: '🔬', label: 'Explain science' },
                    { msg: 'Write a poem', icon: '✍️', label: 'Write a poem' }
                  ].map((suggestion, i) => (
                    <div
                      key={i}
                      className="suggestion-chip"
                      onClick={() => {
                        setInputValue(suggestion.msg)
                        setTimeout(() => sendMessage(), 100)
                      }}
                    >
                      {suggestion.icon} {suggestion.label}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <div ref={messagesListRef}>
              {messages.map((msg, index) => (
                <div key={msg.id} className={`message message-${msg.role}`} style={{ animationDelay: `${index * 0.05}s` }}>
                  {msg.role === 'assistant' && (
                    <div className="message-avatar ai">🤖</div>
                  )}
                  <div className="message-content">
                    <div
                      className="message-bubble"
                      dangerouslySetInnerHTML={{ __html: processContent(msg.content) }}
                    />
                    {msg.role === 'assistant' && (
                      <div className="message-actions">
                        <button className="message-action-btn" onClick={() => copyMessage(msg.id)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                          {t.copy}
                        </button>
                        <button className="message-action-btn" onClick={regenerateResponse}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                          </svg>
                          {t.regenerate}
                        </button>
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="message-avatar user">{currentUser?.name?.charAt(0) || 'U'}</div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="message message-ai">
                  <div className="message-avatar ai">🤖</div>
                  <div className="typing-indicator">
                    <div className="typing-dots">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                    <span className="typing-text">{t.thinking}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Input */}
          <div className="chat-input-container glass">
            <div className="chat-input-inner">
              {/* Attached Files */}
              {attachedFiles.length > 0 && (
                <div className="attached-files">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="attached-file">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                      </svg>
                      <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                      <div className="attached-file-remove" onClick={() => removeAttachedFile(index)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Input Row */}
              <div className="input-row">
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
                <button
                  className="btn btn-secondary btn-icon"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload File"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                  </svg>
                </button>
                <textarea
                  ref={inputRef}
                  className="chat-textarea"
                  placeholder={t.typeMessage}
                  rows={1}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value)
                    e.target.style.height = 'auto'
                    e.target.style.height = Math.min(e.target.scrollHeight, 180) + 'px'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                />
                <button
                  className={`btn btn-secondary btn-icon voice-btn ${isRecording ? 'recording' : ''}`}
                  onClick={toggleVoiceInput}
                  title="Voice Input"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                </button>
                <button className="btn btn-primary btn-icon" onClick={sendMessage}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>

              <div className="char-counter">
                {inputValue.length} / 4000
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <div className={`modal-overlay ${showSettings ? 'open' : ''}`} onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowSettings(false)
          setShowModelSelector(false)
        }
      }}>
        <div className="modal glass-strong">
          <div className="modal-header">
            <h3 className="modal-title">⚙️ {t.settings}</h3>
            <button className="modal-close" onClick={() => {
              setShowSettings(false)
              setShowModelSelector(false)
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* AI Model Selection */}
          <div className="settings-section">
            <div 
              className="settings-toggle"
              onClick={() => setShowModelSelector(!showModelSelector)}
            >
              <div>
                <div className="settings-toggle-label">🔮 AI Model</div>
                <div className="settings-toggle-desc">
                  {AI_MODELS.find(m => m.id === selectedModel)?.name} • {(AI_MODELS.find(m => m.id === selectedModel)?.maxTokens || 0) / 1024}K tokens
                </div>
              </div>
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ 
                  width: '20px', 
                  height: '20px',
                  transform: showModelSelector ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                  color: 'var(--text-muted)'
                }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            
            {showModelSelector && (
              <div style={{ 
                maxHeight: '250px', 
                overflowY: 'auto', 
                borderRadius: '14px',
                border: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)',
                marginTop: '0.5rem',
                animation: 'fadeInUp 0.3s ease'
              }}>
                {AI_MODELS.map(model => (
                  <div
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id)
                      localStorage.setItem('dohdoh-model', model.id)
                      playSound('click')
                    }}
                    style={{
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      borderBottom: '1px solid var(--glass-border)',
                      background: model.id === selectedModel ? 'var(--btn-secondary)' : 'transparent'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{model.icon} {model.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{model.provider}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '8px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: 'var(--accent-color)',
                        fontWeight: 600
                      }}>
                        {(model.maxTokens / 1024).toFixed(0)}K tokens
                      </span>
                      <span style={{
                        fontSize: '0.65rem',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '8px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: 'var(--success-color)',
                        fontWeight: 600
                      }}>FREE</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Language */}
          <div className="settings-section">
            <p className="settings-label">🌐 {t.language}</p>
            <div className="settings-options">
              {[
                { lang: 'en', icon: '🇺🇸', label: 'English' },
                { lang: 'my', icon: '🇲🇲', label: 'မြန်မာ' }
              ].map(option => (
                <button
                  key={option.lang}
                  className={`settings-option ${currentLang === option.lang ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentLang(option.lang as LangKey)
                    localStorage.setItem('dohdoh-lang', option.lang)
                  }}
                >
                  <div className="settings-option-icon">{option.icon}</div>
                  <div className="settings-option-text">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="settings-section">
            <p className="settings-label">🎨 {t.theme}</p>
            <div className="settings-options five-col">
              {[
                { theme: 'light', icon: '☀️', label: 'Light' },
                { theme: 'dark', icon: '🌙', label: 'Dark' },
                { theme: 'pink', icon: '🌸', label: 'Pink' },
                { theme: 'ocean', icon: '🌊', label: 'Ocean' },
                { theme: 'forest', icon: '🌲', label: 'Forest' }
              ].map(option => (
                <button
                  key={option.theme}
                  className={`settings-option ${currentTheme === option.theme ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentTheme(option.theme as ThemeKey)
                    localStorage.setItem('dohdoh-theme', option.theme)
                  }}
                >
                  <div className="settings-option-icon">{option.icon}</div>
                  <div className="settings-option-text">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="settings-section">
            <p className="settings-label">✨ Features</p>

            <div className="settings-toggle" onClick={() => {
              setTtsEnabled(!ttsEnabled)
              localStorage.setItem('dohdoh-tts', (!ttsEnabled).toString())
            }}>
              <div>
                <div className="settings-toggle-label">🔊 Text to Speech</div>
                <div className="settings-toggle-desc">{t.ttsDesc}</div>
              </div>
              <div className={`toggle-switch ${ttsEnabled ? 'active' : ''}`}></div>
            </div>

            <div className="settings-toggle" onClick={() => {
              setSoundEnabled(!soundEnabled)
              localStorage.setItem('dohdoh-sound', (!soundEnabled).toString())
            }}>
              <div>
                <div className="settings-toggle-label">🔔 Sound Effects</div>
                <div className="settings-toggle-desc">{t.soundDesc}</div>
              </div>
              <div className={`toggle-switch ${soundEnabled ? 'active' : ''}`}></div>
            </div>

            <div className="settings-toggle" onClick={() => {
              setAutoScrollEnabled(!autoScrollEnabled)
              localStorage.setItem('dohdoh-autoscroll', (!autoScrollEnabled).toString())
            }}>
              <div>
                <div className="settings-toggle-label">📜 Auto Scroll</div>
                <div className="settings-toggle-desc">{t.autoscrollDesc}</div>
              </div>
              <div className={`toggle-switch ${autoScrollEnabled ? 'active' : ''}`}></div>
            </div>

            <div className="settings-toggle" onClick={() => {
              setStreamingEnabled(!streamingEnabled)
              localStorage.setItem('dohdoh-streaming', (!streamingEnabled).toString())
            }}>
              <div>
                <div className="settings-toggle-label">⚡ Streaming Mode</div>
                <div className="settings-toggle-desc">{t.streamingDesc}</div>
              </div>
              <div className={`toggle-switch ${streamingEnabled ? 'active' : ''}`}></div>
            </div>

            <div className="settings-toggle" onClick={() => {
              setShortcutsEnabled(!shortcutsEnabled)
              localStorage.setItem('dohdoh-shortcuts', (!shortcutsEnabled).toString())
            }}>
              <div>
                <div className="settings-toggle-label">⌨️ Keyboard Shortcuts</div>
                <div className="settings-toggle-desc">{t.shortcutsDesc}</div>
              </div>
              <div className={`toggle-switch ${shortcutsEnabled ? 'active' : ''}`}></div>
            </div>
          </div>

          {/* Max Tokens Setting */}
          <div className="settings-section">
            <p className="settings-label">📏 Max Response Tokens</p>
            
            {/* Auto Tokens Toggle */}
            <div className="settings-toggle" onClick={() => {
              setAutoTokens(!autoTokens)
              localStorage.setItem('dohdoh-autotokens', (!autoTokens).toString())
            }}>
              <div>
                <div className="settings-toggle-label">⚡ Auto Tokens</div>
                <div className="settings-toggle-desc">Automatically use model's max capacity</div>
              </div>
              <div className={`toggle-switch ${autoTokens ? 'active' : ''}`}></div>
            </div>
            
            {/* Manual Token Slider - only show when auto is off */}
            {!autoTokens && (
              <div style={{ 
                padding: '1rem',
                borderRadius: '14px',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                marginTop: '0.5rem',
                animation: 'fadeInUp 0.3s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Limit AI response length</span>
                  <span style={{ 
                    fontSize: '0.9rem', 
                    fontWeight: 700,
                    color: 'var(--accent-color)',
                    background: 'var(--btn-secondary)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '10px'
                  }}>
                    {maxTokens >= 1000 ? `${(maxTokens / 1000).toFixed(0)}K` : maxTokens} tokens
                  </span>
                </div>
                <input
                  type="range"
                  min="256"
                  max="200000"
                  step="256"
                  value={maxTokens}
                  onChange={(e) => {
                    const value = parseInt(e.target.value)
                    setMaxTokens(value)
                    localStorage.setItem('dohdoh-maxtokens', value.toString())
                  }}
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    background: 'var(--btn-secondary)',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  <span>256</span>
                  <span>50K</span>
                  <span>100K</span>
                  <span>200K</span>
                </div>
              </div>
            )}
            
            {/* Show effective tokens */}
            {autoTokens && (
              <div style={{ 
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                background: 'var(--btn-secondary)',
                marginTop: '0.5rem',
                fontSize: '0.85rem',
                color: 'var(--text-muted)'
              }}>
                💡 Using <strong style={{ color: 'var(--accent-color)' }}>
                  {((AI_MODELS.find(m => m.id === selectedModel)?.maxTokens || 4096) / 1024).toFixed(0)}K tokens
                </strong> for {AI_MODELS.find(m => m.id === selectedModel)?.name}
              </div>
            )}
          </div>

          {/* API Key Section */}
          <div className="settings-section">
            <p className="settings-label">🔑 {t.apiKey}</p>
            <button
              className="btn btn-secondary btn-full"
              onClick={() => requestPasswordForApiKey('view')}
              style={{ marginBottom: '0.5rem' }}
            >
              {apiKey ? '🔑 Manage API Key' : '➕ Add API Key'}
            </button>

            {showApiKeySection && (
              <div className="api-key-section">
                <div className="api-key-status">
                  <span className="api-key-status-icon">{apiKey ? '✅' : '⚠️'}</span>
                  <span className="api-key-status-text">
                    {apiKey ? 'API Key is configured' : 'No API Key configured'}
                  </span>
                </div>
                <div className="input-group">
                  <input
                    type="password"
                    className="input-field"
                    placeholder={t.apiKeyPlaceholder}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveApiKey}>
                    {t.saveApiKey}
                  </button>
                  {apiKey && (
                    <button className="btn btn-danger" onClick={removeApiKey}>
                      {t.removeApiKey}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Export Chat */}
          <div className="settings-section">
            <p className="settings-label">📤 Data</p>
            <button className="btn btn-secondary btn-full" onClick={exportChat} disabled={messages.length === 0}>
              📥 {t.exportChat}
            </button>
          </div>

          {/* User Info */}
          <div className="settings-section">
            <div className="user-card">
              <div className="user-avatar">{currentUser?.name?.charAt(0) || 'U'}</div>
              <div>
                <div className="user-info-name">{currentUser?.name}</div>
                <div className="user-info-email">{currentUser?.email}</div>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>🚪 {t.logout}</button>
          </div>
        </div>
      </div>

      {/* History Modal */}
      <div className={`modal-overlay ${showHistory ? 'open' : ''}`} onClick={(e) => e.target === e.currentTarget && setShowHistory(false)}>
        <div className="modal glass-strong">
          <div className="modal-header">
            <h3 className="modal-title">📜 {t.chatHistory}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {chatHistory.length > 0 && (
                <button className="clear-history-btn" onClick={clearAllHistory}>🗑️ {t.clearHistory}</button>
              )}
              <button className="modal-close" onClick={() => setShowHistory(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
          <div className="history-list">
            {chatHistory.length === 0 ? (
              <div className="history-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <p>{t.noChats}</p>
              </div>
            ) : (
              chatHistory.map(session => (
                <div key={session.id} className="history-item" onClick={() => loadHistorySession(session)}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="history-item-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      💬 {session.title}
                    </div>
                    <div className="history-item-meta">
                      {new Date(session.createdAt).toLocaleDateString()} • {session.messages.length} messages
                    </div>
                  </div>
                  <button
                    className="history-item-delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteHistorySession(session.id)
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Password Modal */}
      <div className={`modal-overlay ${showPasswordModal ? 'open' : ''}`} onClick={(e) => e.target === e.currentTarget && setShowPasswordModal(false)}>
        <div className="modal glass-strong" style={{ maxWidth: '350px' }}>
          <div className="modal-header">
            <h3 className="modal-title">🔐 {t.passwordRequired}</h3>
            <button className="modal-close" onClick={() => setShowPasswordModal(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {t.enterPassword}
          </p>
          <div className="input-group">
            <input
              type="password"
              className="input-field"
              placeholder="🔒 Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowPasswordModal(false)}>
              {t.cancel}
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handlePasswordSubmit}>
              {t.confirmPassword}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
