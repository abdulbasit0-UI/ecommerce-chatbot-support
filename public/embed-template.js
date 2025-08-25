;(() => {
  // Get the current script tag to extract embed code
  const currentScript = document.currentScript
  const scriptSrc = currentScript.src
  const embedCode = scriptSrc.match(/\/embed\/([^.]+)\.js$/)?.[1]

  if (!embedCode) {
    console.error("ChatBot Pro: Invalid embed code")
    return
  }

  // Configuration
  const API_BASE = scriptSrc.replace(/\/embed\/[^.]+\.js$/, "")
  let chatbotConfig = null
  const sessionId = generateSessionId()
  let isOpen = false
  let isLoading = false

  // Generate unique session ID
  function generateSessionId() {
    return "session_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now()
  }

  // Simple Markdown parser for basic formatting
  function parseMarkdown(text) {
    return text
      // Bold text: **text** or __text__
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      
      // Italic text: *text* or _text_
      .replace(/\*((?!\*)(.*?))\*/g, '<em>$1</em>')
      .replace(/_((?!_)(.*?))_/g, '<em>$1</em>')
      
      // Code: `text`
      .replace(/`([^`]+)`/g, '<code style="background-color: #f3f4f6; padding: 2px 4px; border-radius: 3px; font-family: monospace; font-size: 0.9em;">$1</code>')
      
      // Convert newlines to line breaks, but handle lists specially
      .split('\n')
      .map(line => {
        // Handle bullet points
        if (line.trim().startsWith('* ')) {
          return `<li style="margin-bottom: 4px;">${line.trim().substring(2)}</li>`
        }
        // Handle numbered lists
        if (/^\d+\.\s/.test(line.trim())) {
          return `<li style="margin-bottom: 4px;">${line.trim().replace(/^\d+\.\s/, '')}</li>`
        }
        // Regular lines
        return line.trim() === '' ? '<br>' : line
      })
      .join('\n')
      
      // Wrap consecutive list items in ul tags
      .replace(/(<li[^>]*>.*?<\/li>\n?)+/g, (match) => {
        return `<ul style="margin: 8px 0; padding-left: 20px;">${match}</ul>`
      })
      
      // Convert remaining newlines to br tags
      .replace(/\n/g, '<br>')
      
      // Clean up extra br tags
      .replace(/(<br>\s*){2,}/g, '<br><br>')
  }

  // Create chatbot widget
  function createChatWidget() {
    // Widget container
    const widget = document.createElement("div")
    widget.id = "chatbot-pro-widget"
    widget.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `

    // Chat button
    const button = document.createElement("div")
    button.id = "chatbot-pro-button"
    button.style.cssText = `
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: ${chatbotConfig.primaryColor};
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    `

    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    `

    // Hover effects
    button.addEventListener("mouseenter", () => {
      button.style.transform = "scale(1.05)"
      button.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.2)"
    })

    button.addEventListener("mouseleave", () => {
      button.style.transform = "scale(1)"
      button.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)"
    })

    // Chat window
    const chatWindow = document.createElement("div")
    chatWindow.id = "chatbot-pro-window"
    chatWindow.style.cssText = `
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 380px;
      height: 520px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      display: none;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid #e5e7eb;
    `

    // Chat header
    const header = document.createElement("div")
    header.style.cssText = `
      background-color: ${chatbotConfig.primaryColor};
      color: white;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    `

    header.innerHTML = `
      <div>
        <div style="font-weight: 600; font-size: 16px;">${chatbotConfig.name}</div>
        <div style="font-size: 12px; opacity: 0.9;">Online now</div>
      </div>
      <button id="chatbot-pro-close" style="background: none; border: none; color: white; cursor: pointer; padding: 4px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `

    // Messages container
    const messagesContainer = document.createElement("div")
    messagesContainer.id = "chatbot-pro-messages"
    messagesContainer.style.cssText = `
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: #f9fafb;
    `

    // Welcome message
    const welcomeMessage = createMessage(chatbotConfig.welcomeMessage, false)
    messagesContainer.appendChild(welcomeMessage)

    // Input container
    const inputContainer = document.createElement("div")
    inputContainer.style.cssText = `
      padding: 16px;
      border-top: 1px solid #e5e7eb;
      background: white;
    `

    const inputForm = document.createElement("form")
    inputForm.style.cssText = "display: flex; gap: 8px;"

    const input = document.createElement("input")
    input.id = "chatbot-pro-input"
    input.type = "text"
    input.placeholder = "Type your message..."
    input.style.cssText = `
      flex: 1;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s ease;
    `

    // Input focus effects
    input.addEventListener("focus", () => {
      input.style.borderColor = chatbotConfig.primaryColor
    })

    input.addEventListener("blur", () => {
      input.style.borderColor = "#d1d5db"
    })

    const sendButton = document.createElement("button")
    sendButton.type = "submit"
    sendButton.style.cssText = `
      background-color: ${chatbotConfig.primaryColor};
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.2s ease;
    `
    sendButton.textContent = "Send"

    // Send button hover effect
    sendButton.addEventListener("mouseenter", () => {
      sendButton.style.opacity = "0.9"
    })

    sendButton.addEventListener("mouseleave", () => {
      sendButton.style.opacity = "1"
    })

    // Event listeners
    button.addEventListener("click", toggleChat)
    header.querySelector("#chatbot-pro-close").addEventListener("click", toggleChat)
    inputForm.addEventListener("submit", handleSendMessage)

    // Assemble widget
    inputForm.appendChild(input)
    inputForm.appendChild(sendButton)
    inputContainer.appendChild(inputForm)

    chatWindow.appendChild(header)
    chatWindow.appendChild(messagesContainer)
    chatWindow.appendChild(inputContainer)

    widget.appendChild(button)
    widget.appendChild(chatWindow)

    document.body.appendChild(widget)
  }

  function createMessage(content, isUser) {
    const messageDiv = document.createElement("div")
    messageDiv.style.cssText = `
      display: flex;
      margin-bottom: 12px;
      ${isUser ? "justify-content: flex-end;" : "justify-content: flex-start;"}
      animation: fadeIn 0.3s ease-in;
    `

    const messageBubble = document.createElement("div")
    messageBubble.style.cssText = `
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
      ${
        isUser
          ? `background-color: ${chatbotConfig.primaryColor}; color: white; border-bottom-right-radius: 4px;`
          : "background-color: white; color: #374151; border: 1px solid #e5e7eb; border-bottom-left-radius: 4px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);"
      }
    `

    // For bot messages, parse markdown; for user messages, use plain text
    if (isUser) {
      messageBubble.textContent = content
    } else {
      messageBubble.innerHTML = parseMarkdown(content)
      
      // Style lists and other elements within bot messages
      const lists = messageBubble.querySelectorAll('ul')
      lists.forEach(list => {
        list.style.marginTop = '8px'
        list.style.marginBottom = '8px'
      })

      const strongElements = messageBubble.querySelectorAll('strong')
      strongElements.forEach(strong => {
        strong.style.fontWeight = '600'
      })

      const emElements = messageBubble.querySelectorAll('em')
      emElements.forEach(em => {
        em.style.fontStyle = 'italic'
      })
    }

    messageDiv.appendChild(messageBubble)
    return messageDiv
  }

  function toggleChat() {
    const chatWindow = document.getElementById("chatbot-pro-window")
    const button = document.getElementById("chatbot-pro-button")
    
    isOpen = !isOpen
    chatWindow.style.display = isOpen ? "flex" : "none"

    // Animate button
    if (isOpen) {
      button.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `
      document.getElementById("chatbot-pro-input").focus()
    } else {
      button.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      `
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault()

    if (isLoading) return

    const input = document.getElementById("chatbot-pro-input")
    const message = input.value.trim()

    if (!message) return

    // Clear input and add user message
    input.value = ""
    const messagesContainer = document.getElementById("chatbot-pro-messages")
    messagesContainer.appendChild(createMessage(message, true))
    messagesContainer.scrollTop = messagesContainer.scrollHeight

    // Show loading indicator
    isLoading = true
    const loadingMessage = createLoadingMessage()
    messagesContainer.appendChild(loadingMessage)
    messagesContainer.scrollTop = messagesContainer.scrollHeight

    try {
      const response = await fetch(`${API_BASE}/api/chat/${embedCode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          sessionId: sessionId,
        }),
      })

      const data = await response.json()

      // Remove loading message
      messagesContainer.removeChild(loadingMessage)

      if (data.success) {
        messagesContainer.appendChild(createMessage(data.message, false))
      } else {
        messagesContainer.appendChild(createMessage("Sorry, I encountered an error. Please try again.", false))
      }
    } catch (error) {
      console.error("Chat error:", error)
      messagesContainer.removeChild(loadingMessage)
      messagesContainer.appendChild(createMessage("Sorry, I'm having trouble connecting. Please try again.", false))
    } finally {
      isLoading = false
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  }

  function createLoadingMessage() {
    const messageDiv = document.createElement("div")
    messageDiv.style.cssText = "display: flex; margin-bottom: 12px; justify-content: flex-start; animation: fadeIn 0.3s ease-in;"

    const messageBubble = document.createElement("div")
    messageBubble.style.cssText = `
      padding: 12px 16px;
      border-radius: 12px;
      background-color: white;
      border: 1px solid #e5e7eb;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    `

    messageBubble.innerHTML = `
      <div style="display: flex; gap: 4px; align-items: center;">
        <div style="width: 8px; height: 8px; background-color: #9ca3af; border-radius: 50%; animation: pulse 1.5s ease-in-out infinite;"></div>
        <div style="width: 8px; height: 8px; background-color: #9ca3af; border-radius: 50%; animation: pulse 1.5s ease-in-out infinite 0.2s;"></div>
        <div style="width: 8px; height: 8px; background-color: #9ca3af; border-radius: 50%; animation: pulse 1.5s ease-in-out infinite 0.4s;"></div>
      </div>
    `

    messageDiv.appendChild(messageBubble)
    return messageDiv
  }

  // Initialize chatbot
  async function initChatbot() {
    try {
      const response = await fetch(`${API_BASE}/api/chatbot/${embedCode}/config`)
      const config = await response.json()

      if (config.error) {
        console.error("ChatBot Pro: Failed to load configuration")
        return
      }

      chatbotConfig = config

      // Add CSS animations and styles
      const style = document.createElement("style")
      style.textContent = `
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; }
          40% { opacity: 1; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Smooth scrollbar for messages */
        #chatbot-pro-messages::-webkit-scrollbar {
          width: 6px;
        }
        
        #chatbot-pro-messages::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        #chatbot-pro-messages::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        #chatbot-pro-messages::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        /* Responsive design */
        @media (max-width: 480px) {
          #chatbot-pro-widget {
            bottom: 10px;
            right: 10px;
          }
          
          #chatbot-pro-window {
            width: calc(100vw - 20px);
            height: calc(100vh - 100px);
            bottom: 70px;
            right: -10px;
          }
        }
      `
      document.head.appendChild(style)

      createChatWidget()
    } catch (error) {
      console.error("ChatBot Pro: Initialization failed", error)
    }
  }

  // Start when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initChatbot)
  } else {
    initChatbot()
  }
})()