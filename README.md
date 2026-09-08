<div align="center">

# Awesome Laravel AI

**Every actively maintained package for building AI features, agents, and MCP servers in Laravel.**

[![Awesome](https://awesome.re/badge-flat2.svg)](https://awesome.re)
[![Packages](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fcatidegla%2Fawesome-laravel-ai%2Fmain%2Fdata%2Fmetrics.json&query=%24.resolved&label=packages&color=ff2d20)](#contents)
[![Refreshed](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fcatidegla%2Fawesome-laravel-ai%2Fmain%2Fdata%2Fmetrics.json&query=%24.generatedAt&label=refreshed&color=blue)](.github/workflows/refresh.yml)
[![Health check](https://github.com/catidegla/awesome-laravel-ai/actions/workflows/refresh.yml/badge.svg)](https://github.com/catidegla/awesome-laravel-ai/actions/workflows/refresh.yml)
[![License: CC0-1.0](https://img.shields.io/badge/license-CC0--1.0-lightgrey.svg)](LICENSE)

</div>

---

The Laravel AI ecosystem went from a handful of OpenAI wrappers to something genuinely deep in about eighteen months. There are now first-party packages from the core team, several mature MCP implementations, and real competition at every layer. It is also moving fast enough that half the lists you find are already wrong.

So this one checks itself.

## Why this list is different

Every entry is resolved against the Packagist and GitHub APIs on a schedule. Star counts and install counts you see below are pulled automatically, not typed in by hand and left to rot. More importantly, the same job flags packages that get **archived**, **abandoned**, or go **quiet for over a year**, and those get marked or removed.

Five packages were dropped before the first commit for exactly that reason. A list that only grows is a list that stops being useful.

<!-- LIST:START -->

_58 packages. Figures refreshed 2026-09-08._

## Contents

- [Multi-Provider Abstractions](#multi-provider-abstractions) <sup>5</sup>
- [Provider SDKs and Clients](#provider-sdks-and-clients) <sup>9</sup>
- [Model Context Protocol](#model-context-protocol) <sup>9</sup>
- [Agents and Orchestration](#agents-and-orchestration) <sup>3</sup>
- [RAG, Vectors and Embeddings](#rag-vectors-and-embeddings) <sup>8</sup>
- [AI-Assisted Development](#ai-assisted-development) <sup>9</sup>
- [Evaluation and Observability](#evaluation-and-observability) <sup>4</sup>
- [Token Optimization](#token-optimization) <sup>4</sup>
- [Content and Discoverability](#content-and-discoverability) <sup>3</sup>
- [Utilities](#utilities) <sup>4</sup>

## Multi-Provider Abstractions

One API across OpenAI, Anthropic, Gemini, Ollama and the rest. Start here if you would rather not be locked to a single vendor.

| Package | Stars | Installs | What it does |
| :--- | ---: | ---: | :--- |
| [prism-php/prism](https://github.com/prism-php/prism) `popular` | 2.4K | 6.5M | The de facto standard. Unified text generation, structured output, embeddings and tool calling across every major provider, with a fluent Laravel-native API. |
| [theodo-group/llphant](https://github.com/LLPhant/LLPhant) | 1.7K | 497.2K | Full generative AI toolkit for PHP: chat, embeddings, vector stores and question answering. Framework agnostic with Laravel bindings. |
| [cognesy/instructor-php](https://github.com/cognesy/instructor-php) | 327 | 134.9K | Structured output done properly. Define a PHP class, get back a validated instance instead of hand-parsing JSON out of a string. |
| [moe-mizrak/laravel-openrouter](https://github.com/moe-mizrak/laravel-openrouter) | 158 | 234.4K | OpenRouter integration, which gets you several hundred models through a single credential. |
| [neuron-core/neuron-laravel](https://github.com/neuron-core/neuron-laravel) | 120 | 60.3K | Official Laravel SDK for Neuron, covering agents, RAG and workflows behind one interface. |

## Provider SDKs and Clients

Thin, direct clients for when you only target one provider and want its full surface area.

| Package | Stars | Installs | What it does |
| :--- | ---: | ---: | :--- |
| [openai-php/laravel](https://github.com/openai-php/laravel) `popular` | 3.8K | 11.2M | The most widely installed AI package in the Laravel world. Facade, config publishing and full OpenAI API coverage. |
| [google-gemini-php/laravel](https://github.com/google-gemini-php/laravel) `popular` | 640 | 724.5K | Gemini for Laravel from the same team behind the OpenAI client, so the API shape will feel familiar. |
| [cloudstudio/ollama-laravel](https://github.com/cloudstudio/ollama-laravel) `popular` | 478 | 144.4K | Talk to locally hosted models through Ollama. The obvious starting point if you want inference that never leaves your machine. |
| [openai-php/client](https://github.com/openai-php/client) | 5.8K | 32.6M | The framework-agnostic core that the Laravel adapter wraps. Use it directly outside Laravel. |
| [deepseek-php/deepseek-php-client](https://github.com/deepseek-php/deepseek-php-client) | 474 | 106.3K | Community-driven DeepSeek client, useful when cost per token is the deciding factor. |
| [deepseek-php/deepseek-laravel](https://github.com/deepseek-php/deepseek-laravel) | 401 | 45K | The Laravel service provider for the DeepSeek client above. |
| [anthropic-ai/sdk](https://github.com/anthropics/anthropic-sdk-php) | 177 | 1.4M | Official Anthropic PHP SDK for the Claude API. |
| [mozex/anthropic-laravel](https://github.com/mozex/anthropic-laravel) | 74 | 426K | Laravel integration for Anthropic: facade, config publishing and streaming. |
| [claude-php/claude-php-sdk-laravel](https://github.com/claude-php/Claude-PHP-SDK-Laravel) | 52 | 30.6K | Community Claude SDK with a Laravel service provider. |

## Model Context Protocol

Expose your Laravel app as tools an agent can call, or consume MCP servers from inside your app.

| Package | Stars | Installs | What it does |
| :--- | ---: | ---: | :--- |
| [laravel/mcp](https://github.com/laravel/mcp) `official` | 809 | 34.6M | First-party MCP server support from the Laravel core team. Routes, tools, resources and prompts declared the way you would declare anything else in Laravel. |
| [php-mcp/laravel](https://github.com/php-mcp/laravel) | 476 | 225.8K | Mature independent SDK. Attribute-driven tool discovery and multiple transports. Predates the official package and still ships features it lacks. |
| [opgginc/laravel-mcp-server](https://github.com/opgginc/laravel-mcp-server) | 332 | 71.2K | Production-oriented server built around secure remote transports rather than stdio. |
| [kirschbaum-development/laravel-loop](https://github.com/kirschbaum-development/laravel-loop) | 132 | 20.1K | MCP server that exposes Eloquent models and app actions with an auth layer in front of them. |
| [lucianotonet/laravel-telescope-mcp](https://github.com/lucianotonet/laravel-telescope-mcp) | 23 | 43.2K | Puts Telescope entries in front of an agent so it can read your queries and exceptions while debugging. |
| [redberry/mcp-client-laravel](https://github.com/RedberryProducts/mcp-client-laravel) | 13 | 125.1K | The other direction: consume any configured MCP server from inside your Laravel app. |
| [mattiasgeniar/filament-mcp](https://github.com/mattiasgeniar/filament-mcp) | 10 | 1.6K | Exposes Filament resources over MCP. |
| [onelearningcommunity/laravel-model-explorer](https://github.com/One-Learning-Community/laravel-model-explorer) | 7 | 65.7K | Zero-config browser UI and MCP server for exploring Eloquent models and their relationships. |
| [anilcancakir/laravel-agent-mcp](https://github.com/anilcancakir/laravel-agent-mcp) | 5 | 44.3K | Deliberately read-only. A sane default when you want an agent to inspect production without being able to touch it. |

## Agents and Orchestration

Multi-step reasoning, tool calling, memory, and background agent runs.

| Package | Stars | Installs | What it does |
| :--- | ---: | ---: | :--- |
| [maestroerror/laragent](https://github.com/MaestroError/LarAgent) `popular` | 642 | 205K | Agents as Laravel classes. Chat history, tools and per-agent configuration with very little ceremony. |
| [fomvasss/laravel-ai-tasks](https://github.com/fomvasss/laravel-ai-tasks) | 40 | 3.5K | Task orchestrator with routing, queueing, budget caps and audit logging. Worth reading before you build your own. |
| [alidaaer/laravel-ai-agent](https://github.com/alidaaer/Laravel-AI-Agent) | 30 | 1.5K | Agents that execute application actions behind an explicit permission model. |

## RAG, Vectors and Embeddings

Chunking, embedding, storage and retrieval over your own application data.

| Package | Stars | Installs | What it does |
| :--- | ---: | ---: | :--- |
| [benbjurstrom/pgvector-scout](https://github.com/benbjurstrom/pgvector-scout) | 74 | 9.6K | pgvector driver for Laravel Scout. If you already run Postgres, this is the shortest path to semantic search. |
| [moneo/laravel-rag](https://github.com/moneo/laravel-rag) | 40 | 22 | Driver-based end to end RAG pipeline: ingest, chunk, embed, retrieve. |
| [eznix86/laravel-ai-memory](https://github.com/eznix86/laravel-ai-memory) | 30 | 79 | Persistent agent memory with semantic search and reranking. |
| [vlados/laravel-related-content](https://github.com/vlados/laravel-related-content) | 15 | 1.1K | Related content links built from pgvector embeddings. |
| [mcpuishor/qdrant-laravel](https://github.com/mcpuishor/qdrant-laravel) | 11 | 17.9K | Fluent Qdrant client for when you outgrow a table with a vector column. |
| [devilsberg/laravel-mariadb-vector](https://github.com/erik-ros-devilsberg/laravel-mariadb-vector) | 8 | 1.4K | Native MariaDB 11.7+ vector columns through Eloquent, with no extra service to run. |
| [brynj-digital/laravel-scout-vectorize](https://github.com/brynj-digital/laravel-scout-vectorize) | 8 | 298 | Cloudflare Vectorize driver for Laravel Scout. |
| [droath/laravel-text-chunker](https://github.com/droath/laravel-text-chunker) | 3 | 707 | Strategy-based text chunking. Chunk quality decides retrieval quality, so this matters more than it looks. |

## AI-Assisted Development

Packages that make coding agents measurably better at working on Laravel codebases.

| Package | Stars | Installs | What it does |
| :--- | ---: | ---: | :--- |
| [laravel/boost](https://github.com/laravel/boost) `official` | 3.6K | 32.9M | First-party. Feeds coding agents accurate, version-specific Laravel context plus app introspection tools. Install this before blaming the model. |
| [joshcirre/instruckt-laravel](https://github.com/joshcirre/instruckt-laravel) | 174 | 43.6K | Visual feedback loop so a coding agent can see the page it just changed. |
| [mischasigtermans/laravel-altitude](https://github.com/mischasigtermans/laravel-altitude) | 122 | 23.8K | Agent definitions tuned for the TALL stack. |
| [promptphp/deck](https://github.com/promptphp/deck) | 110 | 9.8K | Versioned, file-based prompt management. Treats prompts as reviewable artifacts instead of strings buried in a controller. |
| [spatie/boost-spatie-guidelines](https://github.com/spatie/boost-spatie-guidelines) | 109 | 311.3K | Spatie house style as Boost guidelines, so generated code matches how the ecosystem actually writes Laravel. |
| [spatie/guidelines-skills](https://github.com/spatie/guidelines-skills) | 90 | 169.8K | The same guidelines packaged as portable agent skills. |
| [mrpunyapal/laravel-auditor](https://github.com/MrPunyapal/laravel-auditor) | 45 | 2.9K | Read-only context tools plus an evidence-based audit methodology for reviewing an unfamiliar codebase. |
| [andreapollastri/larapilot](https://github.com/andreapollastri/larapilot) | 19 | 446 | Spec-driven workflow: discovery, backlog and planning before any code gets generated. |
| [sandermuller/package-boost-laravel](https://github.com/SanderMuller/package-boost-laravel) | 1 | 6.2K | Agent skills aimed specifically at people authoring Laravel packages. |

## Evaluation and Observability

Know whether your AI feature works, and what it costs, before your users tell you.

| Package | Stars | Installs | What it does |
| :--- | ---: | ---: | :--- |
| [pestphp/pest-plugin-evals](https://github.com/pestphp/pest-plugin-evals) `official` | 5 | 66.6K | Evals as Pest tests. LLM-as-judge and semantic assertions running in the same suite as everything else. |
| [spectra-php/laravel-spectra](https://github.com/spectra-php/laravel-spectra) | 20 | 4K | Observability for LLM calls: traces, token counts and spend, inside your own app. |
| [padosoft/eval-harness](https://github.com/padosoft/eval-harness) | 7 | 8.3K | Golden dataset harness for RAG and LLM pipelines. |
| [larswiegers/laravel-ai-evaluation](https://github.com/LarsWiegers/laravel-ai-evaluation) | 6 | 2.6K | Lightweight eval runner for AI features. |

## Token Optimization

Fit more context into fewer tokens.

| Package | Stars | Installs | What it does |
| :--- | ---: | ---: | :--- |
| [yethee/tiktoken](https://github.com/yethee/tiktoken-php) | 167 | 4.7M | PHP tiktoken port. Count tokens before you send them, not after the invoice arrives. |
| [mischasigtermans/laravel-toon](https://github.com/mischasigtermans/laravel-toon) | 146 | 60.1K | TOON encoder and decoder wired into Laravel. |
| [helgesverre/toon](https://github.com/HelgeSverre/toon-php) | 130 | 307.2K | Token-Oriented Object Notation. Noticeably cheaper than JSON when you are stuffing structured data into a prompt. |
| [rajentrivedi/tokenizer-x](https://github.com/rajentrivedi/tokenizer-x) | 91 | 273.5K | Counts the tokens a prompt will cost across several model families. |

## Content and Discoverability

Making a Laravel app legible to crawlers and answer engines.

| Package | Stars | Installs | What it does |
| :--- | ---: | ---: | :--- |
| [hszope/laravel-aigeo](https://github.com/GitHiteshZope/aigeo) | 70 | 1.4K | Generative engine optimization helpers for getting products surfaced inside AI answers. |
| [relaticle/ink](https://github.com/relaticle/ink) | 15 | 4.1K | Filament-native publishing that emits AI-citable article markup. |
| [schaefersoft/laravel-llms-txt](https://github.com/schaefersoft/laravel-llms-txt) | 7 | 4.1K | Generates llms.txt and llms-full.txt so crawlers get a clean map of your site. |

## Utilities

Focused single-purpose tools that did not fit anywhere else.

| Package | Stars | Installs | What it does |
| :--- | ---: | ---: | :--- |
| [halilcosdu/laravel-chatbot](https://github.com/halilcosdu/laravel-chatbot) | 67 | 6.8K | Laravel-native chatbot built on the OpenAI Responses API. |
| [eslam-reda-div/filament-copilot](https://github.com/eslam-reda-div/filament-copilot) | 43 | 17.7K | Drops an AI copilot panel into a Filament admin. |
| [cboxdk/statamic-mcp](https://github.com/cboxdk/statamic-mcp) | 36 | 30K | MCP server for Statamic v6, if your Laravel app happens to be a Statamic site. |
| [statikbe/laravel-ai-translation](https://github.com/statikbe/laravel-ai-translation) | 2 | 4 | Modular AI translation gateway for Laravel language files. |

<!-- LIST:END -->

## Contributing

Pull requests are welcome. The rules are short:

1. The package must be on Packagist and installable.
2. It must have had a commit in the last twelve months.
3. It must actually be about AI, LLMs, agents, or MCP. Not "has an AI feature buried in it somewhere".

Add your entry to [`data/packages.json`](data/packages.json) and nothing else. Do not edit the tables in this README, they are generated and your changes will be overwritten on the next refresh.

```jsonc
{
  "packagist": "vendor/package",
  "category": "agents",
  "summary": "One sentence. What it does and when you would reach for it."
}
```

CI will resolve your package against the live APIs and fail the PR if it does not exist, is archived, or is abandoned. See [CONTRIBUTING.md](CONTRIBUTING.md) for the longer version.

## How the automation works

Two scripts, no dependencies, Node 20 or newer.

```bash
# Pull live stars and install counts into data/metrics.json
GITHUB_TOKEN=$(gh auth token) node scripts/refresh.mjs

# Regenerate the tables in README.md from that data
node scripts/render.mjs

# Verify the README matches the data, used in CI
node scripts/render.mjs --check
```

`refresh.mjs` hits Packagist once per package with a small worker pool, then batches every repository into a single GitHub GraphQL query so the whole run costs one point of rate limit. It exits non-zero if any package fails to resolve, which is what turns the scheduled job into a health check rather than just a counter.

[`.github/workflows/refresh.yml`](.github/workflows/refresh.yml) runs it daily and opens a commit when the numbers change.

## Related

- [awesome-php](https://github.com/ziadoz/awesome-php)
- [awesome-laravel](https://github.com/chiraggude/awesome-laravel)
- [awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers)

## License

[CC0 1.0](LICENSE). Public domain, use it however you like.
