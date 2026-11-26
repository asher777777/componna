# Strict UTF-8 Encoding Rule (No BOM, No UTF-16)

1. **Mandatory Encoding**: All source files (`.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.css`, `.html`, `.json`, `.md`) in this project MUST be saved as **UTF-8 (without BOM)**.
2. **Forbidden Encodings**: Never save files as **UTF-16 (LE/BE)** or with a UTF-8 BOM (`0xEF 0xBB 0xBF`), as `vite:esbuild` and Node ESM fail on UTF-16 / null-byte files (`ERROR: Unexpected ""`).
3. **PowerShell Safety**: On Windows PowerShell 5.1, `Out-File` and `>` default to UTF-16LE. Never use `Out-File` or `>` to write source code; always use `write_file`/`edit_file` tools, Node (`fs.writeFileSync(path, content, 'utf8')`), or `[System.IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding $false))`.
4. **Verification**: Enforce `charset = utf-8` via `.editorconfig` at the repository root and verify builds with `npm run build`.
