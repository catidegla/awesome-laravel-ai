# Contributing

Thanks for helping keep this current. The ecosystem moves fast and things go stale quickly, so corrections are as welcome as additions.

## Adding a package

Edit [`data/packages.json`](data/packages.json). That is the only file you need to touch.

```jsonc
{
  "packagist": "vendor/package",
  "category": "agents",
  "summary": "One sentence. What it does and when you would reach for it.",
  "badge": "popular"
}
```

| Field | Required | Notes |
| :--- | :--- | :--- |
| `packagist` | yes | The `vendor/package` name exactly as it appears on Packagist. Everything else is looked up from it. |
| `category` | yes | One of the ids in the `categories` array at the top of the file. |
| `summary` | yes | 20 to 240 characters, ends with a full stop. |
| `badge` | no | `official` for first-party packages, `popular` for the obvious default in a category. Use sparingly. |

You do not add stars, install counts, or the repository URL. Those get resolved from the APIs on every run, which is the whole point.

**Do not edit the tables in `README.md`.** They sit between the `LIST:START` and `LIST:END` markers and get overwritten by the next scheduled refresh.

## What gets accepted

1. It is on Packagist and actually installable.
2. It has had a commit in the last twelve months.
3. It is genuinely about AI, LLMs, agents, or MCP. A package with one AI-flavoured helper method buried inside it does not count.
4. It is not a fork or a rename of something already listed.

Self-promotion is fine. Say so in the PR description, and hold your own package to the same bar.

## What gets removed

The scheduled job flags anything archived on GitHub, marked abandoned on Packagist, or without a commit for over a year. Flagged entries get an inline marker first, then removed if nothing changes. Five packages were cut before the first release on these grounds.

If a listed package is dead and the job has not caught it yet, open an issue.

## Running the tooling

Node 20 or newer. No dependencies to install.

```bash
# Structural checks, no network. Run this first.
node scripts/validate.mjs

# Resolve every package against Packagist and GitHub.
GITHUB_TOKEN=$(gh auth token) node scripts/refresh.mjs

# Regenerate the README tables from the data.
node scripts/render.mjs
```

`refresh.mjs` exits non-zero if any package fails to resolve. Pass `--lenient` while you are working locally if you want warnings instead.

CI runs `validate.mjs` and `refresh.mjs` on every pull request, so a typo in a package name fails the build rather than reaching the list.

## Style

- Write summaries in plain language. Say what the thing does, not how transformative it is.
- No em dashes. The validator rejects them.
- Compare honestly. "Predates the official package and still ships features it lacks" is useful. "Blazing fast" is not.
