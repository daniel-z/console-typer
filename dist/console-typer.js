export default class ConsoleTyper {
  constructor(props) {
    const { paragraphElement } = props;

    if (!paragraphElement) {
      console.error(this.errorMessages.notParagraph);
      return;
    }

    if (paragraphElement.tagName !== "P") {
      console.error(this.errorMessages.notParagraph);
      return;
    }

    const textToType = paragraphElement.innerHTML;
    if (textToType.length === 0) {
      console.error(this.errorMessages.notContent);
    }


    this.defaultSettings = {
      loop: true,
      loopAfterSeconds: 6,
      cursor: "I",
      stopCursorAfterBlinks: 10,
      cursorAnimationSpeedMs: 500,
      typingSpeedMs: 70,
      onStartTyping: () => {},
      onStopTyping: () => {},
      onStopCursorAnimation: () => {}
    };
  
    this.state = {
      isTyping: false
    };
  
    this.libName = "ConsoleTyper";
  
    this.errorMessages = {
      notParagraph: `${this.libName}: please provide a valid paragraph element`,
      notContent: `${this.libName}: please provide a paragraph with text`
    };

    this.settings = Object.assign(
      { ...this.defaultSettings },
      { ...props },
      { textToType }
    );

    this.cleanParagraph();

    this.type = this.type.bind(this);
    this.animateCursor = this.animateCursor.bind(this);
  }

  cleanParagraph() {
    this.settings.paragraphElement.innerHTML = " ";
  }

  onStopCursorAnimation() {
    const { onStopCursorAnimation } = this.settings;
    onStopCursorAnimation();
  }

  onStartTyping() {
    const { onStartTyping } = this.settings;
    this.state.isTyping = true;
    onStartTyping();
  }

  onStopTyping() {
    const { onStopTyping } = this.settings;
    this.state.isTyping = false;
    onStopTyping();
  }

  animateCursor(actualBlink) {
    const {
      paragraphElement,
      cursor,
      stopCursorAfterBlinks,
      cursorAnimationSpeedMs
    } = this.settings;

    const actualText = paragraphElement.innerHTML.split("");
    const lastChar = actualText.pop();
    let newText = "";

    if (lastChar === cursor) {
      newText = actualText.join("");
    } else {
      if (actualBlink >= stopCursorAfterBlinks) {
        this.onStopCursorAnimation();
        return;
      }
      newText = paragraphElement.innerHTML + cursor;
    }

    setTimeout(() => {
      if (this.state.isTyping === true) {
        this.onStopCursorAnimation();
        return;
      }
      paragraphElement.innerHTML = newText;
      this.animateCursor(actualBlink + 1);
    }, cursorAnimationSpeedMs);
  }

  type(textArray) {
    if (textArray.length <= 0) {
      return;
    }

    const { paragraphElement, cursor, loop, typingSpeedMs } = this.settings;

    let actualText = paragraphElement.innerHTML.split("");
    const newChar = textArray.shift();

    actualText.pop();
    actualText = actualText.join("");

    this.settings.paragraphElement.innerHTML = actualText + newChar + cursor;

    if (textArray.length > 0) {
      setTimeout(() => this.type(textArray), typingSpeedMs);
    } else {
      if (loop) {
        this.programLoop();
      }

      this.onStopTyping();
      this.animateCursor(0);
    }
  }

  programLoop() {
    const { loopAfterSeconds } = this.settings;
    setTimeout(() => this.startTyping(), loopAfterSeconds * 1000);
  }

  startTyping() {
    const { textToType } = this.settings;
    this.onStartTyping();
    this.cleanParagraph();
    this.type(textToType.split(""));
  }
}
