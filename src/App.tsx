import { createEffect, createSignal, type Component } from "solid-js";

const translation = {
  la: "let",
  konstant: "const",
  være: "=",
  er: "=",
  ligner: "==",
  tilsvarer: "===",
  hvis: "if (",
  dersom: "if (",
  så: "{",
  overstiger: ">",
  understiger: "<",
  eller: "else",
  loggfør: "console.log(",
};

const App: Component = () => {
  const [inputScript, setInputScript] = createSignal<string>(
    'dersom 2 overstiger 1, så loggfør "hei verden".'
  );
  const [outputScript, setOutputScript] = createSignal<string>("");

  const formatPunctuation = (text: string): string => {
    // Create array of lines by splitting on µ and §. But keep the symbols in the array.
    let seperatedText = text.split(/(?<=[µ§])/g);

    let symbolizedText: string[] = [];

    // Push open brackets/parentheses/curly brackets in each line of seperatedText to symbolStack
    seperatedText.forEach((line) => {
      let symbolStack = [];

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === "(" || char === "{") {
          symbolStack.push(char);
        }
      }

      // Create closing symbols from symbolStack
      const symbols =
        " " +
        symbolStack
          .reverse()
          .join(" ")
          .replaceAll("(", ")")
          .replaceAll("{", "}");

      // Push line to symbolizedText after replacing punctuation with closing brackets
      symbolizedText.push(
        line.replace("µ", symbols).replace("§", symbols + " ;")
      );
    });

    return symbolizedText.join("");
  };

  createEffect(() => {
    const input = inputScript().toLowerCase();

    // Replace , with µ and . with §.
    // To better distinguish from . and , inn normal code "console'.'log"
    // Then split on spaces
    let inputArray = input
      .replaceAll(",", "µ")
      .replaceAll(".", "§")
      .split(/\s+/);

    inputArray.forEach((part, i) => {
      // If part is in translation object
      if (translation[part as keyof typeof translation]) {
        // Use translation
        inputArray[i] = translation[part as keyof typeof translation];
      } else {
        // Use part | Don't translate
        inputArray[i] = part;
      }
    });

    let translated = inputArray.join(" ");

    translated = formatPunctuation(translated).replaceAll(" ;", ";\n\n");

    setOutputScript(translated);
  });

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        "flex-direction": "column",
        "flex-grow": 1,
        "justify-content": "center",
        gap: "2rem",
        "margin-left": "1rem",
        "margin-right": "1rem",
      }}
    >
      <textarea
        style={{
          height: "40vh",
          padding: "1rem",
          "font-size": "1.5rem",
          "word-break": "break-word",
        }}
        value={inputScript()}
        onInput={(e) => setInputScript(e.target.value)}
      />
      <textarea
        disabled
        style={{
          height: "40vh",
          padding: "1rem",
          "font-size": "1.5rem",
          "word-break": "break-word",
        }}
      >
        {outputScript()}
      </textarea>
      <button style={{ height: "5vh" }} onClick={() => eval(outputScript())}>
        Kjør kode
      </button>
    </div>
  );
};

export default App;
