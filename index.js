import ConsoleTyper from './dist/console-typer.js';

const consoleTyper = new ConsoleTyper({
  paragraphElement: document.getElementsByClassName('intro-paragraph')[0],
  loop: false,
  typingSpeedMs: 40,
  stopCursorAfterBlinks: 200
});

consoleTyper.startTyping();
