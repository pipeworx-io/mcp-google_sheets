# mcp-google_sheets

Google Sheets MCP Pack

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 250+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `sheets_read` | Read data from a Google Sheet range. Specify sheet name and range (e.g., \'A1:C10\'). Returns rows as arrays of cell values. |
| `sheets_write` | Write data to a Google Sheet range, overwriting existing values. Specify sheet name, range (e.g., \'A1:C10\'), and row data. |
| `sheets_append` | Append new rows to the end of a Google Sheet table. Specify sheet name and row data to add. |
| `sheets_get_spreadsheet` | Explore a spreadsheet\'s structure. Returns title, sheet/tab names, and properties. Use before reading or writing data. |
| `sheets_create` | Create a new Google Spreadsheet. Optionally set title and initial sheet names. Returns spreadsheet ID and sharing URL. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "google_sheets": {
      "url": "https://gateway.pipeworx.io/google_sheets/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 250+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Google_sheets data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
