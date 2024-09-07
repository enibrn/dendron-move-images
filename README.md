# Dendron Move Images

## Why

When I move notes from a vault to another one using the [move note command](https://wiki.dendron.so/notes/98ywiw4211q9sx0v98lbo88/), any images in the notes had to be moved manually and then eventually removed from the first one if not referenced anymore (to clean up space).

Thats particularly unpleasant when there are a lot of notes to be moved, especially with images shared between notes (some of which need to be moved and some not).

So I built a script that does that automatically.

## Practical example

I want to move `macosx.md` note to `secondary-vault`

### Initial structure

```
primary-vault/
├── dependencies/
│   └── some-folders-in-between/
│       └── secondary-vault/
│           └── notes/
│               ├── assets/
│               │   └── images/
│               │       └── tux-wallpaper.jpg
│               ├── root.md
│               └── linux.md
└── notes/
    ├── assets/
    │   └── images/
    │       ├── bliss-wallpaper.jpg
    │       ├── sierra-wallpaper.jpg
    │       └── mac-vs-pc.jpg
    ├── root.md
    ├── windows.md
    └── macosx.md
```

#### Image references

- `windows.md`
  - `bliss-wallpaper.jpg`
  - `mac-vs-pc.jpg`
- `macosx.md`
  - `sierra-wallpaper.jpg`
  - `mac-vs-pc.jpg`
- `linux.md`
  - `tux-wallpaper.jpg`

### After dendron move note structure

```
primary-vault/
├── dependencies/
│   └── some-folders-in-between/
│       └── secondary-vault/
│           └── notes/
│               ├── assets/
│               │   └── images/
│               │       └── tux-wallpaper.jpg
│               ├── root.md
│               ├── linux.md
│               └── macosx.md
└── notes/
    ├── assets/
    │   └── images/
    │       ├── bliss-wallpaper.jpg
    │       ├── sierra-wallpaper.jpg
    │       └── mac-vs-pc.jpg
    ├── root.md
    └── windows.md
```

### After dendron move images structure

```
primary-vault/
├── dependencies/
│   └── some-folders-in-between/
│       └── secondary-vault/
│           └── notes/
│               ├── assets/
│               │   └── images/
│               │       ├── tux-wallpaper.jpg
│               │       ├── sierra-wallpaper.jpg
│               │       └── mac-vs-pc.jpg
│               ├── root.md
│               ├── linux.md
│               └── macosx.md
└── notes/
    ├── assets/
    │   └── images/
    │       ├── bliss-wallpaper.jpg
    │       └── mac-vs-pc.jpg
    ├── root.md
    └── windows.md
```

### What happened

- `sierra-wallpaper.jpg` is moved from `primary vault` to `secondary vault` and then removed from `primary vault` because not referenced anymore in any of its notes
- `mac-vs-pc.jpg` is moved from `primary vault` to `secondary vault` but it is not removed from `primary vault` because is still needed for the note `windows.md`

## How

Ideally, this script would be an npm package to be installed in the `primary-vault` project. For now I use a combination of `npm link` and `npm bin` to call the script from the `primary-vault` without installing dependencies.

### Prerequisites

- Node.js and npm (I have 20.11.1/10.2.4 on Windows 11)

### Usage

- Clone this repo
- Go to the `dendron-move-images` folder
- Link the library
  ```shell
  npm link
  ```
- Go to your dendron main vault
- Link on the other side
  ```shell
  npm link dendron-move-images
  ```
- Run command with standard settings (while still in dendron main vault)
  ```shell
  dmi
  ```

### Settings

- `l`: logs the primary-vault and secondary-vault data
- `y`: skip confirm
- `svn`: define the secondary vault name. Without this will take the first vault in dependencies as the secondary vault.

#### Example

```dmi -ly --secondary-vault=other-vault```

Will be

```json
{
  "l": true,
  "y": true,
  "secondary-vault": "other-vault"
}
```

## Todo

- Images relative path shoud be customizable
- Crashes if any folder in the path `assets/images` does not exist, it should create them instead
- More tests
- npm package
