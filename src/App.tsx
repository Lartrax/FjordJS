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
  ellers: "else {",
  loggfør: "console.log(",
  imens: "while (",
};

const App: Component = () => {
  const [inputScript, setInputScript] = createSignal<string>(
    `La i være 0.

Imens i undergår 10, 
så loggfør i, 
samt i++.
        
Dersom i tilsvarer 9, 
så loggfør "i = 9", 
ellers loggfør "i = " + i, 
samt loggfør "hei!".`
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
        const i = line.indexOf("§");

        line =
          line.substring(0, i) + "$ ;" + line.substring(i + 1, line.length);

        samtConstruct.push(line.replace("£", ""));
      } else {
        samtConstruct.push(line);
      }
    });

    let punctuated = format(samtConstruct.join(" "), /(?<=[µ§])/g);

    const movedArray = punctuated.split(/(?<=[$])/g);

    let movedConstruct: string[] = [];

    movedArray.forEach((line) => {
      if (line.includes("$")) {
        // Find closest closed bracket
        const closed_i = Math.max(
          line.lastIndexOf(")"),
          line.lastIndexOf("]"),
          line.lastIndexOf("}")
        );
        const closed_char = line.charAt(closed_i);

        // If closest open bracket is closer than closest closed bracket then move it too.
        const open_i = Math.max(
          line.lastIndexOf("("),
          line.lastIndexOf("["),
          line.lastIndexOf("{")
        );
        const open_char =
          open_i > closed_i
            ? line
                .charAt(open_i)
                .replace("(", ")")
                .replace("[", "]")
                .replace("{", "}")
            : "";

        // Remove closed char
        line =
          line.substring(0, closed_i - 1) +
          " ;" +
          line.substring(closed_i + 3, line.length);

        // Append opening and closing char to moved position
        movedConstruct.push(line.replace("$", open_char + " ;" + closed_char));
      } else {
        movedConstruct.push(line);
      }
    });

    setOutputScript(movedConstruct.join("").replaceAll(" ;", ";\n"));
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
