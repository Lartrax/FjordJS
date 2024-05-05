import {
  createEffect,
  createSignal,
  For,
  Show,
  type Component,
} from "solid-js";

const templates: { name: string; content: string }[] = [
  {
    name: "99 Bottles",
    content: `La tallet være 99.

    Konstant utsagn bruker tall, gjør så 
    Konstant mindre er tall minus 1,
    Loggfør tall plus " bottles of beer on the wall\\n" plus tall plus " bottles of beer\\ntake one down pass it around\\n" plus mindre plus " bottles of beer on the wall".
    
    Imens tallet overgår 0, så 
    utsagn med tallet,
    tallet er tallet minus 1.`,
  },
  {
    name: "Bil på motorvei",
    content: `: En bil kjører nedover en motorvei i 80 km/t.
La fart være 80.

: Bilen sakker ned med: 2 km/t hvert sekund.

La sekund være 0.

Imens fart overgår 40, så
sekund er sekund plus 1,
fart er fart minus 2.

: Hvor lang tid tar det før farten dens er 40 km/t?

Loggfør "Det tar " plus sekund plus " sekunder før bilen har sakket ned til 40 km/t".`,
  },
  {
    name: "..",
    content: "",
  },
  {
    name: "...",
    content: "",
  },
];

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
  alternativt: "else",
  ellers: "else {",
  loggfør: "console.log(",
  imens: "while (",
  plus: "+",
  minus: "-",
  bruker: " = (",
  gjør: "=>",
  med: "(",
  ":": "//",
};

const App: Component = () => {
  const [inputScript, setInputScript] = createSignal<string>(
    `La tallet være 99.

Konstant utsagn bruker tall, gjør så 
Konstant mindre er tall minus 1,
Loggfør tall plus " bottles of beer on the wall\\n" plus tall plus " bottles of beer\\ntake one down pass it around\\n" plus mindre plus " bottles of beer on the wall".

Imens tallet overgår 0, så 
utsagn med tallet,
tallet er tallet minus 1.`
  );
  const [outputScript, setOutputScript] = createSignal<string>("");
  const [activeTemplate, setActiveTemplate] = createSignal(templates[0]);
  const [dropped, setDropped] = createSignal<boolean>(false);

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
      const symbols = symbolStack
        .reverse()
        .join("")
        .replaceAll("(", " )")
        .replaceAll("{", "}");

      // Push line to symbolizedText after replacing punctuation with closing brackets
      symbolizedText.push(
        line.replace("µ", symbols).replace("§", symbols + ";")
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
            section.slice(0, stopper + 1).replaceAll("µ", "µ;") +
            "$;" +
            section.slice(stopper + 1, section.length);
        }
      }
      boxesArray[i] = section;
    });

    const punctuated = format(boxesArray.join(""), /(?<=[µ§])/g);

    setOutputScript(
      punctuated
        .replaceAll("?", ";")
        .replaceAll("; else", "\nelse")
        .replaceAll("{", "{\n") // Formatting
        .replaceAll("}", "\n}") // Formatting
        .replaceAll("£", "{\n") // Switch "så" with "{"
        .replaceAll("$", "}") // Switch "så" stopper with "}"
        .replaceAll(";", ";\n") // Formatting
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
        "padding-left": "1rem",
        "padding-right": "1rem",
        background: "#333",
      }}
    >
      <div
        style={{ border: "1px solid #555", "margin-top": "1rem" }}
        onClick={() => setDropped((d) => !d)}
      >
        <p
          style={{
            color: "#eee",
            "padding-left": "1rem",
            cursor: "pointer",
            "user-select": "none",
          }}
        >
          {activeTemplate().name}
        </p>
        <Show when={dropped()}>
          <span
            style={{
              position: "fixed",
              width: "100%",
              background: "#666",
            }}
          >
            <For each={templates}>
              {(template, _) => (
                <p
                  style={{
                    color: "#ddd",
                    "padding-left": "1rem",
                    cursor: "pointer",
                    "user-select": "none",
                  }}
                  onClick={() => {
                    setActiveTemplate(template);
                    setInputScript(template.content);
                  }}
                >
                  {template.name}
                </p>
              )}
            </For>
          </span>
        </Show>
      </div>
      <textarea
        style={{
          height: "40vh",
          padding: "1rem",
          "font-size": "1.5rem",
          "word-break": "break-word",
          background: "#555",
          color: "#eee",
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
          background: "#666",
          color: "#ddd",
        }}
      >
        {outputScript()}
      </textarea>
      <button
        style={{ height: "5vh", "margin-bottom": "1rem" }}
        onClick={() => eval(outputScript())}
      >
        Kjør koden
      </button>
    </div>
  );
};

export default App;
