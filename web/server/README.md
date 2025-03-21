# Code Marketplace Server

A secure server implementation for the Code Selling Marketplace that handles code storage, encryption, and blockchain interactions.

## Features

- Secure code storage with encryption
- Flow blockchain integration for payments and escrow
- JWT-based authentication
- Rate limiting and security measures
- MongoDB for data persistence
- Comprehensive error handling
- API endpoints for listings and purchases

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Flow blockchain account
- Flow CLI (optional, for contract deployment)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd code-marketplace/web/server
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
- Set your MongoDB connection string
- Configure Flow blockchain credentials
- Set JWT secret
- Update other settings as needed

## Development

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000` by default.

## Production

Build and start the production server:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/flow` - Authenticate with Flow account
- `GET /api/auth/verify` - Verify Flow account capabilities
- `GET /api/auth/account` - Get Flow account details
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout

### Listings
- `POST /api/listings` - Create a new listing
- `GET /api/listings` - Get all listings
- `GET /api/listings/:id` - Get a specific listing
- `GET /api/listings/user/:address` - Get user's listings
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

### Purchases
- `POST /api/purchases/:listingId` - Purchase a listing
- `POST /api/purchases/:purchaseId/complete` - Complete a purchase
- `GET /api/purchases/:purchaseId` - Get purchase details
- `GET /api/purchases/user/:address` - Get user's purchases
- `GET /api/purchases/:purchaseId/code` - Get code access
- `POST /api/purchases/:purchaseId/review` - Submit review

## Security Features

- Code encryption using AES-256-GCM
- JWT-based authentication
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- Error handling
- Secure file uploads

## Blockchain Integration

The server integrates with the Flow blockchain for:
- Secure payments
- Escrow functionality
- Bounty contract integration
- Transaction verification

## Error Handling

The server implements comprehensive error handling for:
- Blockchain errors
- Database errors
- Authentication errors
- Validation errors
- Rate limiting errors

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 