# Power Automate Connector Test API

A complete backend and frontend system for testing Power Automate custom connectors with review workflows. This application provides a submission endpoint, review interface, and approval/rejection workflow for JSON data.

## Features

- **Data Submission API**: RESTful endpoint for receiving JSON data
- **Review Dashboard**: Web interface for viewing and managing submissions
- **Editable Forms**: User-friendly form interface instead of raw JSON editing
- **Approval Workflow**: Approve, reject, or edit submissions before processing
- **Status Tracking**: Complete audit trail with timestamps
- **Public Access**: Easy tunneling for Power Automate integration

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd power-automate-connector-test
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

### Making it Public (for Power Automate)

To make your local server accessible to Power Automate:

```bash
npx localtunnel --port 3000
```

This will provide a public URL like `https://abc123.loca.lt`

## API Endpoints

### Submit Data
- **POST** `/api/submit`
- **Description**: Submit JSON data for review
- **Headers**: `Content-Type: application/json`
- **Body**: Any valid JSON object or array
- **Response**: 
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "To review",
    "submittedAt": "2023-12-01T10:00:00.000Z",
    "originalData": {...},
    "currentData": {...}
  }
}
```

### Get All Records
- **GET** `/api/records`
- **Query Parameters**: 
  - `status` (optional): Filter by status ("To review", "Approved", "Rejected")

### Get Specific Record
- **GET** `/api/records/:id`

### Update Record
- **PUT** `/api/records/:id`
- **Body**: 
```json
{
  "currentData": {...},
  "notes": "Review notes"
}
```

### Approve Record
- **POST** `/api/records/:id/approve`

### Reject Record
- **POST** `/api/records/:id/reject`
- **Body**: 
```json
{
  "reason": "Rejection reason"
}
```

### Delete Record
- **DELETE** `/api/records/:id`

### Health Check
- **GET** `/api/health`

## Usage

### For Power Automate Custom Connectors

1. Start the server locally: `npm start`
2. Create a public tunnel: `npx localtunnel --port 3000`
3. In Power Automate:
   - **Host**: Your tunnel URL (e.g., `abc123.loca.lt`)
   - **Base URL**: `/api`
   - **Authentication**: No authentication
   - **Action**: POST `/submit`

### For Testing

1. Open `http://localhost:3000` in your browser
2. Use the "Test Data Submission" section to submit sample data
3. Review submissions in the dashboard
4. Edit data using the form interface
5. Approve or reject submissions

## Data Structure

The system works with any JSON structure but includes special form handling for user objects with these fields:

- `id` (number)
- `first_name` (string)
- `last_name` (string)
- `email` (string)
- `role` (string)
- `active` (boolean)
- `join_date` (date)

For other data structures, the system falls back to a JSON text editor.

## Project Structure

```
├── server.js              # Express server and API routes
├── public/
│   └── index.html         # Frontend dashboard and forms
├── package.json           # Dependencies and scripts
├── test-data.json         # Sample test data
└── README.md             # This file
```

## Sample Data

The project includes sample user data in `test-data.json`:

```json
[
  {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "role": "Manager",
    "active": true,
    "join_date": "2023-01-15"
  }
]
```

## Configuration

### Environment Variables

- `PORT`: Server port (default: 3000)

### API Key (Optional)

For additional security, you can require an API key:
- Header: `x-api-key` or `api-key`
- Default demo key: `demo-api-key-123`

## Deployment

### Local Development
```bash
npm start
```

### Production
```bash
npm install --production
node server.js
```

### Using with Tunneling Services

**LocalTunnel** (Recommended):
```bash
npx localtunnel --port 3000
```

**Ngrok** (Alternative):
```bash
ngrok http 3000
```

## Troubleshooting

### Power Automate Gateway Issues

If Power Automate requires an on-premises data gateway:

1. Use the built-in HTTP action instead of custom connector
2. Method: POST
3. URL: `https://your-tunnel-url.loca.lt/api/submit`
4. Headers: `Content-Type: application/json`
5. Body: Your JSON data

### Common Issues

- **Port already in use**: Change the PORT environment variable
- **Tunnel password required**: Some tunnel services require password authentication
- **Data not persisting**: This uses in-memory storage; restart clears all data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Create an issue in the repository 