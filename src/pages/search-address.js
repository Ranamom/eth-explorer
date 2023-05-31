import { ethers } from 'ethers';
import Head from 'next/head';
import React, { Component } from 'react';
import moment from 'moment';

const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

export default class SearchHash extends Component {
    constructor(props) {
        super(props);
        this.state = {
            address: null,
            balance: null,
            tokenBalances: [],
            transactions: [],
            currentPage: 1,
            pageSize: 20,
            isLoading: true,
        };
    }

    componentDidMount() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const address = urlParams.get('str');

        this.setState({ address: address });
        this.getAddressDetail(address);
    }

    async getAddressDetail(address) {
        try {
            // Get address balance
            const balance = await provider.getBalance(address);
            this.setState({ balance: ethers.formatEther(balance) });

            // Get token balances
            const tokenBalances = await this.getTokenBalances(address);
            this.setState({ tokenBalances: tokenBalances });

            // Get latest transactions
            const transactions = await this.getTransactions(address);
            this.setState({ transactions: transactions, isLoading: false });
        } catch (error) {
            alert('Error retrieving address details');
            console.error('Error retrieving address details:', error);
            this.setState({ isLoading: false });
        }
    }

    async getTokenBalances(address) {
        try {
            const tokenContracts = await this.fetchERC20TokenContracts();
            const tokenBalances = [];

            for (const contract of tokenContracts) {
                const token = new ethers.Contract(contract, abi, provider);
                const balance = await token.balanceOf(address);
                const symbol = await token.symbol();
                const decimals = await token.decimals();

                const formattedBalance = ethers.formatUnits(balance, decimals);
                tokenBalances.push({ contract, symbol, balance: formattedBalance });
            }

            return tokenBalances;
        } catch (error) {
            console.error('Error retrieving token balances:', error);
            return [];
        }
    }

    async fetchERC20TokenContracts() {
        const blockNumber = await provider.getBlockNumber();
        const tokenContracts = new Set();

        for (let i = 1; i <= blockNumber; i++) {
            const block = await provider.getBlock(i);
            for (const transactionHash of block.transactions) {
                const transaction = await provider.getTransaction(transactionHash);
                if (transaction && transaction.to) {
                    const code = await provider.getCode(transaction.to);
                    if (code.length > 2) {
                        const bytecode = code.substr(2);
                        if (bytecode.startsWith('60606040')) {
                            tokenContracts.add(transaction.to);
                        }
                    }
                }
            }
        }

        return Array.from(tokenContracts);
    }

    async getTransactions(address) {
        try {
            const blockNumber = await provider.getBlockNumber();
            const transactions = [];

            for (let i = 0; i <= blockNumber; i++) {
                const block = await provider.getBlock(i);
                for (const transactionHash of block.transactions) {
                    const transaction = await provider.getTransaction(transactionHash);
                    const receipt = await provider.getTransactionReceipt(transactionHash);

                    if (transaction && (transaction.to === address || transaction.from === address)) {
                        transactions.push({
                            hash: transaction.hash,
                            timestamp: block.timestamp,
                            from: transaction.from,
                            to: transaction.to,
                            value: ethers.formatEther(transaction.value),
                            gasUsed: receipt.gasUsed,
                            gasLimit: transaction.gasLimit,
                            contractAddress: receipt.contractAddress,
                            status: receipt.status,
                        });
                    }
                }
            }

            return transactions;
        } catch (error) {
            console.error('Error retrieving transactions:', error);
            return [];
        }
    }

    handlePageChange = (pageNumber) => {
        this.setState({ currentPage: pageNumber });
    };

    render() {
        const { address, balance, tokenBalances, transactions, currentPage, pageSize, isLoading } = this.state;

        // Pagination logic
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedTransactions = transactions.slice(startIndex, endIndex);

        return (
            <>
                <Head>
                    <title>Address: {address}</title>
                </Head>
                <div className='section'>
                    <div className='container'>
                        <div className='columns'>
                            <div className='column table-container'>
                                <h4 className='is-size-5'>Address: {address}</h4>
                                <hr />
                                <div>
                                    <h5>Balance: <strong>{balance} {process.env.NEXT_PUBLIC_NATIVE_TOKEN_NAME}</strong></h5>
                                    {/* Render token balances */}
                                    <div>
                                        <h5>Token Balances:</h5>
                                        {tokenBalances.map((token) => (
                                            <div key={token.contract}>
                                                <p>Token: {token.symbol}</p>
                                                <p>Balance: {token.balance}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Render latest transactions with pagination */}
                                    <div style={{ marginTop: '20px' }}>
                                        <h5>Latest Transactions:</h5>
                                        {isLoading ? (
                                            <div className="loading-overlay">
                                                <div className="loading-icon"></div>
                                            </div>
                                        ) : (
                                            <div className='table-container'>
                                                <table className='table is-fullwidth'>
                                                    <thead>
                                                        <tr>
                                                            <th>Transaction Hash</th>
                                                            <th>Timestamp</th>
                                                            <th>From</th>
                                                            <th>To</th>
                                                            <th>Value</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {paginatedTransactions.map((tx) => (
                                                            <tr key={tx.hash}>
                                                                <td>
                                                                    <a href={`/search-hash?str=${tx.hash}`}>{tx.hash}</a>
                                                                </td>
                                                                <td>{tx.timestamp ? moment.unix(tx.timestamp).fromNow() : '-'}</td>
                                                                <td>{tx.from}</td>
                                                                <td>{tx.to}</td>
                                                                <td>{tx.value}  {process.env.NEXT_PUBLIC_NATIVE_TOKEN_NAME}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                        {/* Render pagination component */}
                                        <div className='pagination'>
                                            <button
                                                className='pagination-previous'
                                                onClick={() => this.handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                Previous
                                            </button>
                                            <button
                                                className='pagination-next'
                                                onClick={() => this.handlePageChange(currentPage + 1)}
                                                disabled={endIndex >= transactions.length}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
