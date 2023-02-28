import ConsoleTyper from './dist/console-typer.js';

const consoleTyper = new ConsoleTyper({
  paragraphElement: document.getElementsByClassName('intro-paragraph')[0]
});

consoleTyper.startTyping();
