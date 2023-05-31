import { ethers } from 'ethers';
import Head from 'next/head';
import React, { Component } from 'react';
import moment from 'moment';

const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

export default class SearchHash extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            string: null,
            blockData: {},
            eventLogs: [],
            receipt: {},
            isLoading: true
        };
    }

    componentDidMount() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const string = urlParams.get('str');

        this.setState({ string: string });
        this.getHashDetail(string);
        this.setState({ isLoading: false });
    }

    async getHashDetail(hash) {
        try {
            const detail = await provider.getTransaction(hash);
            this.setState({ data: detail });

            // Get block details
            const block = await provider.getBlock(detail.blockNumber);
            this.setState({ blockData: block });

            // Get transaction receipt
            const receipt = await provider.getTransactionReceipt(hash);
            if (receipt && receipt.logs) {
                this.setState({ eventLogs: receipt.logs });
            }
            if (receipt) {
                this.setState({ receipt: receipt });
            }
        } catch (error) {
            alert('Error retrieving hash details');
            console.log(error);
        }
    }

    render() {
        const { string, data, isLoading, blockData, eventLogs, receipt } = this.state;

        return (
            <>
                <Head>
                    <title>Hash: {string}</title>
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
                                <h4 className='is-size-5'>Hash: {string}</h4>
                                <hr />
                                <div className='table-container'>
                                    <table className='table is-fullwidth'>
                                        <tbody>
                                            <tr>
                                                <th>Block Number</th>
                                                <td>{data.blockNumber}</td>
                                            </tr>
                                            <tr>
                                                <th>Timestamp</th>
                                                <td>{blockData.timestamp ? moment.unix(blockData.timestamp).fromNow() : '-'}</td>
                                            </tr>
                                            <tr>
                                                <th>From</th>
                                                <td>
                                                    <a href={`/search-address?str=${data.from}`}>{data.from}</a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th>To</th>
                                                <td>
                                                    <a href={`/search-address?str=${data.to}`}>{data.to}</a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th>Value</th>
                                                <td>{data.value ? ethers.formatEther(data.value) : '-'} {process.env.NEXT_PUBLIC_NATIVE_TOKEN_NAME}</td>
                                            </tr>
                                            <tr>
                                                <th>Gas Price</th>
                                                <td>{data.gasPrice ? ethers.formatEther(data.gasPrice) : '-'} {process.env.NEXT_PUBLIC_NATIVE_TOKEN_NAME}</td>
                                            </tr>
                                            <tr>
                                                <th>Gas Limit</th>
                                                <td>{receipt.gasLimit}</td>
                                            </tr>
                                            <tr>
                                                <th>Gas Used</th>
                                                <td>{receipt.gasUsed}</td>
                                            </tr>
                                            <tr>
                                                <th>Nonce</th>
                                                <td>{data.nonce}</td>
                                            </tr>
                                            <tr>
                                                <th>Transaction Index</th>
                                                <td>{data.transactionIndex}</td>
                                            </tr>
                                            <tr>
                                                <th>Input Data</th>
                                                <td>{data.data}</td>
                                            </tr>
                                            {/* Add more hash details as needed */}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='section'>
                    <div className='container'>
                        <div className='columns'>
                            <div className='column'>
                                <h4 className='is-size-5'>Transaction Receipt Event Logs</h4>
                                <hr />
                                <div className='table-container'>
                                    <table className='table is-fullwidth'>
                                        <thead>
                                            <tr>
                                                <th>Index</th>
                                                <th>Address</th>
                                                <th>Data</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {eventLogs.map((log, index) => (
                                                <tr key={index}>
                                                    <td>{index}</td>
                                                    <td>{log.address}</td>
                                                    <td>{log.data}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
