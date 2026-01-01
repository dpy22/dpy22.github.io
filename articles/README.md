# Articles System

This directory contains all articles for the website. Each article is stored in its own folder.

## Structure

```
articles/
├── articles.json          # Article index file
├── article-folder-1/
│   ├── content.md         # Markdown article (if type is "markdown")
│   └── index.html         # HTML article (if type is "html")
└── article-folder-2/
    └── ...
```

## Adding a New Article

### Step 1: Create Article Folder

Create a new folder with a descriptive name (e.g., `my-new-article`).

### Step 2: Add Article Content

Choose one of the following formats:

#### Option A: Markdown (Recommended for simple articles)

Create `content.md` in your article folder:

```markdown
# Article Title

Your article content here.

## Section 1

More content...

- List item 1
- List item 2

> A quote
```

#### Option B: HTML (For articles with interactive elements)

Create `index.html` in your article folder:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Article Title</title>
</head>
<body>
    <article>
        <p>Your article content here.</p>
        <h2>Section 1</h2>
        <p>More content...</p>
        <button onclick="alert('Interactive!')">Click me</button>
    </article>
</body>
</html>
```

**Note:** For HTML articles, wrap your content in an `<article>` tag. The system will extract this content automatically.

### Step 3: Update articles.json

Add your article to `articles/articles.json`:

```json
{
    "id": "my-new-article",
    "title": "My New Article",
    "date": "March 20, 2024",
    "excerpt": "A brief description of the article.",
    "type": "markdown",
    "folder": "my-new-article"
}
```

**Fields:**
- `id`: Unique identifier (usually matches folder name)
- `title`: Article title
- `date`: Publication date
- `excerpt`: Short description shown in article list
- `type`: Either `"markdown"` or `"html"`
- `folder`: Folder name containing the article

## Markdown Support

The Markdown parser supports:

- Headers (`#`, `##`, `###`, `####`)
- **Bold** (`**text**`)
- *Italic* (`*text*`)
- Links (`[text](url)`)
- Lists (unordered `-` and ordered `1.`)
- Blockquotes (`> quote`)
- Inline code (`` `code` ``)
- Code blocks (``` code ```)
- **Images:** `![alt text](image-url "optional title")`
- **Math Formulas:**
  - Inline math: `$formula$` (e.g., `$E = mc^2$`)
  - Block math: `$$formula$$` (displayed centered)

### Image Examples

```markdown
![Description](https://example.com/image.png)
![Local Image](./image.png "Optional title")
```

### Math Formula Examples

```markdown
Inline: $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$

Block:
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

**Note:** Math formulas are rendered using KaTeX. Make sure you have internet access for KaTeX to load, or host KaTeX files locally.

## Examples

See the existing articles for examples:
- `minimalist-design/` - Markdown article
- `web-architecture/` - HTML article with interactive elements
- `philosophy-of-code/` - Markdown article

## Tips

1. Use Markdown for simple text-based articles
2. Use HTML for articles that need interactive elements, custom styling, or complex layouts
3. Keep folder names simple and descriptive
4. Update `articles.json` in reverse chronological order (newest first)
