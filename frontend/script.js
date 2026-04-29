// API base URL - use relative path to work from any host
const API_URL = '/api';

// Global state
let currentSessionId = null;

// DOM elements
let chatMessages, chatInput, sendButton, totalCourses, courseTitles;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements after page loads
    chatMessages = document.getElementById('chatMessages');
    chatInput = document.getElementById('chatInput');
    sendButton = document.getElementById('sendButton');
    totalCourses = document.getElementById('totalCourses');
    courseTitles = document.getElementById('courseTitles');
    
    setupEventListeners();
    createNewSession();
    loadCourseStats();
});

// Event Listeners
function setupEventListeners() {
    // Chat functionality
    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    
    // Suggested questions
    document.querySelectorAll('.suggested-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const question = e.target.getAttribute('data-question');
            chatInput.value = question;
            sendMessage();
        });
    });
}


// Chat Functions
async function sendMessage() {
    const query = chatInput.value.trim();
    if (!query) return;

    // Disable input
    chatInput.value = '';
    chatInput.disabled = true;
    sendButton.disabled = true;

    // Add user message
    addMessage(query, 'user');

    // Add loading message - create a unique container for it
    const loadingMessage = createLoadingMessage();
    chatMessages.appendChild(loadingMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        const response = await fetch(`${API_URL}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                session_id: currentSessionId
            })
        });

        if (!response.ok) throw new Error('Query failed');

        const data = await response.json();
        
        // Update session ID if new
        if (!currentSessionId) {
            currentSessionId = data.session_id;
        }

        // Replace loading message with response
        loadingMessage.remove();
        addMessage(data.answer, 'assistant', data.sources, false, data.structured_sources);

    } catch (error) {
        // Replace loading message with error
        loadingMessage.remove();
        addMessage(`Error: ${error.message}`, 'assistant');
    } finally {
        chatInput.disabled = false;
        sendButton.disabled = false;
        chatInput.focus();
    }
}

function createLoadingMessage() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';
    messageDiv.innerHTML = `
        <div class="message-content">
            <div class="loading">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    return messageDiv;
}

function addMessage(content, type, sources = null, isWelcome = false, structuredSources = null) {
    const messageId = Date.now();
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}${isWelcome ? ' welcome-message' : ''}`;
    messageDiv.id = `message-${messageId}`;

    // Convert markdown to HTML for assistant messages
    const displayContent = type === 'assistant' ? marked.parse(content) : escapeHtml(content);

    let html = `<div class="message-content">${displayContent}</div>`;

    // F3: Render structured source citations if available, otherwise fall back to plain sources
    if (structuredSources && structuredSources.length > 0) {
        const citationItems = structuredSources.map(src => {
            const label = `${escapeHtml(src.course_title)} > Lesson ${src.lesson_number}`;
            if (src.link) {
                return `<a class="source-citation-link" href="${escapeHtml(src.link)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
            }
            return `<span class="source-citation-text">${label}</span>`;
        }).join('');
        html += `
            <details class="sources-collapsible">
                <summary class="sources-header">Sources</summary>
                <div class="sources-content sources-structured">${citationItems}</div>
            </details>
        `;
    } else if (sources && sources.length > 0) {
        html += `
            <details class="sources-collapsible">
                <summary class="sources-header">Sources</summary>
                <div class="sources-content">${sources.join(', ')}</div>
            </details>
        `;
    }

    messageDiv.innerHTML = html;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return messageId;
}

// Helper function to escape HTML for user messages
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Removed removeMessage function - no longer needed since we handle loading differently

async function createNewSession() {
    currentSessionId = null;
    chatMessages.innerHTML = '';
    addMessage('Welcome to the Course Materials Assistant! I can help you with questions about courses, lessons and specific content. What would you like to know?', 'assistant', null, true);
}

// Load course catalog (F1 + F2)
async function loadCourseStats() {
    try {
        console.log('Loading course catalog...');
        const response = await fetch(`${API_URL}/catalog`);
        if (!response.ok) throw new Error('Failed to load course catalog');

        const data = await response.json();
        console.log('Course catalog received:', data);

        // F1: Update total courses count
        if (totalCourses) {
            totalCourses.textContent = data.courses ? data.courses.length : 0;
        }

        // F1 + F2: Render course titles as links with expandable lesson sections
        if (courseTitles) {
            if (data.courses && data.courses.length > 0) {
                courseTitles.innerHTML = data.courses.map(course => {
                    // F1: Course title — link if course_link is available, plain text otherwise
                    const titleHtml = course.course_link
                        ? `<a class="course-title-link" href="${escapeHtml(course.course_link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(course.title)}</a>`
                        : `<span class="course-title-plain">${escapeHtml(course.title)}</span>`;

                    // F2: Lessons expandable section (only if lessons exist)
                    let lessonsHtml = '';
                    if (course.lessons && course.lessons.length > 0) {
                        const lessonItems = course.lessons.map(lesson => {
                            const lessonLabel = `Lesson ${lesson.lesson_number}: ${escapeHtml(lesson.title)}`;
                            const lessonContent = lesson.lesson_link
                                ? `<a class="lesson-link" href="${escapeHtml(lesson.lesson_link)}" target="_blank" rel="noopener noreferrer">${lessonLabel}</a>`
                                : `<span class="lesson-plain">${lessonLabel}</span>`;
                            return `<div class="lesson-item">${lessonContent}</div>`;
                        }).join('');
                        lessonsHtml = `
                            <details class="lessons-collapsible">
                                <summary class="lessons-header">Lessons (${course.lessons.length})</summary>
                                <div class="lessons-list">${lessonItems}</div>
                            </details>`;
                    }

                    return `<div class="course-title-item">${titleHtml}${lessonsHtml}</div>`;
                }).join('');
            } else {
                courseTitles.innerHTML = '<span class="no-courses">No courses available</span>';
            }
        }

    } catch (error) {
        console.error('Error loading course catalog:', error);
        if (totalCourses) {
            totalCourses.textContent = '0';
        }
        if (courseTitles) {
            courseTitles.innerHTML = '<span class="error">Failed to load courses</span>';
        }
    }
}