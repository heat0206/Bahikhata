import { useState, useRef, useEffect } from 'react'
import { ChatCircleDots, PaperPlaneTilt, X, Robot, User } from '@phosphor-icons/react'
import { sendChatMessage } from '../api/chatbot'

const WELCOME_MESSAGE = {
  role: 'bot',
  text: 'Hi! I\'m your PrepBoard assistant. Try saying:\n• "I applied to Google for SDE Intern"\n• "Move Amazon to Interview"\n• "Remove Meta"',
}

function ChatPanel({ onRefreshApplications }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [isOpen])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }])
    setInput('')
    setIsLoading(true)

    try {
      const response = await sendChatMessage(trimmed, pendingAction)

      // Add bot reply
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: response.reply,
          error: response.error || false,
          action: response.action || null,
        },
      ])

      // Handle pending action state
      if (response.pendingAction) {
        setPendingAction(response.pendingAction)
      } else {
        setPendingAction(null)
      }

      // Refresh applications if needed
      if (response.refreshNeeded && onRefreshApplications) {
        onRefreshApplications()
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: 'Failed to reach the server. Please check your connection and try again.',
          error: true,
        },
      ])
      setPendingAction(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Format message text — bold **text** support
  const formatText = (text) => {
    return text.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          className="chat-fab"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat assistant"
          id="chat-fab-toggle"
        >
          <ChatCircleDots size={24} weight="fill" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="chat-panel" role="complementary" aria-label="Chat assistant">
          {/* Header */}
          <div className="chat-panel-header">
            <div className="chat-panel-header-left">
              <div className="chat-panel-avatar">
                <Robot size={16} weight="bold" />
              </div>
              <div>
                <div className="chat-panel-title">PrepBoard Assistant</div>
                <div className="chat-panel-subtitle">Manage apps via chat</div>
              </div>
            </div>
            <button
              className="btn-ghost chat-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <X size={16} weight="bold" />
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-msg ${msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-bot'} ${msg.error ? 'chat-msg-error' : ''} ${msg.action ? 'chat-msg-success' : ''}`}
              >
                <div className="chat-msg-icon">
                  {msg.role === 'user'
                    ? <User size={14} weight="bold" />
                    : <Robot size={14} weight="bold" />
                  }
                </div>
                <div className="chat-msg-bubble">
                  {formatText(msg.text)}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="chat-msg chat-msg-bot">
                <div className="chat-msg-icon">
                  <Robot size={14} weight="bold" />
                </div>
                <div className="chat-msg-bubble chat-typing">
                  <span className="chat-dot" />
                  <span className="chat-dot" />
                  <span className="chat-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="chat-input-bar">
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder={pendingAction ? 'Reply yes or no…' : 'Type a message…'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              aria-label="Chat message input"
              id="chat-message-input"
            />
            <button
              className="chat-send-btn"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
              id="chat-send-btn"
            >
              <PaperPlaneTilt size={18} weight="fill" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatPanel
