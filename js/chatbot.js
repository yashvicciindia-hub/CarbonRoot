/* =========================================================
   CARBONROOT AI ASSISTANT
   Persistent Professional Chatbot
   ========================================================= */

class CarbonRootChatbot {

  constructor(options = {}) {

    this.apiUrl =
      options.apiUrl ||
      window.CARBONROOT_CHAT_API_URL ||
      "https://carbonroot.onrender.com";

    this.botName =
      options.botName ||
      "CarbonRoot AI";

    this.storageKey =
      "carbonroot_chat_history";

    this.openKey =
      "carbonroot_chat_open";

    this.messages = [];

    this.isOpen = false;

    this.isLoading = false;

    this.init();
  }


  /* =========================================================
     INITIALIZATION
     ========================================================= */

  init() {

    this.loadHistory();

    this.createWidget();

    this.attachEvents();

    if (this.messages.length === 0) {

      this.addWelcomeMessage();

    } else {

      this.renderStoredMessages();
    }

    /*
     * Restore whether chatbot was open.
     */

    const wasOpen =
      localStorage.getItem(
        this.openKey
      ) === "true";

    if (wasOpen) {

      setTimeout(() => {
        this.openChat();
      }, 100);
    }
  }


  /* =========================================================
     CREATE CHATBOT UI
     ========================================================= */

  createWidget() {

    const existing =
      document.getElementById(
        "carbonroot-chatbot"
      );

    if (existing) {
      existing.remove();
    }


    const container =
      document.createElement("div");

    container.id =
      "carbonroot-chatbot";


    container.innerHTML = `

      <!-- FLOATING BUTTON -->

      <button
        class="cr-chat-launcher"
        id="cr-chat-launcher"
        type="button"
        aria-label="Open CarbonRoot AI Assistant"
        title="CarbonRoot AI Assistant"
      >

        <span class="cr-launcher-ring"></span>


        <svg
          class="cr-chat-icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >

          <path
            d="M20 11.5C20 16.194 16.194 20 11.5 20C10.45 20 9.44 19.81 8.51 19.46L4 21L5.54 16.49C5.19 15.56 5 14.55 5 13.5C5 8.806 8.806 5 13.5 5C18.194 5 20 7.806 20 11.5Z"
            stroke="currentColor"
            stroke-width="1.6"
          />

          <path
            d="M8.5 13.5C9.4 14.3 10.45 14.7 11.5 14.7C12.55 14.7 13.6 14.3 14.5 13.5"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linecap="round"
          />

        </svg>


        <span
          class="cr-launcher-status"
        ></span>

      </button>


      <!-- CHAT WINDOW -->

      <section
        class="cr-chat-window"
        id="cr-chat-window"
        aria-hidden="true"
      >


        <!-- HEADER -->

        <header class="cr-chat-header">

          <div class="cr-header-left">

            <div
              class="cr-ai-mark"
              aria-hidden="true"
            >

              <span class="cr-ai-core"></span>

              <span class="cr-ai-orbit"></span>

            </div>


            <div>

              <div class="cr-system-label">
                CARBONROOT / AI
              </div>

              <div class="cr-chat-title">
                CarbonRoot Assistant
              </div>

              <div class="cr-chat-status">
                <span></span>
                CONNECTED FLOW
              </div>

            </div>

          </div>


          <!-- HEADER ACTIONS -->

          <div class="cr-header-actions">

            <button
              class="cr-delete-btn"
              id="cr-delete-chat"
              type="button"
              aria-label="Delete chat"
              title="Delete chat"
            >

              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >

                <path
                  d="M4 7H20"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />

                <path
                  d="M9 7V4H15V7"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />

                <path
                  d="M7 7L8 20H16L17 7"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linejoin="round"
                />

                <path
                  d="M10 11V16"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />

                <path
                  d="M14 11V16"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />

              </svg>

            </button>


            <button
              class="cr-close-btn"
              id="cr-close-chat"
              type="button"
              aria-label="Close chatbot"
              title="Close"
            >
              ×
            </button>

          </div>

        </header>


        <!-- INTRO -->

        <div class="cr-chat-intro">

          <div class="cr-intro-line">

            <span>01</span>

            KNOWLEDGE INTERFACE

          </div>


          <h3>
            Ask about India's
            <strong>carbon economy.</strong>
          </h3>


          <p>
            Explore carbon credits, MRV, carbon markets,
            farmer participation, verification and
            CarbonRoot's infrastructure.
          </p>

        </div>


        <!-- SUGGESTIONS -->

        <div
          class="cr-suggestions"
          id="cr-suggestions"
        >

          <button
            type="button"
            data-question="What does CarbonRoot do?"
          >
            What does CarbonRoot do?
          </button>


          <button
            type="button"
            data-question="How do carbon credits work?"
          >
            How do carbon credits work?
          </button>


          <button
            type="button"
            data-question="What is MRV?"
          >
            What is MRV?
          </button>


          <button
            type="button"
            data-question="How can farmers participate?"
          >
            How can farmers participate?
          </button>

        </div>


        <!-- MESSAGES -->

        <div
          class="cr-messages"
          id="cr-messages"
          aria-live="polite"
        ></div>


        <!-- TYPING -->

        <div
          class="cr-typing"
          id="cr-typing"
          hidden
        >

          <span></span>
          <span></span>
          <span></span>

          <small>
            CARBONROOT AI IS THINKING
          </small>

        </div>


        <!-- INPUT -->

        <div class="cr-input-area">

          <div class="cr-input-wrapper">

            <textarea
              id="cr-user-input"
              rows="1"
              maxlength="1200"
              placeholder="Ask CarbonRoot..."
            ></textarea>


            <button
              class="cr-send-btn"
              id="cr-send-btn"
              type="button"
              aria-label="Send message"
              title="Send message"
            >

              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >

                <path
                  d="M21 3L10.5 13.5"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                />

                <path
                  d="M21 3L14.3 21L10.5 13.5L3 9.7L21 3Z"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />

              </svg>

            </button>

          </div>


          <div class="cr-input-footer">

            <span>
              CARBONROOT INTELLIGENCE
            </span>

            <span>
              <span id="cr-character-count">0</span>/1200
            </span>

          </div>

        </div>

      </section>

    `;


    document.body.appendChild(container);
  }


  /* =========================================================
     EVENTS
     ========================================================= */

  attachEvents() {

    const launcher =
      document.getElementById(
        "cr-chat-launcher"
      );

    const closeButton =
      document.getElementById(
        "cr-close-chat"
      );

    const deleteButton =
      document.getElementById(
        "cr-delete-chat"
      );

    const sendButton =
      document.getElementById(
        "cr-send-btn"
      );

    const input =
      document.getElementById(
        "cr-user-input"
      );


    if (
      !launcher ||
      !closeButton ||
      !deleteButton ||
      !sendButton ||
      !input
    ) {

      console.error(
        "CarbonRoot chatbot failed to initialize."
      );

      return;
    }


    /* Open */

    launcher.addEventListener(
      "click",
      () => {
        this.openChat();
      }
    );


    /* Close */

    closeButton.addEventListener(
      "click",
      () => {
        this.closeChat();
      }
    );


    /* Delete */

    deleteButton.addEventListener(
      "click",
      () => {
        this.deleteChat();
      }
    );


    /* Send */

    sendButton.addEventListener(
      "click",
      () => {
        this.sendMessage();
      }
    );


    /* Enter */

    input.addEventListener(
      "keydown",
      (event) => {

        if (
          event.key === "Enter" &&
          !event.shiftKey
        ) {

          event.preventDefault();

          this.sendMessage();
        }
      }
    );


    /* Resize */

    input.addEventListener(
      "input",
      () => {

        input.style.height = "auto";

        input.style.height =
          Math.min(
            input.scrollHeight,
            110
          ) + "px";

        this.updateCharacterCount();
      }
    );


    /* Suggested questions */

    document
      .querySelectorAll(
        ".cr-suggestions button"
      )
      .forEach((button) => {

        button.addEventListener(
          "click",
          () => {

            input.value =
              button.dataset.question;

            this.updateCharacterCount();

            this.sendMessage();
          }
        );

      });


    /* Escape */

    document.addEventListener(
      "keydown",
      (event) => {

        if (
          event.key === "Escape" &&
          this.isOpen
        ) {

          this.closeChat();
        }

      }
    );
  }


  /* =========================================================
     LOCAL STORAGE
     ========================================================= */

  loadHistory() {

    try {

      const stored =
        localStorage.getItem(
          this.storageKey
        );


      if (stored) {

        const parsed =
          JSON.parse(stored);


        if (Array.isArray(parsed)) {

          this.messages =
            parsed;
        }
      }

    } catch (error) {

      console.warn(
        "CarbonRoot: Could not restore chat history.",
        error
      );

      this.messages = [];
    }
  }


  saveHistory() {

    try {

      localStorage.setItem(
        this.storageKey,
        JSON.stringify(
          this.messages.slice(-30)
        )
      );

    } catch (error) {

      console.warn(
        "CarbonRoot: Could not save chat history.",
        error
      );
    }
  }


  /* =========================================================
     RENDER STORED MESSAGES
     ========================================================= */

  renderStoredMessages() {

    const container =
      document.getElementById(
        "cr-messages"
      );


    if (!container) {
      return;
    }


    container.innerHTML = "";


    this.messages.forEach(
      (message) => {

        this.renderMessage(
          message.role,
          message.content
        );

      }
    );


    this.scrollToBottom();
  }


  /* =========================================================
     ADD MESSAGE
     ========================================================= */

  addMessage(
    role,
    content
  ) {

    this.renderMessage(
      role,
      content
    );


    this.messages.push({

      role:
        role === "assistant"
          ? "assistant"
          : "user",

      content:
        content

    });


    this.saveHistory();

    this.scrollToBottom();
  }


  /* =========================================================
     RENDER MESSAGE
     ========================================================= */

  renderMessage(
    role,
    content
  ) {

    const container =
      document.getElementById(
        "cr-messages"
      );


    if (!container) {
      return;
    }


    const message =
      document.createElement(
        "div"
      );


    message.className =
      role === "user"
        ? "cr-message cr-user-message"
        : "cr-message cr-ai-message";


    message.innerHTML = `

      <div class="cr-message-meta">

        ${
          role === "user"
            ? "YOU"
            : "CARBONROOT AI"
        }

      </div>


      <div class="cr-message-content">

        ${this.formatResponse(content)}

      </div>

    `;


    container.appendChild(
      message
    );
  }


  /* =========================================================
     WELCOME
     ========================================================= */

  addWelcomeMessage() {

    this.addMessage(
      "assistant",

      `Welcome to CarbonRoot. I'm your AI assistant for understanding India's carbon economy, carbon credits, MRV, farmer participation and CarbonRoot's infrastructure.

What would you like to explore?`
    );
  }


  /* =========================================================
     FORMAT
     ========================================================= */

  formatResponse(text) {

    if (!text) {
      return "";
    }


    return String(text)

      .replace(
        /&/g,
        "&amp;"
      )

      .replace(
        /</g,
        "&lt;"
      )

      .replace(
        />/g,
        "&gt;"
      )

      .replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
      )

      .replace(
        /\n/g,
        "<br>"
      );
  }


  /* =========================================================
     CHARACTER COUNT
     ========================================================= */

  updateCharacterCount() {

    const input =
      document.getElementById(
        "cr-user-input"
      );

    const counter =
      document.getElementById(
        "cr-character-count"
      );


    if (input && counter) {

      counter.textContent =
        input.value.length;
    }
  }


  /* =========================================================
     OPEN
     ========================================================= */

  openChat() {

    this.isOpen = true;


    localStorage.setItem(
      this.openKey,
      "true"
    );


    const windowElement =
      document.getElementById(
        "cr-chat-window"
      );


    const launcher =
      document.getElementById(
        "cr-chat-launcher"
      );


    if (
      !windowElement ||
      !launcher
    ) {
      return;
    }


    windowElement.classList.add(
      "cr-open"
    );


    windowElement.setAttribute(
      "aria-hidden",
      "false"
    );


    launcher.classList.add(
      "cr-active"
    );


    setTimeout(
      () => {

        document
          .getElementById(
            "cr-user-input"
          )
          ?.focus();

      },
      250
    );
  }


  /* =========================================================
     CLOSE
     ========================================================= */

  closeChat() {

    this.isOpen = false;


    localStorage.setItem(
      this.openKey,
      "false"
    );


    const windowElement =
      document.getElementById(
        "cr-chat-window"
      );


    const launcher =
      document.getElementById(
        "cr-chat-launcher"
      );


    if (
      !windowElement ||
      !launcher
    ) {
      return;
    }


    windowElement.classList.remove(
      "cr-open"
    );


    windowElement.setAttribute(
      "aria-hidden",
      "true"
    );


    launcher.classList.remove(
      "cr-active"
    );
  }


  /* =========================================================
     DELETE CHAT
     ========================================================= */

  deleteChat() {

    if (this.isLoading) {
      return;
    }


    const confirmed =
      window.confirm(
        "Delete this conversation?\n\nYour CarbonRoot AI chat history will be permanently cleared from this browser."
      );


    if (!confirmed) {
      return;
    }


    /*
     * Clear local history.
     */

    this.messages = [];


    localStorage.removeItem(
      this.storageKey
    );


    /*
     * Clear UI.
     */

    const messagesContainer =
      document.getElementById(
        "cr-messages"
      );


    if (messagesContainer) {

      messagesContainer.innerHTML = "";
    }


    /*
     * Show fresh welcome message.
     */

    this.addWelcomeMessage();


    /*
     * Show suggestions again.
     */

    const suggestions =
      document.getElementById(
        "cr-suggestions"
      );


    if (suggestions) {

      suggestions.classList.remove(
        "cr-suggestions-hidden"
      );
    }


    /*
     * Reset input.
     */

    const input =
      document.getElementById(
        "cr-user-input"
      );


    if (input) {

      input.value = "";

      input.style.height =
        "auto";
    }


    this.updateCharacterCount();
  }


  /* =========================================================
     TYPING
     ========================================================= */

  showTyping() {

    const typing =
      document.getElementById(
        "cr-typing"
      );


    if (typing) {

      typing.hidden = false;
    }


    this.scrollToBottom();
  }


  hideTyping() {

    const typing =
      document.getElementById(
        "cr-typing"
      );


    if (typing) {

      typing.hidden = true;
    }
  }


  /* =========================================================
     SCROLL
     ========================================================= */

  scrollToBottom() {

    const messages =
      document.getElementById(
        "cr-messages"
      );


    if (!messages) {
      return;
    }


    requestAnimationFrame(
      () => {

        messages.scrollTop =
          messages.scrollHeight;

      }
    );
  }


  /* =========================================================
     SEND MESSAGE
     ========================================================= */

  async sendMessage() {

    if (this.isLoading) {
      return;
    }


    const input =
      document.getElementById(
        "cr-user-input"
      );


    const sendButton =
      document.getElementById(
        "cr-send-btn"
      );


    if (!input) {
      return;
    }


    const message =
      input.value.trim();


    if (!message) {
      return;
    }


    input.value = "";

    input.style.height =
      "auto";


    this.updateCharacterCount();


    this.addMessage(
      "user",
      message
    );


    this.hideSuggestions();

    this.showTyping();


    this.isLoading = true;


    if (sendButton) {
      sendButton.disabled = true;
    }


    try {

      const response =
        await fetch(
          this.apiUrl,
          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

              "Accept":
                "application/json"
            },

            body:
              JSON.stringify({

                message:
                  message,

                history:
                  this.messages
                    .slice(-12)

              })

          }
        );


      if (!response.ok) {

        let errorMessage =
          `Server responded with ${response.status}`;


        try {

          const errorData =
            await response.json();


          if (errorData.detail) {

            errorMessage =
              errorData.detail;
          }


          if (errorData.error) {

            errorMessage =
              errorData.error;
          }

        } catch (_) {}


        throw new Error(
          errorMessage
        );
      }


      const data =
        await response.json();


      this.hideTyping();


      const answer =
        data.answer ||
        data.response ||
        data.message ||
        data.reply;


      if (answer) {

        this.addMessage(
          "assistant",
          answer
        );

      } else {

        this.addMessage(
          "assistant",
          "I received an empty response from the CarbonRoot intelligence layer. Please try again."
        );
      }


    } catch (error) {

      console.error(
        "CarbonRoot chatbot error:",
        error
      );


      this.hideTyping();


      this.addMessage(
        "assistant",

        "I'm temporarily unable to connect to the CarbonRoot intelligence layer. Please try again in a moment."
      );


    } finally {

      this.isLoading = false;


      if (sendButton) {

        sendButton.disabled =
          false;
      }


      document
        .getElementById(
          "cr-user-input"
        )
        ?.focus();
    }
  }


  /* =========================================================
     HIDE SUGGESTIONS
     ========================================================= */

  hideSuggestions() {

    const suggestions =
      document.getElementById(
        "cr-suggestions"
      );


    if (suggestions) {

      suggestions.classList.add(
        "cr-suggestions-hidden"
      );
    }
  }
}


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    window.CarbonRootChatbot =
      new CarbonRootChatbot({

        apiUrl:
          window.CARBONROOT_CHAT_API_URL ||
          "https://carbonroot.onrender.com/api/chat",

        botName:
          "CarbonRoot AI"

      });

  }
);