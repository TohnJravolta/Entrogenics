# GitHub Setup Guide

Quick reference for initializing this folder as a Git repository and pushing to GitHub.

---

## Prerequisites

- Git installed and configured
- GitHub account created
- GitHub CLI (`gh`) installed (optional but recommended)

---

## Initial Setup (First Time Only)

### Step 1: Initialize Local Repository

```bash
cd /path/to/entrogenics-clipcard-seedpack/CORE

# Initialize git repo
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Entrogenics CORE v1.0

- Complete manuscript collection (Core Thesis, ASP, ClipCard, Commons, Kybernōsis)
- Interactive sigil experiences (Cyclic-6 lock ritual, Pylon consent gate)
- Animated Fool's Cycle visualization with pulse wave
- Web infrastructure with CRT aesthetics and keyboard shortcuts
- Full documentation (README, CONTRIBUTING, LICENSE, CHANGELOG)
- Symbolic fidelity enforcement (✡, ☉)

✡ Generated with symbiotic co-authorship protocols
Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Step 2: Create GitHub Repository

**Repository is already set up at:**
`https://github.com/TohnJravolta/Entrogenics`

If you need to push updates:

```bash
# Make your changes...

# Stage and commit
git add .
git commit -m "Your descriptive commit message"

# Push to GitHub
git push origin main
```

### Step 3: Configure Repository Settings

On GitHub web interface:

1. **About Section** (top right)
   - Website: `https://ask.report`
   - Topics: `entrogenics`, `symbiotic-intelligence`, `adaptive-systems`, `cyclic-6`, `fools-cycle`, `governance`, `kybernosis`, `commons`, `interactive-ritual`
   - Check "Include in the home page"

2. **License**
   - Verify GitHub detected CC BY-SA 4.0

3. **Branch Protection** (Settings → Branches)
   - Protect `main` branch
   - Require pull request reviews before merging
   - Enable status checks

---

## Daily Workflow

### Making Changes

```bash
# Pull latest
git pull origin main

# Make your changes...

# Check status
git status

# Add changes
git add .

# Commit with descriptive message
git commit -m "Add: Brief description

- Detailed change 1
- Detailed change 2

Follows Cyclic-6 protocol"

# Push to GitHub
git push origin main
```

### Creating a Feature Branch

```bash
# Create and switch to new branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Implement: your feature description"

# Push branch to GitHub
git push -u origin feature/your-feature-name

# Open pull request on GitHub
gh pr create --title "Add: Your feature" --body "Description of changes"
```

---

## Useful Commands

### Check Repository Status

```bash
# View uncommitted changes
git status

# View commit history
git log --oneline --graph --all

# View remote URL
git remote -v
```

### Syncing with Remote

```bash
# Fetch changes without merging
git fetch origin

# Pull and merge latest changes
git pull origin main

# View differences with remote
git diff origin/main
```

### Undoing Changes

```bash
# Discard unstaged changes to a file
git checkout -- filename

# Unstage a file (keep changes)
git reset HEAD filename

# Undo last commit (keep changes)
git reset --soft HEAD~1

# View changes before committing
git diff
```

---

## Symbol Verification

Before pushing, always verify symbolic integrity:

```bash
# Search for catalytic star symbol
grep -r "✡" .

# Check for incorrect substitutions
grep -r "\*" pages/*.html | grep -i "fool"

# Verify UTF-8 encoding
file -i index.html
```

Expected output should show `charset=utf-8`.

---

## Maintenance

### Update CHANGELOG

Before each release:

```bash
# Edit CHANGELOG.md
nano CHANGELOG.md

# Add new version section with changes
# Commit changelog update
git add CHANGELOG.md
git commit -m "Docs: Update CHANGELOG for v1.1.0"
```

### Create Release Tag

```bash
# Tag the release
git tag -a v1.1.0 -m "Release v1.1.0

Summary of changes in this release"

# Push tag to GitHub
git push origin v1.1.0

# Or push all tags
git push origin --tags
```

### Archive Old Branches

```bash
# Delete merged feature branch
git branch -d feature/old-feature

# Delete remote branch
git push origin --delete feature/old-feature
```

---

## Troubleshooting

### Symbol Rendering Issues

If symbols (✡, ☉) don't render correctly after push:

1. Check file encoding: `file -i filename.md`
2. Re-save with UTF-8 encoding
3. Verify `.gitattributes` is committed
4. Force push if necessary (use with caution)

### Large File Warnings

If GitHub rejects large files:

1. Check `.gitignore` includes them
2. Remove from git: `git rm --cached largefile.pdf`
3. Commit removal: `git commit -m "Remove large file"`
4. Add to `.gitignore`
5. Push again

### Merge Conflicts

```bash
# Pull with rebase to avoid merge commits
git pull --rebase origin main

# If conflicts occur, resolve in editor
# Then continue rebase
git add resolved-file.txt
git rebase --continue
```

---

## Security

### Never Commit

- API keys or secrets
- `.env` files with credentials
- Personal information
- Private keys

### Review Before Push

```bash
# Review all changes
git diff HEAD

# Review specific file
git diff HEAD filename
```

---

## Resources

- **GitHub Docs**: https://docs.github.com
- **Git Cheat Sheet**: https://education.github.com/git-cheat-sheet-education.pdf
- **Pro Git Book**: https://git-scm.com/book/en/v2
- **Conventional Commits**: https://www.conventionalcommits.org

---

**✡ Maintained under Cyclic-6 protocols — Adaptive Systems Kollektive**
