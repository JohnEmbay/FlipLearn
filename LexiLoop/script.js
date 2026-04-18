// LexiLoop - Flashcard App
// Learn fast. Repeat smart. Remember longer.

// Global state
let flashcards = [];
let currentStudyIndex = 0;
let studyDeck = [];
let isFlipped = false;
let editingId = null;

// DOM elements
const addSection = document.getElementById('add-section');
const studySection = document.getElementById('study-section');
const flashcardForm = document.getElementById('flashcard-form');
const flashcardList = document.getElementById('flashcard-list');
const termInput = document.getElementById('term');
const definitionInput = document.getElementById('definition');
const currentCard = document.getElementById('current-card');
const cardTerm = document.getElementById('card-term');
const cardDefinition = document.getElementById('card-definition');
const flipBtn = document.getElementById('flip-btn');
const learnedBtn = document.getElementById('learned-btn');
const notLearnedBtn = document.getElementById('not-learned-btn');
const startStudyBtn = document.getElementById('start-study');
const endStudyBtn = document.getElementById('end-study');
const masteryPercent = document.getElementById('mastery-percent');
const progressBar = document.getElementById('progress-bar');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadFlashcards();
    renderFlashcardList();
    updateMastery();
    
    // Event listeners
    flashcardForm.addEventListener('submit', handleAddFlashcard);
    flipBtn.addEventListener('click', toggleFlip);
    learnedBtn.addEventListener('click', () => handleLearnStatus(true));
    notLearnedBtn.addEventListener('click', () => handleLearnStatus(false));
    startStudyBtn.addEventListener('click', startStudyMode);
    endStudyBtn.addEventListener('click', endStudyMode);
});

// Add or update flashcard
function handleAddFlashcard(e) {
    e.preventDefault();
    
    const term = termInput.value.trim();
    const definition = definitionInput.value.trim();
    
    if (!term || !definition) {
        alert('Please fill both term and definition');
        return;
    }
    
    if (editingId) {
        // Update existing flashcard
        const card = flashcards.find(c => c.id === editingId);
        if (card) {
            card.term = term;
            card.definition = definition;
        }
        editingId = null;
        flashcardForm.querySelector('button[type="submit"]').textContent = 'Add Flashcard';
    } else {
        // Add new flashcard
        const newCard = {
            id: Date.now(),
            term,
            definition,
            learned: false
        };
        flashcards.push(newCard);
    }
    
    termInput.value = '';
    definitionInput.value = '';
    saveFlashcards();
    renderFlashcardList();
    updateMastery();
}

// Render list of flashcards
function renderFlashcardList() {
    flashcardList.innerHTML = '';
    
    flashcards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'flashcard-item';
        cardEl.innerHTML = `
            <div>
                <div class="flashcard-term">${card.term}</div>
                <div class="flashcard-definition">${card.definition}</div>
            </div>
            <div class="item-actions">
                <button class="edit-btn" onclick="editFlashcard(${card.id})">Edit</button>
                <button class="delete-btn" onclick="deleteFlashcard(${card.id})">Delete</button>
            </div>
        `;
        flashcardList.appendChild(cardEl);
    });
}

// Edit flashcard
function editFlashcard(id) {
    const card = flashcards.find(c => c.id === id);
    if (card) {
        termInput.value = card.term;
        definitionInput.value = card.definition;
        termInput.focus();
        editingId = id;
        flashcardForm.querySelector('button[type="submit"]').textContent = 'Update Flashcard';
        termInput.scrollIntoView({ behavior: 'smooth' });
    }
}

// Delete flashcard
function deleteFlashcard(id) {
    if (confirm('Delete this flashcard?')) {
        flashcards = flashcards.filter(c => c.id !== id);
        saveFlashcards();
        renderFlashcardList();
        updateMastery();
    }
}

// Start study mode
function startStudyMode() {
    if (flashcards.length === 0) {
        alert('Please add some flashcards first!');
        return;
    }
    
    // Shuffle deck (Fisher-Yates)
    studyDeck = [...flashcards].sort(() => Math.random() - 0.5);
    currentStudyIndex = 0;
    isFlipped = false;
    
    addSection.classList.remove('active');
    studySection.classList.add('active');
    
    showCurrentCard();
    updateMastery();
}

// End study mode
function endStudyMode() {
    addSection.classList.add('active');
    studySection.classList.remove('active');
    currentCard.style.display = 'none';
}

// Show current card
function showCurrentCard() {
    if (currentStudyIndex >= studyDeck.length) {
        alert('Study session complete! Great job!');
        endStudyMode();
        return;
    }
    
    const card = studyDeck[currentStudyIndex];
    cardTerm.textContent = card.term;
    cardDefinition.textContent = card.definition;
    cardDefinition.style.display = 'none';
    flipBtn.textContent = 'Flip';
    isFlipped = false;
    
    currentCard.style.display = 'block';
}

// Toggle flip
function toggleFlip() {
    isFlipped = !isFlipped;
    cardDefinition.style.display = isFlipped ? 'block' : 'none';
    cardTerm.style.display = isFlipped ? 'none' : 'block';
    flipBtn.textContent = isFlipped ? 'Flip Back' : 'Flip';
}

// Handle learn status
function handleLearnStatus(learned) {
    if (currentStudyIndex < studyDeck.length) {
        const card = studyDeck[currentStudyIndex];
        const originalCard = flashcards.find(c => c.id === card.id);
        if (originalCard) {
            originalCard.learned = learned;
        }
        saveFlashcards();
        updateMastery();
    }
    
    currentStudyIndex++;
    showCurrentCard();
}

// Update mastery display
function updateMastery() {
    const total = flashcards.length;
    const learned = flashcards.filter(c => c.learned).length;
    const percent = total > 0 ? Math.round((learned / total) * 100) : 0;
    
    masteryPercent.textContent = `${percent}% Mastery`;
    progressBar.style.width = `${percent}%`;
    
    // Update start button text
    startStudyBtn.textContent = `Start Study Mode (${total} cards)`;
}

// LocalStorage functions
function saveFlashcards() {
    localStorage.setItem('lexiloop-flashcards', JSON.stringify(flashcards));
}

function loadFlashcards() {
    const saved = localStorage.getItem('lexiloop-flashcards');
    if (saved) {
        flashcards = JSON.parse(saved);
    }
}
