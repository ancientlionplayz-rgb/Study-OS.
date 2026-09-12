'use client';

import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) return null;

  // Split content into blocks: code blocks, tables, headings, paragraphs, lists
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className={`space-y-3.5 text-text-primary text-sm leading-relaxed ${className}`}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'code':
            return (
              <CodeBlock
                key={idx}
                language={block.language || 'text'}
                code={block.content}
              />
            );
          case 'diagram':
            return (
              <DiagramBlock
                key={idx}
                content={block.content}
              />
            );
          case 'heading1':
            return (
              <h1 key={idx} className="text-xl sm:text-2xl font-black text-text-primary tracking-tight mt-5 mb-2 pt-2 border-b border-border-default pb-1.5">
                <InlineText text={block.content} />
              </h1>
            );
          case 'heading2':
            return (
              <h2 key={idx} className="text-lg sm:text-xl font-bold text-text-primary tracking-tight mt-4 mb-2">
                <InlineText text={block.content} />
              </h2>
            );
          case 'heading3':
            return (
              <h3 key={idx} className="text-base font-bold text-text-primary tracking-tight mt-3 mb-1 text-primary">
                <InlineText text={block.content} />
              </h3>
            );
          case 'heading4':
            return (
              <h4 key={idx} className="text-sm font-bold text-text-primary mt-2 mb-1">
                <InlineText text={block.content} />
              </h4>
            );
          case 'blockquote':
            return (
              <blockquote key={idx} className="p-3.5 my-2 border-l-4 border-primary bg-primary-soft/30 rounded-r-xl text-text-secondary italic text-xs leading-relaxed">
                <InlineText text={block.content} />
              </blockquote>
            );
          case 'table':
            return (
              <div key={idx} className="my-3 overflow-x-auto rounded-xl border border-border-default">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-muted border-b border-border-default text-text-primary font-bold">
                      {block.headers.map((h: string, hIdx: number) => (
                        <th key={hIdx} className="p-2.5">
                          <InlineText text={h} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default">
                    {block.rows.map((row: string[], rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-surface-muted/40 transition-colors">
                        {row.map((cell: string, cIdx: number) => (
                          <td key={cIdx} className="p-2.5 text-text-secondary">
                            <InlineText text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case 'ul':
            return (
              <ul key={idx} className="space-y-1.5 my-2 pl-2">
                {block.items.map((item: string, iIdx: number) => (
                  <li key={iIdx} className="flex items-start gap-2 text-text-secondary text-xs sm:text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span className="flex-1 leading-relaxed">
                      <InlineText text={item} />
                    </span>
                  </li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={idx} className="space-y-1.5 my-2 pl-2">
                {block.items.map((item: string, iIdx: number) => (
                  <li key={iIdx} className="flex items-start gap-2.5 text-text-secondary text-xs sm:text-sm">
                    <span className="font-mono text-xs font-bold text-primary shrink-0 w-5">
                      {iIdx + 1}.
                    </span>
                    <span className="flex-1 leading-relaxed">
                      <InlineText text={item} />
                    </span>
                  </li>
                ))}
              </ol>
            );
          case 'math_display':
            return (
              <div key={idx} className="my-2.5 p-3 rounded-xl bg-surface-muted/80 border border-border-default text-center font-mono text-sm sm:text-base font-bold text-primary overflow-x-auto">
                {formatMathFormula(block.content)}
              </div>
            );
          case 'paragraph':
          default:
            return (
              <p key={idx} className="text-text-secondary leading-relaxed text-xs sm:text-sm">
                <InlineText text={block.content} />
              </p>
            );
        }
      })}
    </div>
  );
}

function InlineText({ text }: { text: string }) {
  if (!text) return null;

  // Handle inline math $...$
  const mathParts = text.split(/(\$[^\$]+\$)/g);

  return (
    <>
      {mathParts.map((part, mIdx) => {
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          const formula = part.slice(1, -1);
          return (
            <span
              key={mIdx}
              className="px-1.5 py-0.5 mx-0.5 rounded font-mono text-xs font-bold bg-primary-soft text-primary border border-primary-border inline-block"
            >
              {formatMathFormula(formula)}
            </span>
          );
        }

        // Parse bold, italics, inline code inside standard text
        return <span key={mIdx}>{renderFormattedSegments(part)}</span>;
      })}
    </>
  );
}

function renderFormattedSegments(text: string) {
  // Regex to split by bold (**text**), code (`code`), and italics (*text*)
  const tokens = text.split(/(\*\*[^\*]+\*\*|`[^`]+`|\*[^*]+\*)/g);

  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return (
        <strong key={idx} className="font-bold text-text-primary">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 rounded font-mono text-[11px] sm:text-xs bg-surface-muted text-primary font-semibold border border-border-default"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      return (
        <em key={idx} className="italic text-text-secondary">
          {token.slice(1, -1)}
        </em>
      );
    }
    return token;
  });
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg">
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400">
        <span className="font-mono text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5" />
          {language || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 font-mono text-xs text-slate-100 overflow-x-auto leading-relaxed">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
}

function DiagramBlock({ content }: { content: string }) {
  return (
    <div className="my-3 rounded-xl border border-emerald-900/40 bg-slate-950 p-4 shadow-lg overflow-hidden">
      <div className="text-[10px] font-mono uppercase font-bold text-emerald-400 mb-2 tracking-wider flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Structured Concept Diagram</span>
      </div>
      <pre className="font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed">
        {content.trim()}
      </pre>
    </div>
  );
}

function formatMathFormula(raw: string): string {
  return raw
    .replace(/\\frac\{([^\}]+)\}\{([^\}]+)\}/g, '($1 / $2)')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\approx/g, '≈')
    .replace(/\\pm/g, '±')
    .replace(/\\le/g, '≤')
    .replace(/\\ge/g, '≥')
    .replace(/\\to/g, '→')
    .replace(/\\implies/g, '⇒')
    .replace(/\\pi/g, 'π')
    .replace(/\\theta/g, 'θ')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\sqrt\{([^\}]+)\}/g, '√($1)')
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .replace(/\^([0-9]+)/g, '^$1')
    .replace(/\\text\{([^\}]+)\}/g, ' $1 ')
    .trim();
}

function parseMarkdownBlocks(text: string): any[] {
  const lines = text.split(/\r?\n/);
  const blocks: any[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 1. Code Block (\`\`\`)
    if (line.trim().startsWith('```')) {
      const language = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // Skip closing ```
      blocks.push({
        type: 'code',
        language,
        content: codeLines.join('\n'),
      });
      continue;
    }

    // 2. Display Math ($$ ... $$)
    if (line.trim().startsWith('$$')) {
      const mathLines: string[] = [];
      if (line.trim().endsWith('$$') && line.trim().length > 4) {
        blocks.push({
          type: 'math_display',
          content: line.trim().slice(2, -2).trim(),
        });
        i++;
        continue;
      }
      i++;
      while (i < lines.length && !lines[i].trim().endsWith('$$')) {
        mathLines.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({
        type: 'math_display',
        content: mathLines.join(' '),
      });
      continue;
    }

    // 3. Headings
    if (line.startsWith('#### ')) {
      blocks.push({ type: 'heading4', content: line.slice(5).trim() });
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push({ type: 'heading3', content: line.slice(4).trim() });
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push({ type: 'heading2', content: line.slice(3).trim() });
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      blocks.push({ type: 'heading1', content: line.slice(2).trim() });
      i++;
      continue;
    }

    // 4. Blockquotes (> ...)
    if (line.startsWith('> ')) {
      const quoteLines: string[] = [line.slice(2).trim()];
      i++;
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2).trim());
        i++;
      }
      blocks.push({ type: 'blockquote', content: quoteLines.join(' ') });
      continue;
    }

    // 5. Tables (| ... |)
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length >= 2) {
        const headers = tableLines[0]
          .split('|')
          .map((c) => c.trim())
          .filter(Boolean);
        // tableLines[1] is separator |---|---|
        const rows = tableLines.slice(2).map((rowLine) =>
          rowLine
            .split('|')
            .map((c) => c.trim())
            .filter(Boolean)
        );
        blocks.push({ type: 'table', headers, rows });
      }
      continue;
    }

    // 6. Unordered List (- or *)
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const items: string[] = [line.trim().slice(2).trim()];
      i++;
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        items.push(lines[i].trim().slice(2).trim());
        i++;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    // 7. Ordered List (1. ...)
    if (/^[0-9]+\.\s/.test(line.trim())) {
      const items: string[] = [line.trim().replace(/^[0-9]+\.\s/, '').trim()];
      i++;
      while (i < lines.length && /^[0-9]+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[0-9]+\.\s/, '').trim());
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    // Empty line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Standard Paragraph
    const pLines: string[] = [line.trim()];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('- ') &&
      !lines[i].trim().startsWith('* ') &&
      !lines[i].trim().startsWith('> ') &&
      !lines[i].trim().startsWith('|') &&
      !/^[0-9]+\.\s/.test(lines[i].trim())
    ) {
      pLines.push(lines[i].trim());
      i++;
    }
    blocks.push({ type: 'paragraph', content: pLines.join(' ') });
  }

  return blocks;
}
