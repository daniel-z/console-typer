export default class ConsoleTyper {
  constructor(props) {
    this.libName = "ConsoleTyper";
    this.errorMessages = {
      noParagraphArray: `${this.libName}: You must provide an array with at least one valid <p> element with text`,
      notParagraph: `${this.libName}: Please provide a valid paragraph element`,
      notContent: `${this.libName}: Please provide a paragraph with text`
    };

    // Always expects an array of <p> elements
    let paragraphElements = Array.isArray(props.paragraphElements) ? props.paragraphElements : [];
    paragraphElements = paragraphElements.filter((p) => (p.innerHTML && p.innerHTML.length > 0));

    if (!paragraphElements.length) {
      console.error(this.errorMessages.noParagraphArray);
      return;
    }

    const textsToType = paragraphElements.map((p) => p.innerHTML);

    this.defaultSettings = {
      loop: true,
      loopAfterSeconds: 0.5,
      cursor: "I",
      stopCursorAfterBlinks: 1,
      cursorAnimationSpeedMs: 500,
      typingSpeedMs: 40,
      onStartTyping: () => {},
      onStopTyping: () => {},
      onStopCursorAnimation: () => {}
    };

    this.state = {
      isTyping: false,
      currentParagraphIndex: 0
    };

    this.settings = Object.assign(
      { ...this.defaultSettings },
      { ...props },
      { paragraphElements, textsToType }
    );

    this.type = this.type.bind(this);
    this.animateCursor = this.animateCursor.bind(this);
    this.startTyping = this.startTyping.bind(this);
    this.typeParagraph = this.typeParagraph.bind(this);
    this.cleanAllParagraphs = this.cleanAllParagraphs.bind(this);
  }

  cleanAllParagraphs() {
    this.settings.paragraphElements.forEach((p) => {
      p.innerHTML = " ";
      const computed = window.getComputedStyle(p);
      p.style.minHeight = computed.lineHeight;
    });
  }

  onStopCursorAnimation() {
    this.settings.onStopCursorAnimation();
  }

  onStartTyping() {
    this.state.isTyping = true;
    this.settings.onStartTyping();
  }

  onStopTyping() {
    this.state.isTyping = false;
    this.settings.onStopTyping();
  }

  animateCursor(actualBlink, paragraphElement, options = {}) {
    const { cursor, stopCursorAfterBlinks, cursorAnimationSpeedMs } = this.settings;
    const { initial = false, onFinish = null, blinks = 2 } = options;

    let newText = "";
    if (initial) {
      newText = actualBlink % 2 === 0 ? cursor : "";
    } else {
      const actualText = paragraphElement.innerHTML;
      if (actualText.endsWith(cursor)) {
        newText = actualText.slice(0, -cursor.length);
      } else {
        if (actualBlink >= blinks) {
          this.onStopCursorAnimation();
          if (onFinish) onFinish();
          return;
        }
        newText = paragraphElement.innerHTML + cursor;
      }
    }

    setTimeout(() => {
      if (this.state.isTyping === true && !initial) {
        this.onStopCursorAnimation();
        if (onFinish) onFinish();
        return;
      }
      paragraphElement.innerHTML = newText;
      if (initial) {
        if (actualBlink >= blinks * 2 - 1) {
          if (onFinish) onFinish();
          return;
        }
        this.animateCursor(actualBlink + 1, paragraphElement, { initial: true, onFinish, blinks });
      } else {
        this.animateCursor(actualBlink + 1, paragraphElement, { onFinish, blinks });
      }
    }, cursorAnimationSpeedMs);
  }

  type(textArray, paragraphElement, onFinish, isLastParagraph = false) {
    if (textArray.length <= 0) {
      if (onFinish) onFinish();
      return;
    }

    const { cursor, typingSpeedMs } = this.settings;

    let actualText = paragraphElement.innerHTML;
    if (actualText.endsWith(cursor)) {
      actualText = actualText.slice(0, -cursor.length);
    }
    const newChar = textArray.shift();

    paragraphElement.innerHTML = actualText + newChar + cursor;

    if (textArray.length > 0) {
      setTimeout(() => this.type(textArray, paragraphElement, onFinish, isLastParagraph), typingSpeedMs);
    } else {
      this.onStopTyping();
      if (isLastParagraph) {
        this.animateCursor(0, paragraphElement, { onFinish, blinks: 2 });
      } else {
        if (paragraphElement.innerHTML.endsWith(cursor)) {
          paragraphElement.innerHTML = paragraphElement.innerHTML.slice(0, -cursor.length);
        }
        if (onFinish) onFinish();
      }
    }
  }

  typeParagraph(index) {
    const { paragraphElements, textsToType } = this.settings;
    if (index >= paragraphElements.length) {
      if (this.settings.loop) {
        this.animateCursor(0, paragraphElements[paragraphElements.length - 1], {
          onFinish: () => {
            setTimeout(() => {
              this.cleanAllParagraphs();
              this.programLoop();
            }, this.settings.loopAfterSeconds * 1000);
          },
          blinks: 2
        });
      }
      return;
    }
    this.state.currentParagraphIndex = index;
    if (index === 0) {
      this.cleanAllParagraphs();
      this.onStartTyping();
      this.animateCursor(0, paragraphElements[index], {
        initial: true,
        onFinish: () => {
          paragraphElements[index].innerHTML = "";
          this.type(
            textsToType[index].split(""),
            paragraphElements[index],
            () => {
              this.typeParagraph(index + 1);
            },
            paragraphElements.length === 1
          );
        },
        blinks: 2
      });
    } else {
      this.onStartTyping();
      this.type(
        textsToType[index].split(""),
        paragraphElements[index],
        () => {
          this.typeParagraph(index + 1);
        },
        index === paragraphElements.length - 1
      );
    }
  }

  programLoop() {
    this.startTyping();
  }

  startTyping() {
    this.typeParagraph(0);
  }
}
