# How to Set Up GitHub Wiki

## Option 1: Enable GitHub Wiki (Recommended)

GitHub wikis are separate git repositories. To set up:

1. **Enable Wiki in Repository Settings**
   - Go to your repository: https://github.com/satriyobud/Open360
   - Click **Settings** → **Features**
   - Enable **Wikis**
   - Click **Save**

2. **Clone the Wiki Repository**
   ```bash
   git clone https://github.com/satriyobud/Open360.wiki.git
   cd Open360.wiki
   ```

3. **Copy Documentation Files**
   ```bash
   # Copy files from docs/ folder
   cp ../Open360/docs/*.md .
   ```

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "Initial wiki documentation"
   git push origin master
   ```

5. **Access Your Wiki**
   - Visit: https://github.com/satriyobud/Open360/wiki

## Option 2: Use Docs Folder (Already in Repo)

The `docs/` folder is already committed to the main repository. You can:
- View files directly on GitHub: https://github.com/satriyobud/Open360/tree/main/docs
- Link to them in README.md
- Use GitHub Pages to render them (if needed)

## Wiki Files Included

- **Home.md** - Main landing page
- **Getting-Started.md** - Quick start guide
- **Installation-Guide.md** - Detailed installation
- **API-Reference.md** - API documentation
- **Contributing.md** - How to contribute
- **Troubleshooting.md** - Common issues

## Wiki Features

GitHub wikis support:
- Markdown formatting
- Internal links using `[[Page Name]]`
- Sidebar customization
- Version history

For more info: https://docs.github.com/en/communities/documenting-your-project-with-wikis

