/**
 * Embed route — serves the LeadFlow AI chat widget as a dynamic JavaScript snippet.
 *
 * Usage: <script src="https://leadflow.ai/embed?bid=BUSINESS_ID"></script>
 *
 * The route:
 *   1. Reads `bid` (business ID) from query params
 *   2. Pre-fetches business settings from Supabase
 *   3. Returns a self-contained vanilla-JS widget with Content-Type: application/javascript
 *
 * The client-side widget:
 *   - Caches settings in localStorage (5-min TTL)
 *   - Fetches fresh settings from /api/settings on cache miss
 *   - Creates a floating chat bubble + window with dynamic branding
 *   - Sends messages to /api/chat for AI-powered lead qualification
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ---------------------------------------------------------------------------
// Default settings
// ---------------------------------------------------------------------------
const DEFAULTS = {
  chatbot_name: "LeadFlow AI",
  welcome_message: "Hi there! 👋 How can I help you today?",
  brand_color: "#3b82f6",
  logo_url: "",
  business_hours: "",
};

interface WidgetSettings {
  chatbot_name: string;
  welcome_message: string;
  brand_color: string;
  logo_url: string;
  business_hours: string;
}

// ---------------------------------------------------------------------------
// Fetch business settings (server-side, for pre-population)
// ---------------------------------------------------------------------------
async function fetchBusinessSettings(bid: string): Promise<WidgetSettings> {
  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from("businesses")
    .select("company_name, settings")
    .eq("id", bid)
    .maybeSingle();

  if (!data) return DEFAULTS;

  const s = (data.settings ?? {}) as Record<string, unknown>;
  return {
    chatbot_name: (data.company_name as string) || DEFAULTS.chatbot_name,
    welcome_message: (s.welcome_message as string) || DEFAULTS.welcome_message,
    brand_color: (s.brand_color as string) || DEFAULTS.brand_color,
    logo_url: (s.logo_url as string) || DEFAULTS.logo_url,
    business_hours: (s.business_hours as string) || DEFAULTS.business_hours,
  };
}

// ---------------------------------------------------------------------------
// Escape helpers
// ---------------------------------------------------------------------------
function jsEscape(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/<\/script>/gi, "<\\/script>");
}

// ---------------------------------------------------------------------------
// Widget CSS (static, uses CSS custom properties for dynamic values)
// ---------------------------------------------------------------------------
function widgetCSS(): string {
  return `
/* LeadFlow AI Chat Widget — scoped under #lf-chat-widget */
#lf-chat-widget *, #lf-chat-widget *::before, #lf-chat-widget *::after {
  box-sizing:border-box; margin:0; padding:0;
}
#lf-chat-widget {
  --lf-brand: #3b82f6;
  --lf-brand-rgb: 59, 130, 246;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  font-size:14px; line-height:1.5;
}

/* Bubble */
#lf-chat-bubble {
  position:fixed; bottom:20px; right:20px; z-index:99990;
  width:56px; height:56px; border-radius:50%;
  background:var(--lf-brand); color:#fff; border:none; cursor:pointer;
  box-shadow:0 4px 16px rgba(0,0,0,0.18);
  display:flex; align-items:center; justify-content:center;
  transition:transform 0.2s, box-shadow 0.2s;
}
#lf-chat-bubble:hover { transform:scale(1.08); box-shadow:0 6px 24px rgba(0,0,0,0.24); }
#lf-chat-bubble.lf-hidden { display:none; }
#lf-chat-bubble svg { width:26px; height:26px; fill:none; stroke:#fff; stroke-width:2; stroke-linecap:round; }

/* Window */
#lf-chat-window {
  position:fixed; bottom:88px; right:20px; z-index:99991;
  width:380px; height:520px; max-height:calc(100vh - 120px);
  display:flex; flex-direction:column; border-radius:16px;
  overflow:hidden; background:#fff; color:#1a1a2e;
  box-shadow:0 12px 48px rgba(0,0,0,0.18); border:1px solid #e5e7eb;
}
#lf-chat-window.lf-hidden { display:none; }

/* Header */
#lf-chat-header {
  flex-shrink:0; padding:14px 16px; background:var(--lf-brand); color:#fff;
  display:flex; align-items:center; gap:10px;
}
#lf-chat-header-logo {
  width:36px; height:36px; border-radius:50%; object-fit:cover;
  background:rgba(255,255,255,0.2); flex-shrink:0; display:none;
}
#lf-chat-header-logo.lf-visible { display:block; }
#lf-chat-header-info { flex:1; min-width:0; }
#lf-chat-header-name { font-weight:600; font-size:15px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
#lf-chat-header-hours { font-size:11px; opacity:0.8; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
#lf-chat-header-hours:empty { display:none; }
#lf-chat-close {
  background:none; border:none; color:#fff; cursor:pointer; padding:4px;
  display:flex; align-items:center; justify-content:center; border-radius:6px;
  flex-shrink:0; transition:background 0.15s;
}
#lf-chat-close:hover { background:rgba(255,255,255,0.18); }
#lf-chat-close svg { width:18px; height:18px; }

/* Messages */
#lf-chat-messages {
  flex:1; overflow-y:auto; padding:16px;
  display:flex; flex-direction:column; gap:10px;
  background:#f9fafb; scroll-behavior:smooth;
}
.lf-msg { max-width:85%; padding:10px 14px; border-radius:14px; word-break:break-word; font-size:14px; }
.lf-msg-bot {
  align-self:flex-start; background:#e5e7eb; color:#1a1a2e;
  border-bottom-left-radius:4px;
}
.lf-msg-user {
  align-self:flex-end; background:var(--lf-brand); color:#fff;
  border-bottom-right-radius:4px;
}

/* Typing */
#lf-typing-indicator {
  align-self:flex-start; padding:12px 14px; background:#e5e7eb;
  border-radius:14px; border-bottom-left-radius:4px;
  display:none; gap:4px; align-items:center;
}
#lf-typing-indicator.lf-visible { display:flex; }
#lf-typing-indicator span {
  width:7px; height:7px; border-radius:50%; background:#9ca3af;
  animation:lf-typing 1.4s infinite ease-in-out both;
}
#lf-typing-indicator span:nth-child(1) { animation-delay:0s; }
#lf-typing-indicator span:nth-child(2) { animation-delay:0.2s; }
#lf-typing-indicator span:nth-child(3) { animation-delay:0.4s; }
@keyframes lf-typing {
  0%, 80%, 100% { transform:scale(0.6); opacity:0.4; }
  40% { transform:scale(1); opacity:1; }
}

/* Input */
#lf-chat-input-area {
  flex-shrink:0; padding:10px 14px; border-top:1px solid #e5e7eb;
  display:flex; gap:8px; background:#fff;
}
#lf-chat-input {
  flex:1; border:1px solid #d1d5db; border-radius:10px; padding:10px 12px;
  font-size:14px; font-family:inherit; outline:none; resize:none;
  transition:border-color 0.15s; background:#fff; color:#1a1a2e;
}
#lf-chat-input:focus { border-color:var(--lf-brand); }
#lf-chat-send {
  width:40px; height:40px; border:none; border-radius:10px;
  background:var(--lf-brand); color:#fff; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  flex-shrink:0; transition:opacity 0.15s;
}
#lf-chat-send:hover { opacity:0.9; }
#lf-chat-send:disabled { opacity:0.5; cursor:default; }
#lf-chat-send svg { width:18px; height:18px; }

/* Legal footer */
#lf-chat-legal {
  flex-shrink:0; padding:6px 14px;
  text-align:center; font-size:10px; color:#9ca3af;
  border-top:1px solid #f3f4f6; background:#fff;
}
#lf-chat-legal a {
  color:#9ca3af; text-decoration:none; transition:color 0.15s;
}
#lf-chat-legal a:hover { color:#6b7280; }
#lf-chat-legal span { margin:0 3px; }

/* Mobile */
@media (max-width:480px) {
  #lf-chat-window { width:100%; height:100%; max-height:100vh; bottom:0; right:0; border-radius:0; }
  #lf-chat-bubble { bottom:16px; right:16px; }
}

/* Dark mode */
@media (prefers-color-scheme:dark) {
  #lf-chat-window { background:#1e1e2e; border-color:#2d2d3f; color:#e5e7eb; }
  #lf-chat-messages { background:#16162a; }
  .lf-msg-bot { background:#2d2d3f; color:#e5e7eb; }
  #lf-chat-input-area { background:#1e1e2e; border-color:#2d2d3f; }
  #lf-chat-input { background:#2d2d3f; border-color:#3d3d5c; color:#e5e7eb; }
  #lf-typing-indicator { background:#2d2d3f; }
  #lf-chat-legal { background:#1e1e2e; border-color:#2d2d3f; }
}
`.trim();
}

// ---------------------------------------------------------------------------
// Widget JavaScript (vanilla, self-contained IIFE)
// ---------------------------------------------------------------------------
function widgetJS(bid: string, preSettings: WidgetSettings): string {
  // Escape injected values
  const e = jsEscape;

  return `
(function() {
  'use strict';
  if (document.getElementById('lf-chat-widget')) return;

  // -----------------------------------------------------------------------
  // Config
  // -----------------------------------------------------------------------
  var BUSINESS_ID = '${e(bid)}';
  var SETTINGS_URL = '/api/settings' + (BUSINESS_ID ? '?bid=' + encodeURIComponent(BUSINESS_ID) : '');
  var CHAT_URL = '/api/chat';
  var CACHE_KEY = 'leadflow_settings';
  var CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  var FETCH_TIMEOUT = 5000; // 5 seconds

  // Pre-populated settings from server (used until cache/API resolves)
  var settings = {
    chatbot_name: '${e(preSettings.chatbot_name)}',
    welcome_message: '${e(preSettings.welcome_message)}',
    brand_color: '${e(preSettings.brand_color)}',
    logo_url: '${e(preSettings.logo_url)}',
    business_hours: '${e(preSettings.business_hours)}'
  };

  // -----------------------------------------------------------------------
  // Visitor ID
  // -----------------------------------------------------------------------
  var VISITOR_ID = (function() {
    var key = 'lf_visitor_id';
    try {
      var stored = localStorage.getItem(key);
      if (stored) return stored;
    } catch(_) {}
    var id = 'vis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    try { localStorage.setItem(key, id); } catch(_) {}
    return id;
  })();

  // -----------------------------------------------------------------------
  // State
  // -----------------------------------------------------------------------
  var isOpen = false;
  var isWaiting = false;
  var conversation = [];
  var dom = {};

  // -----------------------------------------------------------------------
  // SVG icons (inline — zero external deps)
  // -----------------------------------------------------------------------
  var ICON_CHAT = '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>';
  var ICON_CLOSE = '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';

  // -----------------------------------------------------------------------
  // DOM helper
  // -----------------------------------------------------------------------
  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (k === 'className') { e.className = attrs[k]; }
        else if (k === 'innerHTML') { e.innerHTML = attrs[k]; }
        else if (k.slice(0,2) === 'on') { e.addEventListener(k.slice(2).toLowerCase(), attrs[k]); }
        else { e.setAttribute(k, attrs[k]); }
      }
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach(function(c) {
        if (typeof c === 'string') { e.appendChild(document.createTextNode(c)); }
        else { e.appendChild(c); }
      });
    }
    return e;
  }

  // -----------------------------------------------------------------------
  // Apply settings to UI
  // -----------------------------------------------------------------------
  function applySettings(s) {
    settings = s;
    var root = document.getElementById('lf-chat-widget');
    if (root) {
      root.style.setProperty('--lf-brand', s.brand_color);
    }
    // Update header text
    var nameEl = document.getElementById('lf-chat-header-name');
    if (nameEl) nameEl.textContent = s.chatbot_name;
    var hoursEl = document.getElementById('lf-chat-header-hours');
    if (hoursEl) hoursEl.textContent = s.business_hours || '';
    // Update logo
    var logoEl = document.getElementById('lf-chat-header-logo');
    if (logoEl) {
      if (s.logo_url) {
        logoEl.src = s.logo_url;
        logoEl.classList.add('lf-visible');
      } else {
        logoEl.classList.remove('lf-visible');
      }
    }
    // If conversation hasn't started yet, set the welcome message
    if (conversation.length === 0) {
      conversation.push({
        role: 'assistant',
        content: s.welcome_message,
        timestamp: new Date().toISOString()
      });
      if (isOpen) renderMessages();
    }
  }

  // -----------------------------------------------------------------------
  // Settings cache & fetch
  // -----------------------------------------------------------------------
  function loadCachedSettings() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var cached = JSON.parse(raw);
      if (!cached || !cached.data || !cached.timestamp) return null;
      if (Date.now() - cached.timestamp > CACHE_TTL) return null; // stale
      return cached.data;
    } catch(_) {
      return null;
    }
  }

  function saveCachedSettings(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: data,
        timestamp: Date.now()
      }));
    } catch(_) {}
  }

  function fetchSettings() {
    // 1. Try cache first
    var cached = loadCachedSettings();
    if (cached) {
      applySettings(cached);
      return;
    }

    // 2. Fetch from API with timeout
    if (!BUSINESS_ID) {
      applySettings(settings); // use pre-populated defaults
      return;
    }

    var controller = new AbortController();
    var timeoutId = setTimeout(function() { controller.abort(); }, FETCH_TIMEOUT);

    fetch(SETTINGS_URL, { signal: controller.signal })
      .then(function(r) {
        clearTimeout(timeoutId);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function(data) {
        saveCachedSettings(data);
        applySettings(data);
      })
      .catch(function() {
        // Fall back to pre-populated defaults silently
        applySettings(settings);
      });
  }

  // -----------------------------------------------------------------------
  // Build the DOM
  // -----------------------------------------------------------------------
  function buildWidget() {
    var container = el('div', { id: 'lf-chat-widget' });

    // Bubble button
    var bubble = el('button', {
      id: 'lf-chat-bubble',
      innerHTML: ICON_CHAT,
      onClick: openChat,
      'aria-label': 'Open chat'
    });

    // Chat window
    var win = el('div', { id: 'lf-chat-window', className: 'lf-hidden' });

    // Header
    var header = el('div', { id: 'lf-chat-header' }, [
      el('img', { id: 'lf-chat-header-logo', src: '', alt: '' }),
      el('div', { id: 'lf-chat-header-info' }, [
        el('div', { id: 'lf-chat-header-name' }, settings.chatbot_name),
        el('div', { id: 'lf-chat-header-hours' }, settings.business_hours || '')
      ]),
      el('button', {
        id: 'lf-chat-close',
        innerHTML: ICON_CLOSE,
        onClick: closeChat,
        'aria-label': 'Close chat'
      })
    ]);

    // Messages
    var messages = el('div', { id: 'lf-chat-messages' });
    var typing = el('div', { id: 'lf-typing-indicator' }, [
      el('span'), el('span'), el('span')
    ]);
    messages.appendChild(typing);

    // Input
    var inputArea = el('div', { id: 'lf-chat-input-area' }, [
      el('input', {
        id: 'lf-chat-input',
        type: 'text',
        placeholder: 'Type your message...',
        onKeydown: function(ev) {
          if (ev.key === 'Enter' && !ev.shiftKey) {
            ev.preventDefault();
            sendMessage();
          }
        }
      }),
      el('button', {
        id: 'lf-chat-send',
        innerHTML: ICON_SEND,
        onClick: sendMessage,
        'aria-label': 'Send message'
      })
    ]);

    // Legal footer
    var origin = window.location.origin || 'https://leadflow.ai';
    var legalFooter = el('div', { id: 'lf-chat-legal', innerHTML:
      '<a href=\"' + origin + '/legal/privacy\" target=\"_blank\" rel=\"noopener\">Privacy</a>' +
      '<span>·</span>' +
      '<a href=\"' + origin + '/legal/terms\" target=\"_blank\" rel=\"noopener\">Terms</a>'
    });

    win.appendChild(header);
    win.appendChild(messages);
    win.appendChild(inputArea);
    win.appendChild(legalFooter);
    container.appendChild(bubble);
    container.appendChild(win);

    dom = { container: container, bubble: bubble, window: win, messages: messages, typing: typing };
    document.body.appendChild(container);
  }

  // -----------------------------------------------------------------------
  // Chat operations
  // -----------------------------------------------------------------------
  function openChat() {
    isOpen = true;
    dom.bubble.classList.add('lf-hidden');
    dom.window.classList.remove('lf-hidden');
    var input = document.getElementById('lf-chat-input');
    if (input) setTimeout(function() { input.focus(); }, 100);

    // Show welcome if it hasn't been set yet
    if (conversation.length === 0 && settings.welcome_message) {
      conversation.push({
        role: 'assistant',
        content: settings.welcome_message,
        timestamp: new Date().toISOString()
      });
    }
    renderMessages();
  }

  function closeChat() {
    isOpen = false;
    dom.window.classList.add('lf-hidden');
    dom.bubble.classList.remove('lf-hidden');
  }

  function sendMessage() {
    if (isWaiting) return;
    var input = document.getElementById('lf-chat-input');
    if (!input) return;
    var text = input.value.trim();
    if (!text) return;
    input.value = '';

    var userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
    conversation.push(userMsg);
    renderMessages();
    scrollToBottom();

    isWaiting = true;
    showTyping(true);
    var sendBtn = document.getElementById('lf-chat-send');
    if (sendBtn) sendBtn.disabled = true;

    callChatAPI(conversation.map(function(m) {
      return { role: m.role, content: m.content, timestamp: m.timestamp };
    }))
      .then(function(res) {
        showTyping(false);
        isWaiting = false;
        if (sendBtn) sendBtn.disabled = false;
        var reply = (res && res.reply) ? res.reply : "I'm sorry, I'm having trouble responding. Please try again.";
        conversation.push({ role: 'assistant', content: reply, timestamp: new Date().toISOString() });
        renderMessages();
        scrollToBottom();
        var inp = document.getElementById('lf-chat-input');
        if (inp) inp.focus();
      })
      .catch(function() {
        showTyping(false);
        isWaiting = false;
        if (sendBtn) sendBtn.disabled = false;
        conversation.push({
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: new Date().toISOString()
        });
        renderMessages();
        scrollToBottom();
      });
  }

  function callChatAPI(messages) {
    return fetch(CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages,
        visitor_id: VISITOR_ID,
        business_id: BUSINESS_ID || undefined
      })
    }).then(function(r) {
      if (!r.ok) throw new Error('API error ' + r.status);
      return r.json();
    });
  }

  function showTyping(show) {
    if (show) {
      dom.typing.classList.add('lf-visible');
    } else {
      dom.typing.classList.remove('lf-visible');
    }
    scrollToBottom();
  }

  function renderMessages() {
    var children = dom.messages.children;
    for (var i = children.length - 1; i >= 0; i--) {
      if (children[i] !== dom.typing) {
        dom.messages.removeChild(children[i]);
      }
    }
    conversation.forEach(function(msg) {
      var bubble = el('div', {
        className: 'lf-msg ' + (msg.role === 'user' ? 'lf-msg-user' : 'lf-msg-bot')
      }, msg.content);
      dom.messages.insertBefore(bubble, dom.typing);
    });
  }

  function scrollToBottom() {
    requestAnimationFrame(function() {
      dom.messages.scrollTop = dom.messages.scrollHeight;
    });
  }

  // -----------------------------------------------------------------------
  // Initialize
  // -----------------------------------------------------------------------
  buildWidget();
  fetchSettings();
})();
`.trim();
}

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const bid = searchParams.get("bid") ?? "";

  // Pre-fetch settings from DB so the widget has immediate values
  let preSettings: WidgetSettings;
  if (bid) {
    try {
      preSettings = await fetchBusinessSettings(bid);
    } catch {
      preSettings = DEFAULTS;
    }
  } else {
    preSettings = DEFAULTS;
  }

  // Build the script: inject CSS first, then the widget JS
  const script = [
    "(function(){",
    "var style=document.createElement('style');",
    "style.textContent=" + JSON.stringify(widgetCSS()) + ";",
    "document.head.appendChild(style);",
    "})();",
    widgetJS(bid, preSettings),
  ].join("\n");

  return new NextResponse(script, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
