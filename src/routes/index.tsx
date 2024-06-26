import { Title } from "@solidjs/meta";
import { createEffect, createSignal, For, Show } from "solid-js";

const templates: { name: string; content: string }[] = [
  {
    name: "99 Bottles",
    content: `La tallet være 99.

Konstant utsagn bruker tall, gjør så 
konstant mindre er tall - 1,
loggfør tall + " bottles of beer on the wall\\n" + tall + " bottles of beer\\ntake one down pass it around\\n" + mindre + " bottles of beer on the wall".

Imens tallet overgår 0, så 
utsagn med tallet,
tallet blir tallet - 1.`,
  },
  {
    name: "Bil på motorvei",
    content: `: En bil kjører nedover en motorvei i 80 km/t.
La fart være 80.

: Bilen sakker ned med: 2 km/t hvert sekund.

La tid være 0.

Imens fart overgår 40, så
tid blir tid + 1,
fart blir fart - 2.

: Hvor lang tid tar det før farten dens er 40 km/t?

Loggfør "Det tar " + tid + " sekunder før bilen har sakket ned til 40 km/t".`,
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
  blir: "=",
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

export default function Home() {
  const [inputScript, setInputScript] = createSignal<string>(
    templates[0].content
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
    <main
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
      <Title>FjordJS</Title>
      <div
        style={{
          border: "1px solid #555",
          "margin-top": "1rem",
        }}
      >
        <p
          style={{
            color: "#eee",
            padding: "1rem",
            "user-select": "none",
            cursor: "pointer",
          }}
          onClick={() => setDropped((d) => !d)}
        >
          {activeTemplate().name}
        </p>
        <Show when={dropped()}>
          <span
            style={{
              position: "absolute",
              width: "90%",
              display: "flex",
              "flex-direction": "column",
              gap: "1rem",
              padding: "1rem",
              background: "#666",
            }}
          >
            <For each={templates}>
              {(template, _) => (
                <p
                  style={{
                    color: "#ddd",
                    cursor: "pointer",
                    "user-select": "none",
                  }}
                  onClick={() => {
                    setActiveTemplate(template);
                    setInputScript(template.content);
                    setDropped((d) => !d);
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
        onInput={(e) => setInputScript(e.target.value)}
        value={inputScript()}
      >
        {inputScript()}
      </textarea>
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
        value={outputScript()}
      />
      <button
        style={{ height: "5vh", "margin-bottom": "1rem" }}
        onClick={() => eval(outputScript())}
      >
        Kjør koden
      </button>
    </main>
  );
}
