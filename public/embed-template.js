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
      width: 350px;
      height: 500px;
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
    `

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
    `
    sendButton.textContent = "Send"

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
    `

    const messageBubble = document.createElement("div")
    messageBubble.style.cssText = `
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.4;
      ${
        isUser
          ? `background-color: ${chatbotConfig.primaryColor}; color: white; border-bottom-right-radius: 4px;`
          : "background-color: white; color: #374151; border: 1px solid #e5e7eb; border-bottom-left-radius: 4px;"
      }
    `
    messageBubble.textContent = content

    messageDiv.appendChild(messageBubble)
    return messageDiv
  }

  function toggleChat() {
    const chatWindow = document.getElementById("chatbot-pro-window")
    isOpen = !isOpen
    chatWindow.style.display = isOpen ? "flex" : "none"

    if (isOpen) {
      document.getElementById("chatbot-pro-input").focus()
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
    messageDiv.style.cssText = "display: flex; margin-bottom: 12px; justify-content: flex-start;"

    const messageBubble = document.createElement("div")
    messageBubble.style.cssText = `
      padding: 10px 14px;
      border-radius: 12px;
      background-color: white;
      border: 1px solid #e5e7eb;
      border-bottom-left-radius: 4px;
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

      // Add CSS animations
      const style = document.createElement("style")
      style.textContent = `
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; }
          40% { opacity: 1; }
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
