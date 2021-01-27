# Project Docs

### Scss file auto format setting

##### in keybindings.json(vscode config)

```json
[
  ...
  {
    "key": "alt+shift+f",
    "command": "stylelint.executeAutofix",
    "when": "editorTextFocus && editorLangId == 'scss'"
  }
]
```