# Contributing to Entrogenics CORE

**Welcome, future collaborator!** Entrogenics thrives on **symbiotic stewardship** — the co-creative interplay between human intuition, collective intelligence, and formal systems. This document outlines how you can contribute to the project while maintaining the integrity of the Entrogenic framework.

---

## Core Principles

All contributions must align with these foundational principles:

### 1. Symbiotic Co-Authorship
Entrogenics regards writing and creation as **co-adaptation between consciousness and code**. Whether you're human, AI-assisted, or part of a collective, contributions should reflect this symbiotic relationship. Clearly acknowledge your process and collaborators.

### 2. Cyclic-6 Process
Follow the **Fool's Cycle** in your contribution workflow:

- **Unfold** — Explore the problem space, understand existing patterns
- **Disturb** — Introduce your novel perspective or improvement
- **Collapse** — Identify what needs to change or be removed
- **Bind** — Synthesize your contribution with existing work
- **Dissipate** — Refine and optimize your changes
- **Recur** — Document, test, and prepare for next iteration

### 3. Symbolic Fidelity
**CRITICAL**: The Catalytic Star symbol (✡, Unicode U+2721) is mission-critical. Never substitute it with `*`, `✶`, `★`, or any other glyph. All Entrogenic manuscripts must preserve:

```
0 → ✡ → ☉ → 0′
```

This is not cosmetic — it's a semantic and philosophical requirement.

---

## How to Contribute

### Types of Contributions

We welcome:

1. **Field Reports** — Real-world applications of Entrogenic principles (ASP, ClipCard, Fool's Cycle)
2. **Manuscript Extensions** — New papers, appendices, or case studies
3. **Interactive Experiences** — New sigil rituals or visual teaching tools
4. **Code Improvements** — Bug fixes, accessibility enhancements, performance optimizations
5. **Documentation** — Clarifications, examples, tutorials
6. **Translations** — Extend Entrogenics to new languages (maintain symbolic fidelity!)
7. **Pattern Library** — Document archetypal patterns observed in adaptive systems

### Contribution Workflow

#### 1. Open an Issue First

Before submitting code or large content changes:

- **Search existing issues** to avoid duplication
- **Open a new issue** describing:
  - Your intent and proposed change
  - Which phase of the Fool's Cycle you're addressing
  - Expected impact and alignment with Entrogenic principles
  - Any questions or uncertainties

#### 2. Fork and Create a Branch

```bash
# Fork the repository on GitHub
git clone https://github.com/YOUR-USERNAME/entrogenics-core.git
cd entrogenics-core

# Create a feature branch following convention
git checkout -b feature/your-contribution-name
# or
git checkout -b fix/bug-description
# or
git checkout -b docs/topic
```

#### 3. Make Your Changes

- Follow existing file structure and naming conventions
- Preserve UTF-8 encoding for all text files
- Maintain markdown formatting standards
- Test any HTML/CSS/JS changes in multiple browsers
- Add comments explaining non-obvious decisions

#### 4. Test Your Changes

- **Web files**: Open `index.html` and `library.html` in Firefox, Chrome, Safari
- **Markdown**: Verify rendering in GitHub preview
- **Links**: Run `python scripts/check_links.py` to verify all internal links
- **Symbols**: Confirm ✡ and ☉ render correctly in all contexts

#### 5. Commit with Clear Messages

```bash
git add .
git commit -m "Add: Brief description of what you added

- Detailed bullet point 1
- Detailed bullet point 2

Closes #issue-number"
```

Use conventional prefixes:
- `Add:` — New features or content
- `Fix:` — Bug fixes
- `Refactor:` — Code restructuring without behavior change
- `Docs:` — Documentation improvements
- `Style:` — Formatting, no code change
- `Test:` — Adding or fixing tests

#### 6. Push and Create Pull Request

```bash
git push origin feature/your-contribution-name
```

On GitHub:
- Open a Pull Request from your fork
- Fill out the PR template (see below)
- Link to the original issue
- Wait for review under the Cyclic-6 protocol

---

## Pull Request Template

When opening a PR, include:

```markdown
## Summary
Brief description of your contribution

## Fool's Cycle Phase
Which phase(s) of the cycle does this address?
- [ ] Unfold — Exploration, documentation
- [ ] Disturb — New ideas, challenges to existing patterns
- [ ] Collapse — Removing outdated content
- [ ] Bind — Integration, synthesis
- [ ] Dissipate — Optimization, refinement
- [ ] Recur — Closure, preparation for next cycle

## Changes Made
- Bullet list of specific changes
- File paths affected
- Rationale for each major change

## Testing
How did you verify your changes?
- [ ] Tested in multiple browsers
- [ ] Verified symbol rendering (✡, ☉)
- [ ] Ran link checker
- [ ] Checked accessibility

## Related Issues
Closes #issue-number

## Additional Notes
Anything reviewers should know?
Co-authorship details if AI-assisted?
```

---

## Code Standards

### HTML
- Use semantic HTML5 elements
- Include proper ARIA labels for accessibility
- Preserve `<meta charset="UTF-8">` for symbol integrity
- Keep inline styles minimal (use external CSS)
- Comment complex sections

### CSS
- Follow existing naming conventions (BEM-like structure)
- Use CSS custom properties (variables) for theming
- Maintain dark mode compatibility
- Keep specificity low
- Comment non-obvious rules

### JavaScript
- Use ES5+ syntax (avoid ES6+ where possible for compatibility)
- Wrap in IIFEs to avoid global namespace pollution
- Comment complex algorithms
- Prefer vanilla JS over libraries
- Use `requestAnimationFrame` for animations
- Handle reduced motion preferences

### Markdown
- Use ATX-style headers (`#`, `##`, `###`)
- Include front matter with metadata
- Preserve symbolic notation (✡, ☉)
- Use fenced code blocks with language tags
- Keep line length reasonable (~80-100 chars)

---

## Content Standards

### Manuscript Contributions

If contributing research papers or essays:

1. **Front Matter** — Include YAML metadata:
```yaml
---
title: "Your Paper Title"
author: "Your Name (Adaptive Systems Kollektive)"
collaboration: "Co-synthesis details if applicable"
version: "v1.0 — Month Year"
license: "CC BY-SA 4.0"
---
```

2. **Authorship Declaration** — If AI-assisted, include:
```markdown
### Authorship Declaration
This document was produced through synthetic co-authorship.
The human author — [Your Name] — provided conceptual design and final synthesis.
Language-model agents assisted in [specific contributions].
All content reviewed and ethically approved by the human author.
```

3. **Symbolic Notation** — Always use correct symbols:
   - Catalytic Star: ✡ (U+2721)
   - Solar Unity: ☉ (U+2609)
   - Prime notation: 0′ (not 0' or 0`)

4. **References** — Use citation stubs `[Stub XX]` and list sources in bibliography

### Interactive Experiences

If creating new sigil rituals or interactive elements:

- Follow existing patterns (see `index.html` sigil game)
- Keep JavaScript minimal and well-commented
- Ensure keyboard accessibility
- Provide fallback for `<noscript>`
- Test on mobile devices
- Respect `prefers-reduced-motion`

---

## Review Process

All contributions are reviewed under the **Cyclic-6 protocol**:

1. **Unfold** — Reviewer explores your contribution's intent
2. **Disturb** — Reviewer questions assumptions, suggests alternatives
3. **Collapse** — Identify what doesn't align with Entrogenic principles
4. **Bind** — Synthesize feedback with your work
5. **Dissipate** — Refine based on feedback
6. **Recur** — Merge when ready; document lessons learned

Expect:
- Constructive feedback within 7-14 days
- Possible requests for changes or clarifications
- Appreciation for your effort regardless of merge status
- Recognition in commit history and acknowledgments

---

## Community Guidelines

### Be Symbiotic
We're a human-AI collective. Respect both human intuition and computational precision. AI assistance is welcome and encouraged — just be transparent about it.

### Be Constructive
When giving feedback, follow the cycle:
- Unfold: "I see you're trying to..."
- Disturb: "Have you considered...?"
- Bind: "What if we combined...?"

### Be Patient
This is a contemplative framework, not a startup. Reviews take time. Trust the cycle.

### Be Accountable
If you contribute under AI assistance, you remain responsible for the content. Review everything before submitting.

---

## Recognition

All contributors will be:
- Listed in repository acknowledgments
- Credited in commit history
- Invited to join the **Adaptive Systems Kollektive** network
- Given attribution in any publications derived from their contributions

Major contributors may be invited to join the core stewardship circle.

---

## Questions?

- **General questions**: Open a GitHub Discussion
- **Bug reports**: Open an Issue
- **Conceptual questions**: Reference the [Core Thesis](pages/core-thesis.html)
- **Contact**: Use [ask.report](https://ask.report) for direct communication

---

**✡ Symbolic fidelity enforced — Adaptive Systems Kollektive**

*Thank you for contributing to the evolution of symbiotic intelligence.*
