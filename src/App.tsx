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
  overgår: ">",
  undergår: "<",
  eller: "else",
  loggfør: "console.log(",
  imens: "while (",
};

const App: Component = () => {
  const [inputScript, setInputScript] = createSignal<string>(
    `La i være 0.

Imens i undergår 10, 
så loggfør i, 
samt i++, 
samt loggfør "hei".`
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
      .replaceAll("samt", "£")
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

    // £ "samt" is used for opening once more code can be written
    const samtArray = inputArray.join(" ").split(/(?=[£])/g);

    let samtConstruct: string[] = [];

    samtArray.forEach((line) => {
      // Includes samt
      if (line.includes("£")) {
        const i = Math.max(line.lastIndexOf("§"), line.lastIndexOf("µ"));

        line = line.substring(0, i) + "$;" + line.substring(i + 1, line.length);

        samtConstruct.push(line.replace("£", ""));
      } else {
        samtConstruct.push(line);
      }
    });

    let punctuated = format(samtConstruct.join(" "), /(?<=[µ§])/g).replaceAll(
      " ;",
      ";\n\n"
    );

    const movedArray = punctuated.split(/(?<=[$])/g);

    let movedConstruct: string[] = [];

    movedArray.forEach((line) => {
      console.log(line);
      if (line.includes("$")) {
        const i = Math.max(
          line.lastIndexOf(")"),
          line.lastIndexOf("]"),
          line.lastIndexOf("}")
        );
        const char = line.charAt(i);

        line =
          line.substring(0, i - 1) + ";" + line.substring(i + 3, line.length);

        movedConstruct.push(line.replace("$", char));
      } else {
        movedConstruct.push(line);
      }
    });

    setOutputScript(movedConstruct.join("").replaceAll(" ;", ";"));
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
