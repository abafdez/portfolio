# Published posts

One folder per post, named like its file, with the post's images next to it:

```text
published/
  2026-10-27-design-tokens/
    2026-10-27-design-tokens.md
    tokens-diagram.png
```

Posts start in `../drafts/`, which only exists in dev. Publishing one is a move:

```sh
git mv content/blog/drafts/<slug> content/blog/published/
```
