# Code Selling Marketplace

A blockchain-powered marketplace for developers to list, buy, and sell code securely.

## Features

- **List Code**: Developers can list their code with descriptions, pricing, and secure file uploads
- **Buy Code**: Users can purchase listed code using FLOW tokens
- **Secure Transactions**: All transactions are secured via the Flow blockchain
- **User Dashboard**: Track listings and purchases in a user-friendly dashboard

## Tech Stack

- **Frontend**: Next.js with Tailwind CSS
- **Backend**: Node.js with Express
- **Blockchain**: Flow blockchain with Cadence smart contracts
- **Authentication**: Flow Client Library (FCL) for wallet authentication

## Project Structure

```
├── contracts
│   └── CodeMarketplace.cdc       # Main marketplace smart contract
├── scripts
│   └── GetListings.cdc           # Script to fetch marketplace listings
├── transactions
│   ├── BuyCode.cdc               # Transaction to purchase code
│   └── ListCode.cdc              # Transaction to list code for sale
└── web
    ├── client                    # Next.js frontend application
    │   ├── app                   # App router pages and layouts
    │   │   ├── dashboard         # User dashboard page
    │   │   ├── list              # Form to list new code
    │   │   ├── listing           # Individual listing page
    │   │   └── page.js           # Homepage
    │   └── public                # Static assets
    └── server                    # Node.js backend
        ├── index.js              # Server entrypoint
        ├── models                # Data models
        │   └── User.js           # User model
        └── routes                # API routes
            └── marketplace.js    # Marketplace routes
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- Flow CLI (for contract deployment)
- Flow wallet (for authentication)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/code-marketplace.git
   cd code-marketplace
   ```

2. Install dependencies:
   ```
   # Install server dependencies
   cd web/server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Environment setup:
   - Create a `.env` file in the `web/server` directory:
     ```
     PORT=3001
     FLOW_ACCESS_NODE=https://rest-testnet.onflow.org
     FLOW_NETWORK=testnet
     CONTRACT_ADDRESS=0x9d2ade18cb6bea1a
     MONGODB_URI=mongodb://localhost:27017/codemarketplace
     ```

   - Create a `.env.local` file in the `web/client` directory:
     ```
     NEXT_PUBLIC_API_URL=http://localhost:3001
     ```

4. Deploy contracts (if needed):
   ```
   flow project deploy --network=testnet
   ```

5. Start the development servers:
   ```
   # Start the backend server
   cd web/server
   npm run dev

   # In a new terminal, start the frontend
   cd web/client
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

## Usage

### Listing Code

1. Connect your Flow wallet
2. Navigate to "List Your Code"
3. Fill in the details about your code
4. Upload your code as a ZIP file
5. Set a price in FLOW tokens
6. Submit the listing

### Buying Code

1. Connect your Flow wallet
2. Browse the marketplace
3. Select a listing you're interested in
4. Review the details
5. Click "Buy Now" to purchase
6. Approve the transaction in your wallet
7. Download the code after successful purchase

## Smart Contract Overview

The project uses a Cadence smart contract to handle marketplace functionality:

- `CodeListing` struct - Represents a listing with title, description, price, etc.
- `createListing` function - Creates a new listing on the blockchain
- `purchaseListing` function - Handles the purchase transaction
- `getListings` function - Retrieves all listings from the marketplace

## Contact Information

- **Telegram**: @singhaditya5711
- **GitHub**: [Your GitHub Profile](https://github.com/adysingh5711)

## License

This project is licensed under the MIT License - see the LICENSE file for details.