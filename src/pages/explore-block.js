import { ethers } from 'ethers';
import Head from 'next/head';
import React, { Component } from 'react';
import moment from 'moment';

const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

export default class ExploreBlock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            blockno: null,
            blockData: {},
            transactions: [],
            currentPage: 1,
            pageSize: 20,
            isLoading: true,
        };
    }

    componentDidMount() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const blockno = urlParams.get('str');

        this.setState({ blockno: blockno });
        this.getBlockDetails(blockno);
        this.getBlockTransactions(blockno);
        this.setState({ isLoading: false });
    }

    async getBlockDetails(blockNumber) {
        try {
            const blockTag = parseInt(blockNumber);
            const block = await provider.getBlock(blockTag);
            this.setState({ blockData: block });
        } catch (error) {
            alert('Error retrieving block details');
            console.error('Error retrieving block details:', error);
        }
    }

    async getBlockTransactions(blockNumber) {
        try {
            const blockTag = parseInt(blockNumber);
            const block = await provider.getBlock(blockTag);
            const transactions = await Promise.all(
                block.transactions.map((txHash) => provider.getTransaction(txHash))
            );
            this.setState({ transactions: transactions });
        } catch (error) {
            alert('Error retrieving block transactions');
            console.error('Error retrieving block transactions:', error);
        }
    }

    handlePageChange = (page) => {
        this.setState({ currentPage: page });
    };

    render() {
        const { blockno, blockData, isLoading, transactions, currentPage } = this.state;

        const startIndex = (currentPage - 1) * this.state.pageSize;
        const endIndex = startIndex + this.state.pageSize;
        const currentTransactions = transactions.slice(startIndex, endIndex);

        return (
            <>
                <Head>
                    <title>Explore Block: {blockno}</title>
                </Head>
                {isLoading &&
                    <div className="loading-overlay">
                        <div className="loading-icon"></div>
                    </div>

                }
                <div className='section'>
                    <div className='container'>
                        <div className='columns'>
                            <div className='column table-container'>
                                <h2 className='title'>Explore Block: {blockno}</h2>
                                <hr />
                                <div className='block-details'>
                                    <div className='table-container'>
                                        <table className='table is-fullwidth is-striped'>
                                            <tbody>
                                                <tr>
                                                    <th>Block Number</th>
                                                    <td>{blockData.number}</td>
                                                </tr>
                                                <tr>
                                                    <th>Timestamp</th>
                                                    <td>{moment(blockData.timestamp * 1000).fromNow()}</td>
                                                </tr>
                                                <tr>
                                                    <th>Hash</th>
                                                    <td>
                                                        <a href={'/search-hash/?str=' + blockData.hash}>{blockData.hash}</a>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>Parent Hash</th>
                                                    <td>
                                                        <a href={'/search-hash/?str=' + blockData.parentHash}>{blockData.parentHash}</a>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>Nonce</th>
                                                    <td>{blockData.nonce}</td>
                                                </tr>
                                                <tr>
                                                    <th>Difficulty</th>
                                                    <td>{blockData.difficulty}</td>
                                                </tr>
                                                <tr>
                                                    <th>Gas Limit</th>
                                                    <td>{blockData.gasLimit}</td>
                                                </tr>
                                                <tr>
                                                    <th>Gas Used</th>
                                                    <td>{blockData.gasUsed}</td>
                                                </tr>
                                                {/* Add more block details as needed */}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <h3 className='subtitle'>Transactions</h3>
                                <div className='table-container'>
                                    <table className='table is-fullwidth is-striped is-responsive'>
                                        <thead>
                                            <tr>
                                                <th>Transaction Hash</th>
                                                <th>From</th>
                                                <th>To</th>
                                                {/* Add more transaction table headers as needed */}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentTransactions.map((txn) => (
                                                <tr key={txn.hash}>
                                                    <td>
                                                        <a href={'/search-hash/?str=' + txn.hash}>{txn.hash}</a>
                                                    </td>
                                                    <td><a href={'/search-address/?str=' + txn.from}>{txn.from}</a></td>
                                                    <td><a href={'/search-address/?str=' + txn.to}>{txn.to}</a></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <nav className='pagination is-centered'>
                                    <ul className='pagination-list'>
                                        {Array.from({ length: Math.ceil(transactions.length / this.state.pageSize) }, (_, index) => index + 1).map((page) => (
                                            <li key={page}>
                                                <a
                                                    className={`pagination-link${currentPage === page ? ' is-current' : ''}`}
                                                    onClick={() => this.handlePageChange(page)}
                                                >
                                                    {page}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
