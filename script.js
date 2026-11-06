'use strict';
// Native <details> supplies keyboard, touch, and no-JavaScript expansion.
// Keep only one project note open at a time, without moving keyboard focus.
const projectNotes = Array.from(document.querySelectorAll('.project-card details'));
projectNotes.forEach((note) => {
  note.addEventListener('toggle', () => {
    if (!note.open) return;
    projectNotes.forEach((other) => {
      if (other !== note) other.open = false;
    });
  });
});
