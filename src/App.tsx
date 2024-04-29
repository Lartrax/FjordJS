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
  så: "£", // "{"
  overgår: ">",
  undergår: "<",
  eller: "||",
  alternativt: "\nelse",
  ellers: "\nelse {",
  loggfør: "console.log(",
  imens: "while (",
  plus: "+",
  minus: "-",
  bruker: " = (",
  gjør: "=>",
  med: "(",
};

const App: Component = () => {
  const [inputScript, setInputScript] = createSignal<string>(
    `La tallet være 99.

Konstant utsagn bruker tall, gjør så 
Konstant mindre er tall minus 1,
Loggfør tall plus " bottles of beer on the wall " plus tall plus " bottles of beer take one down pass it around " plus mindre plus " bottles of beer on the wall".

Imens tallet overgår 0, så 
utsagn med tallet,
tallet er tallet minus 1.`
  );
  const [outputScript, setOutputScript] = createSignal<string>("");

  const format = (text: string, regex: RegExp): string => {
    // Create array of lines by splitting on µ and §. But keep the symbols in the array.
    let seperatedText = text.split(regex);

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

    // Split on "Så"
    let boxesArray = inputArray.join(" ").split(/(?=[£])/g);

    boxesArray.forEach((section, i) => {
      // Find first stopper §
      // Replace all µ before stopper with "µ ;"
      // Add closer to stopper § -> "§ $ ;" $ will later switch with }
      if (section.includes("£")) {
        const stopper = section.indexOf("§");
        if (stopper > 0) {
          section =
            section.slice(0, stopper + 1).replaceAll("µ", "µ ;") +
            "$ ;" +
            section.slice(stopper + 1, section.length);
        }
      }
      boxesArray[i] = section;
    });

    let punctuated = format(boxesArray.join(" "), /(?<=[µ§])/g);

    setOutputScript(
      punctuated
        .replaceAll("{", "{\n") // Formatting
        .replaceAll("}", "\n}") // Formatting
        .replaceAll("£", "{\n") // Switch "så" with "{"
        .replaceAll("$", "\n}") // Switch "så" stopper with "}"
        .replaceAll(" ;", ";\n") // Formatting
    );
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
