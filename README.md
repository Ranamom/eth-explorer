This is a Beta Product developed by Broken Pie

## Getting Started

First, run the development server after installing necessary modules:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Configuration

There are not ready to configure variables, but there are two important things you have to configure before running this project
```bash
NEXT_PUBLIC_RPC_URL = which can be any EVM compatible RPC endpoint
NEXT_PUBLIC_NATIVE_TOKEN_NAME = this is the name of native token
```
You can change the logo in the public folder.

## What it is ?

This is a simple Next.js-based universal basic blockchain explorer without a database. It means all data is fetched directly from the blockchain. Any blockchain based on the Ethereum ecosystem can be supported, such as BSC, ETH, Ganache, etc.

## Is it secure ?
This project is designed as a read-only application, allowing anyone to access data from the blockchain. However, we do not recommend using it in a production environment yet, as it may not have the necessary security measures in place.