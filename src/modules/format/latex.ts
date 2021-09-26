"use strict";

export function list(items: string[]): string {
  let result = "\\begin{itemize}\n";

  for (let i = 0; i < items.length; i++) {
    result += "  \\item " + items[i] + "\n";
  }

  result += "\\end{itemize}\n\n";

  return result;
}

export function namedList(items: { header: string, content: string }[]): string {
  let result = "\\begin{itemize}\n";

  for (let i = 0; i < items.length; i++) {
    result += `  \\item \\textbf{${items[i].header}} ${items[i].content}\n`;
  }

  result += "\\end{itemize}\n\n";

  return result;
}

export function section(text: string): string {
  let result = `\\section{${text}}\n\n`;

  return result;
}

export function subsection(text: string): string {
  let result = `\\subsection{${text}}\n\n`;

  return result;
}

export function subsubsection(text: string): string {
  let result = `\\subsubsection{${text}}\n\n`;

  return result;
}

export function paragraph(text: string): string {
  let result = `\\paragraph{${text}}\n\n`;

  return result;
}
