import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ParsedCode {
  html: string;
  css: string;
  js: string;
}

export function parseCombinedCode(combinedCode: string): ParsedCode {
  if (!combinedCode) {
    return { html: '', css: '', js: '' };
  }

  let html = '';
  let css = '';
  let js = '';

  // Extract CSS from <style> tags
  const styleMatch = combinedCode.match(/<style[^>]*>([\s\S]*?)<\/style>/im);
  if (styleMatch && styleMatch[1]) {
    css = styleMatch[1].trim();
  }

  // Extract JS from <script> tags (not type="application/json" or other data scripts)
  // This regex tries to be more specific about script tags meant for JS execution.
  const scriptMatches = combinedCode.matchAll(/<script(?![^>]*type\s*=\s*(['"])(?:application\/(?:ld\+)?json|text\/template)\1)[^>]*>([\s\S]*?)<\/script>/gim);
  let jsParts = [];
  for (const match of scriptMatches) {
    if (match[2]) {
      jsParts.push(match[2].trim());
    }
  }
  js = jsParts.join('\n\n');


  // Extract HTML from <body> tag, or use the whole string if no body tag
  const bodyMatch = combinedCode.match(/<body[^>]*>([\s\S]*?)<\/body>/im);
  if (bodyMatch && bodyMatch[1]) {
    html = bodyMatch[1].trim();
    // Remove script and style tags from HTML body as they are extracted separately
    html = html.replace(/<script(?![^>]*type\s*=\s*(['"])(?:application\/(?:ld\+)?json|text\/template)\1)[^>]*>([\s\S]*?)<\/script>/gim, '');
    html = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gim, '');
  } else {
    // If no body tag, attempt to use the whole thing minus script/style sections already parsed.
    // This is a fallback and might not be perfect.
    html = combinedCode
      .replace(/<style[^>]*>([\s\S]*?)<\/style>/im, '')
      .replace(/<script(?![^>]*type\s*=\s*(['"])(?:application\/(?:ld\+)?json|text\/template)\1)[^>]*>([\s\S]*?)<\/script>/gim, '')
      .replace(/<head[^>]*>[\s\S]*?<\/head>/im, '') // Remove head
      .replace(/<html[^>]*>/im, '') // Remove <html>
      .replace(/<\/html>/im, '') // Remove </html>
      .trim();
  }
  
  return { html, css, js };
}

export function formatCodeForIteration(html: string, css: string, js: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Game</title>
    <style>
${css}
    </style>
</head>
<body>
${html}
    <script>
${js}
    </script>
</body>
</html>
  `.trim();
}
