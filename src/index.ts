interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Google Sheets MCP Pack
 *
 * Requires OAuth connection — gateway injects credentials via _context.google_sheets.
 * Tools: read, write, append, list sheets, create spreadsheet.
 */


interface GoogleContext {
  google_sheets?: { accessToken: string };
}

const API = 'https://sheets.googleapis.com/v4/spreadsheets';

async function gFetch(ctx: GoogleContext, url: string, options: RequestInit = {}) {
  if (!ctx.google_sheets) {
    return { error: 'connection_required', message: 'Connect your Google account at https://pipeworx.io/account' };
  }
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${ctx.google_sheets.accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Sheets API error (${res.status}): ${text}`);
  }
  return res.json();
}

const tools: McpToolExport['tools'] = [
  {
    name: 'sheets_read',
    description: 'Read data from a Google Sheets range. Returns rows as arrays.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        spreadsheet_id: { type: 'string', description: 'Spreadsheet ID (from the URL)' },
        range: { type: 'string', description: 'A1 notation range (e.g., "Sheet1!A1:D10")' },
      },
      required: ['spreadsheet_id', 'range'],
    },
  },
  {
    name: 'sheets_write',
    description: 'Write data to a Google Sheets range. Overwrites existing data.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        spreadsheet_id: { type: 'string', description: 'Spreadsheet ID' },
        range: { type: 'string', description: 'A1 notation range (e.g., "Sheet1!A1")' },
        values: {
          type: 'array',
          description: 'Array of rows, each row is an array of cell values',
          items: { type: 'array', items: { type: 'string' } },
        },
        value_input_option: { type: 'string', enum: ['USER_ENTERED', 'RAW'], description: 'How to interpret input. USER_ENTERED (default) parses formulas/dates/numbers. RAW stores literal strings.' },
      },
      required: ['spreadsheet_id', 'range', 'values'],
    },
  },
  {
    name: 'sheets_append',
    description: 'Append rows to the end of a Google Sheets table.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        spreadsheet_id: { type: 'string', description: 'Spreadsheet ID' },
        range: { type: 'string', description: 'A1 notation range to append after (e.g., "Sheet1!A1")' },
        values: {
          type: 'array',
          description: 'Array of rows to append',
          items: { type: 'array', items: { type: 'string' } },
        },
        value_input_option: { type: 'string', enum: ['USER_ENTERED', 'RAW'], description: 'How to interpret input. USER_ENTERED (default) parses formulas/dates/numbers. RAW stores literal strings.' },
      },
      required: ['spreadsheet_id', 'range', 'values'],
    },
  },
  {
    name: 'sheets_get_spreadsheet',
    description: 'Get spreadsheet metadata — title, sheets/tabs, and properties.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        spreadsheet_id: { type: 'string', description: 'Spreadsheet ID' },
      },
      required: ['spreadsheet_id'],
    },
  },
  {
    name: 'sheets_create',
    description: 'Create a new Google Spreadsheet.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string', description: 'Title for the new spreadsheet' },
      },
      required: ['title'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const context = (args._context ?? {}) as GoogleContext;
  delete args._context;

  switch (name) {
    case 'sheets_read': {
      const { spreadsheet_id, range } = args as { spreadsheet_id: string; range: string };
      const data = await gFetch(context, `${API}/${spreadsheet_id}/values/${encodeURIComponent(range)}`);
      return data;
    }
    case 'sheets_write': {
      const { spreadsheet_id, range, values, value_input_option = 'USER_ENTERED' } = args as { spreadsheet_id: string; range: string; values: unknown[][]; value_input_option?: string };
      return gFetch(context, `${API}/${spreadsheet_id}/values/${encodeURIComponent(range)}?valueInputOption=${value_input_option}`, {
        method: 'PUT',
        body: JSON.stringify({ values }),
      });
    }
    case 'sheets_append': {
      const { spreadsheet_id, range, values, value_input_option = 'USER_ENTERED' } = args as { spreadsheet_id: string; range: string; values: unknown[][]; value_input_option?: string };
      return gFetch(context, `${API}/${spreadsheet_id}/values/${encodeURIComponent(range)}:append?valueInputOption=${value_input_option}&insertDataOption=INSERT_ROWS`, {
        method: 'POST',
        body: JSON.stringify({ values }),
      });
    }
    case 'sheets_get_spreadsheet': {
      const { spreadsheet_id } = args as { spreadsheet_id: string };
      return gFetch(context, `${API}/${spreadsheet_id}?fields=spreadsheetId,properties.title,sheets.properties`);
    }
    case 'sheets_create': {
      const { title } = args as { title: string };
      return gFetch(context, API, {
        method: 'POST',
        body: JSON.stringify({ properties: { title } }),
      });
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 10 }, provider: 'google_sheets' } satisfies McpToolExport;
