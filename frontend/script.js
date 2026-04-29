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

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const detail = errorData?.detail || `Server error (${response.status})`;
            throw new Error(detail);
        }

        const data = await response.json();
        
        // Update session ID if new
        if (!currentSessionId) {
            currentSessionId = data.session_id;
        }

        // Replace loading message with response
        loadingMessage.remove();
        addMessage(data.answer, 'assistant', data.sources, false, data.citations);

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

function addMessage(content, type, sources = null, isWelcome = false, citations = null) {
    const messageId = Date.now();
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}${isWelcome ? ' welcome-message' : ''}`;
    messageDiv.id = `message-${messageId}`;

    // Convert markdown to HTML for assistant messages
    const displayContent = type === 'assistant' ? marked.parse(content) : escapeHtml(content);

    let html = `<div class="message-content">${displayContent}</div>`;

    if (citations && citations.length > 0) {
        const citationItems = citations.map(c => {
            const label = c.lesson_number
                ? `${escapeHtml(c.course_title)} — Lesson ${c.lesson_number}`
                : escapeHtml(c.course_title);
            const href = c.lesson_link || c.course_link;
            if (href) {
                return `<span class="citation-item"><a href="${escapeHtml(href)}" class="citation-link" target="_blank" rel="noopener noreferrer">${label}</a></span>`;
            }
            return `<span class="citation-item">${label}</span>`;
        }).join('');
        html += `
            <details class="sources-collapsible">
                <summary class="sources-header">Sources</summary>
                <div class="sources-content">${citationItems}</div>
            </details>
        `;
    } else if (sources && sources.length > 0) {
        html += `
            <details class="sources-collapsible">
                <summary class="sources-header">Sources</summary>
                <div class="sources-content">${sources.map(escapeHtml).join(', ')}</div>
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

// Load course statistics
async function loadCourseStats() {
    try {
        console.log('Loading course stats...');
        const response = await fetch(`${API_URL}/catalog`);
        if (!response.ok) throw new Error('Failed to load course stats');

        const data = await response.json();
        console.log('Course data received:', data);

        // Update stats in UI
        if (totalCourses) {
            totalCourses.textContent = data.total_courses;
        }

        // Update course titles
        if (courseTitles) {
            if (data.courses && data.courses.length > 0) {
                courseTitles.innerHTML = data.courses.map(course => {
                    const titleHtml = course.course_link
                        ? `<a href="${escapeHtml(course.course_link)}" class="course-link" target="_blank" rel="noopener noreferrer">${escapeHtml(course.title)}</a>`
                        : `<span class="course-title-text">${escapeHtml(course.title)}</span>`;

                    const instructorHtml = course.instructor
                        ? `<div class="course-instructor">${escapeHtml(course.instructor)}</div>`
                        : '';

                    let lessonsHtml = '';
                    if (course.lessons && course.lessons.length > 0) {
                        const lessonItems = course.lessons.map(lesson => {
                            const lessonLabel = `Lesson ${lesson.lesson_number}: ${escapeHtml(lesson.title)}`;
                            if (lesson.lesson_link) {
                                return `<a href="${escapeHtml(lesson.lesson_link)}" class="lesson-link" target="_blank" rel="noopener noreferrer">${lessonLabel}</a>`;
                            }
                            return `<span class="lesson-text">${lessonLabel}</span>`;
                        }).join('');
                        lessonsHtml = `
                            <details class="lesson-details">
                                <summary>${course.lesson_count || course.lessons.length} lessons</summary>
                                <div class="lesson-list">${lessonItems}</div>
                            </details>`;
                    }

                    return `<div class="course-item">${titleHtml}${instructorHtml}${lessonsHtml}</div>`;
                }).join('');
            } else {
                courseTitles.innerHTML = '<span class="no-courses">No courses available</span>';
            }
        }

    } catch (error) {
        console.error('Error loading course stats:', error);
        // Set default values on error
        if (totalCourses) {
            totalCourses.textContent = '0';
        }
        if (courseTitles) {
            courseTitles.innerHTML = '<span class="error">Failed to load courses</span>';
        }
    }
}