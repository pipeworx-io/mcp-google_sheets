# mcp-google_sheets

Google Sheets MCP Pack

Part of the [Pipeworx](https://pipeworx.io) open MCP gateway.

## Tools

| Tool | Description |
|------|-------------|
| `sheets_read` | Read data from a Google Sheets range. Returns rows as arrays. |
| `sheets_write` | Write data to a Google Sheets range. Overwrites existing data. |
| `sheets_append` | Append rows to the end of a Google Sheets table. |
| `sheets_get_spreadsheet` | Get spreadsheet metadata — title, sheets/tabs, and properties. |
| `sheets_create` | Create a new Google Spreadsheet. |

## Quick Start

Add to your MCP client config:

```json
{
  "mcpServers": {
    "google_sheets": {
      "url": "https://gateway.pipeworx.io/google_sheets/mcp"
    }
  }
}
```

Or use the CLI:

```bash
npx pipeworx use google_sheets
```

## License

MIT
