/**
 * Embed route — serves the LeadFlow AI chat widget as a dynamic JavaScript snippet.
 *
 * Usage: <script src="https://leadflow.ai/embed?bid=BUSINESS_ID"></script>
 *
 * The route:
 *   1. Reads `bid` (business ID) from query params
 *   2. Fetches business settings from Supabase (brand color, greeting, name)
 *   3. Returns a self-contained vanilla-JS widget with Content-Type: application/javascript
 *
 * The widget is fully self-contained — no external CSS or JS dependencies.
 * It creates a floating chat bubble, opens a chat window, communicates with
 * /api/chat, and handles dark mode + mobile responsiveness.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Escape a string for safe interpolation into a JS string literal. */
function jsEscape(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n");
}

/** Fetch business settings from Supabase. Returns defaults if not found. */
async function getBusinessSettings(businessId: string) {
  const adminClient = createAdminClient();

  const { data } = await adminClient
    .from("businesses")
    .select("company_name, settings")
    .eq("id", businessId)
    .maybeSingle();

  const settings = (data?.settings ?? {}) as Record<string, unknown>;

  return {
    chatbotName: (settings.welcome_message as string) || (data?.company_name as string) || "LeadFlow AI",
    brandColor: (settings.brand_color as string) || "#6366f1",
    greeting:
      (settings.chatbot_greeting as string) ||
      "Hi there! 👋 I'm here to help. What brings you to our site today?",
  };
}

// ---------------------------------------------------------------------------
// Widget CSS (injected as a <style> tag by the widget JS)
// ---------------------------------------------------------------------------
function widgetCSS(brandColor: string): string {
  return `
/* LeadFlow AI Chat Widget — all styles are scoped under #lf-chat-widget */
#lf-chat-widget *,
#lf-chat-widget *::before,
#lf-chat-widget *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ---- Bubble ---- */
#lf-chat-bubble {
  position: fixed; bottom: 24px; right: 24px; z-index: 99990;
  width: 56px; height: 56px; border-radius: 50%;
  background: ${brandColor}; color: #fff; border: none; cursor: pointer;
  box-shadow: 0 4px 16px rgba(0,0,0,0.18); display: flex; align-items: center;
  justify-content: center; transition: transform 0.2s, box-shadow 0.2s;
}
#lf-chat-bubble:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(0,0,0,0.24); }
#lf-chat-bubble svg { width: 26px; height: 26px; fill: none; stroke: #fff; stroke-width: 2; stroke-linecap: round; }
#lf-chat-bubble.lf-hidden { display: none; }

/* ---- Window ---- */
#lf-chat-window {
  position: fixed; bottom: 92px; right: 24px; z-index: 99991;
  width: 380px; height: 520px; max-height: calc(100vh - 120px);
  display: flex; flex-direction: column; border-radius: 16px;
  overflow: hidden; background: #fff; color: #1a1a2e;
  box-shadow: 0 12px 48px rgba(0,0,0,0.18); border: 1px solid #e5e7eb;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px; line-height: 1.5;
}
#lf-chat-window.lf-hidden { display: none; }

/* ---- Header ---- */
#lf-chat-header {
  flex-shrink: 0; padding: 14px 18px; background: ${brandColor}; color: #fff;
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
}
#lf-chat-header .lf-header-name { font-weight: 600; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#lf-chat-header .lf-header-status { font-size: 12px; opacity: 0.85; }
#lf-chat-close {
  background: none; border: none; color: #fff; cursor: pointer; padding: 4px;
  display: flex; align-items: center; justify-content: center; border-radius: 6px;
  transition: background 0.15s; flex-shrink: 0;
}
#lf-chat-close:hover { background: rgba(255,255,255,0.18); }
#lf-chat-close svg { width: 18px; height: 18px; }

/* ---- Messages ---- */
#lf-chat-messages {
  flex: 1; overflow-y: auto; padding: 16px;
  display: flex; flex-direction: column; gap: 10px;
  background: #f9fafb;
  scroll-behavior: smooth;
}
.lf-msg { max-width: 85%; padding: 10px 14px; border-radius: 14px; word-break: break-word; }
.lf-msg-bot {
  align-self: flex-start; background: #e5e7eb; color: #1a1a2e;
  border-bottom-left-radius: 4px;
}
.lf-msg-user {
  align-self: flex-end; background: ${brandColor}; color: #fff;
  border-bottom-right-radius: 4px;
}

/* ---- Typing ---- */
#lf-typing-indicator {
  align-self: flex-start; padding: 12px 14px; background: #e5e7eb;
  border-radius: 14px; border-bottom-left-radius: 4px;
  display: none; gap: 4px; align-items: center;
}
#lf-typing-indicator.lf-visible { display: flex; }
#lf-typing-indicator span {
  width: 7px; height: 7px; border-radius: 50%; background: #9ca3af;
  animation: lf-typing 1.4s infinite ease-in-out both;
}
#lf-typing-indicator span:nth-child(1) { animation-delay: 0s; }
#lf-typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
#lf-typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
@keyframes lf-typing {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* ---- Input ---- */
#lf-chat-input-area {
  flex-shrink: 0; padding: 10px 14px; border-top: 1px solid #e5e7eb;
  display: flex; gap: 8px; background: #fff;
}
#lf-chat-input {
  flex: 1; border: 1px solid #d1d5db; border-radius: 10px; padding: 10px 12px;
  font-size: 14px; font-family: inherit; outline: none; resize: none;
  transition: border-color 0.15s; background: #fff; color: #1a1a2e;
}
#lf-chat-input:focus { border-color: ${brandColor}; }
#lf-chat-send {
  width: 40px; height: 40px; border: none; border-radius: 10px;
  background: ${brandColor}; color: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: opacity 0.15s;
}
#lf-chat-send:hover { opacity: 0.9; }
#lf-chat-send:disabled { opacity: 0.5; cursor: default; }
#lf-chat-send svg { width: 18px; height: 18px; }

/* ---- Mobile ---- */
@media (max-width: 480px) {
  #lf-chat-window { width: 100%; height: 100%; max-height: 100vh; bottom: 0; right: 0; border-radius: 0; }
  #lf-chat-bubble { bottom: 16px; right: 16px; }
}

/* ---- Dark mode ---- */
@media (prefers-color-scheme: dark) {
  html:not(.light) #lf-chat-window,
  html.dark #lf-chat-window { background: #1e1e2e; border-color: #2d2d3f; color: #e5e7eb; }
  html:not(.light) #lf-chat-messages,
  html.dark #lf-chat-messages { background: #16162a; }
  html:not(.light) .lf-msg-bot,
  html.dark .lf-msg-bot { background: #2d2d3f; color: #e5e7eb; }
  html:not(.light) #lf-chat-input-area,
  html.dark #lf-chat-input-area { background: #1e1e2e; border-color: #2d2d3f; }
  html:not(.light) #lf-chat-input,
  html.dark #lf-chat-input { background: #2d2d3f; border-color: #3d3d5c; color: #e5e7eb; }
  html:not(.light) #lf-typing-indicator,
  html.dark #lf-typing-indicator { background: #2d2d3f; }
}
`.trim();
}

// ---------------------------------------------------------------------------
// Widget JavaScript (vanilla, self-contained)
// ---------------------------------------------------------------------------
function widgetJS(
  businessId: string,
  chatbotName: string,
  greeting: string,
): string {
  const nameEscaped = jsEscape(chatbotName);
  const greetingEscaped = jsEscape(greeting);

  // The JS uses IIFE to keep everything private
  return `
(function() {
  'use strict';

  // Bail out if already loaded on this page
  if (document.getElementById('lf-chat-widget')) return;

  // -----------------------------------------------------------------------
  // Configuration (injected by server)
  // -----------------------------------------------------------------------
  var BUSINESS_ID = '${businessId}';
  var CHATBOT_NAME = '${nameEscaped}';
  var GREETING = '${greetingEscaped}';
  var API_URL = '/api/chat';

  // -----------------------------------------------------------------------
  // Visitor ID — persist in localStorage
  // -----------------------------------------------------------------------
  var VISITOR_ID = (function() {
    var key = 'lf_visitor_id';
    var stored = null;
    try { stored = localStorage.getItem(key); } catch(e) {}
    if (stored) return stored;
    var id = 'vis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    try { localStorage.setItem(key, id); } catch(e) {}
    return id;
  })();

  // -----------------------------------------------------------------------
  // State
  // -----------------------------------------------------------------------
  var isOpen = false;
  var isWaiting = false;
  var conversation = [];

  // -----------------------------------------------------------------------
  // SVG icons (inline for zero external deps)
  // -----------------------------------------------------------------------
  var ICON_CHAT = '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>';
  var ICON_CLOSE = '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';

  // -----------------------------------------------------------------------
  // DOM helpers
  // -----------------------------------------------------------------------
  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (k === 'className') { e.className = attrs[k]; }
        else if (k === 'innerHTML') { e.innerHTML = attrs[k]; }
        else if (k === 'style') { Object.assign(e.style, attrs[k]); }
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
    var windowEl = el('div', { id: 'lf-chat-window', className: 'lf-hidden' });

    // Header
    var header = el('div', { id: 'lf-chat-header' }, [
      el('div', {}, [
        el('div', { className: 'lf-header-name' }, CHATBOT_NAME),
        el('div', { className: 'lf-header-status' }, 'Typically replies instantly')
      ]),
      el('button', {
        id: 'lf-chat-close',
        innerHTML: ICON_CLOSE,
        onClick: closeChat,
        'aria-label': 'Close chat'
      })
    ]);

    // Messages area
    var messages = el('div', { id: 'lf-chat-messages' });

    // Typing indicator
    var typing = el('div', { id: 'lf-typing-indicator' }, [
      el('span'), el('span'), el('span')
    ]);

    messages.appendChild(typing);

    // Input area
    var inputArea = el('div', { id: 'lf-chat-input-area' }, [
      el('input', {
        id: 'lf-chat-input',
        type: 'text',
        placeholder: 'Type your message...',
        onKeydown: function(e) {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
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

    windowEl.appendChild(header);
    windowEl.appendChild(messages);
    windowEl.appendChild(inputArea);

    container.appendChild(bubble);
    container.appendChild(windowEl);

    return { container: container, bubble: bubble, window: windowEl, messages: messages, typing: typing };
  }

  var dom = buildWidget();
  document.body.appendChild(dom.container);

  // -----------------------------------------------------------------------
  // Chat logic
  // -----------------------------------------------------------------------
  function openChat() {
    isOpen = true;
    dom.bubble.classList.add('lf-hidden');
    dom.window.classList.remove('lf-hidden');
    var input = document.getElementById('lf-chat-input');
    if (input) { setTimeout(function() { input.focus(); }, 100); }

    // Show greeting on first open
    if (conversation.length === 0) {
      conversation.push({
        role: 'assistant',
        content: GREETING,
        timestamp: new Date().toISOString()
      });
      renderMessages();
    }
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

    // Add user message
    var userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
    conversation.push(userMsg);
    renderMessages();
    scrollToBottom();

    // Show typing
    isWaiting = true;
    showTyping(true);
    var sendBtn = document.getElementById('lf-chat-send');
    if (sendBtn) sendBtn.disabled = true;

    // Call API
    callChatAPI(conversation.map(function(m) { return { role: m.role, content: m.content, timestamp: m.timestamp }; }))
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
      .catch(function(err) {
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
    return fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages,
        visitor_id: VISITOR_ID,
        business_id: BUSINESS_ID
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
    // Remove all message bubbles (keep the typing indicator)
    var children = dom.messages.children;
    for (var i = children.length - 1; i >= 0; i--) {
      if (children[i] !== dom.typing) {
        dom.messages.removeChild(children[i]);
      }
    }
    // Rebuild message elements before typing indicator
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
})();
`.trim();
}

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const businessId = searchParams.get("bid");

  if (!businessId) {
    return new NextResponse(
      'console.error("LeadFlow AI: Missing bid parameter. Usage: /embed?bid=YOUR_BUSINESS_ID");',
      {
        status: 400,
        headers: { "Content-Type": "application/javascript" },
      },
    );
  }

  let settings: { chatbotName: string; brandColor: string; greeting: string };

  try {
    settings = await getBusinessSettings(businessId);
  } catch (error) {
    console.error("Embed route: failed to fetch business settings:", error);
    // Fall back to defaults
    settings = {
      chatbotName: "LeadFlow AI",
      brandColor: "#6366f1",
      greeting:
        "Hi there! 👋 I'm here to help. What brings you to our site today?",
    };
  }

  // Build response: CSS + JS as a single self-contained script
  const script = [
    "(function(){",
    "// LeadFlow AI Chat Widget",
    "// Inject styles",
    "var style=document.createElement('style');",
    "style.textContent=" + JSON.stringify(widgetCSS(settings.brandColor)) + ";",
    "document.head.appendChild(style);",
    "})();",
    widgetJS(businessId, settings.chatbotName, settings.greeting),
  ].join("\n");

  return new NextResponse(script, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
