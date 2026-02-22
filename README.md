# 🤖 Doh Doh Ai

A modern AI chat application built with Next.js 15, featuring multiple AI models, beautiful themes, and smooth animations.

![Doh Doh Ai](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## ✨ Features

- 🔮 **26 AI Models** - Llama 3.3 70B, DeepSeek R1, Qwen3 Coder, and more
- 🎨 **5 Beautiful Themes** - Light, Dark, Pink, Ocean, Forest
- 🌐 **Multi-language** - English & Myanmar (မြန်မာ)
- ⚡ **Streaming Responses** - Real-time typewriter effect
- 📜 **Ultra Smooth Auto-Scroll** - requestAnimationFrame animation
- 🔐 **Secure Settings** - Password-protected API key management
- 💾 **Chat History** - Local storage persistence
- 🎯 **Keyboard Shortcuts** - Ctrl+N, Ctrl+H, Ctrl+,
- 🔊 **Sound Effects & TTS** - Audio feedback
- 📱 **Responsive Design** - Works on all devices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/dohdoh-ai.git
cd dohdoh-ai

# Install dependencies
bun install
# or
npm install

# Start development server
bun run dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Login Credentials

| Email | Password |
|-------|----------|
| user1@dohdoh.ai | user123 |
| user2@dohdoh.ai | user123 |
| admin@dohdoh.ai | admin123 |

**Settings Password:** `dohdoh2024`

## 📦 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/dohdoh-ai)

1. Push to GitHub
2. Import to Vercel
3. Deploy automatically

Or use CLI:
```bash
npm i -g vercel
vercel
```

### Other Platforms

<details>
<summary>Docker</summary>

```bash
# Build
docker build -t dohdoh-ai .

# Run
docker run -p 3000:3000 dohdoh-ai
```
</details>

<details>
<summary>Netlify</summary>

```bash
npm i -g netlify-cli
bun run build
netlify deploy --prod
```
</details>

<details>
<summary>Railway</summary>

```bash
npm i -g @railway/cli
railway login
railship up
```
</details>

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI, shadcn/ui
- **AI SDK:** z-ai-web-dev-sdk
- **Animations:** Framer Motion, CSS Animations

## 📁 Project Structure

```
dohdoh-ai/
├── src/
│   ├── app/
│   │   ├── api/route.ts    # API endpoint
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Main chat UI
│   │   └── globals.css     # Global styles
│   ├── components/ui/      # UI components
│   └── hooks/              # Custom hooks
├── public/                 # Static assets
├── vercel.json            # Vercel config
├── next.config.ts         # Next.js config
└── package.json           # Dependencies
```

## 🎨 Available AI Models

| Model | Tokens | Best For |
|-------|--------|----------|
| Llama 3.3 70B | 128K | General chat |
| DeepSeek R1 | 64K | Reasoning |
| Qwen3 Coder 480B | 32K | Coding |
| Gemma 3 27B | 8K | Fast responses |
| Mistral Small 3.1 | 32K | Balanced |

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + N` | New Chat |
| `Ctrl/Cmd + H` | History |
| `Ctrl/Cmd + ,` | Settings |
| `Escape` | Close Modals |
| `Enter` | Send Message |
| `Shift + Enter` | New Line |

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🙏 Acknowledgments

- Next.js team
- Vercel
- Radix UI
- Tailwind CSS
- z-ai-web-dev-sdk

---

Made with ❤️ by Doh Doh Ai Team
