import { ethers } from 'ethers';
import React, { Component } from 'react';
import moment from 'moment';

const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

export default class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      blocks: [],
      txns: [],
      loading: true,
    };
  }

  async componentDidMount() {
    await this.getLast20Blocks();
    this.setState({ loading: false });
  }

  async getLast20Blocks() {
    let latestBlockNumber = await provider.getBlockNumber();
    let blocks = [];
    for (let i = 0; i < Math.min(latestBlockNumber, 20); i++) {
      let block = await provider.getBlock(latestBlockNumber - i);
      blocks.push(block);
    }
    let transactions = [];
    let blockNumber = latestBlockNumber;

    while (transactions.length < 40 && blockNumber > 0) {
      let block = await provider.getBlock(blockNumber);
      for (let i = 0; i < block.transactions.length && transactions.length < 40; i++) {
        let transaction = await provider.getTransaction(block.transactions[i]);
        transaction.timestamp = block.timestamp;
        transactions.push(transaction);
      }
      blockNumber--;
    }
    this.setState({ blocks: blocks, txns: transactions.slice(0, 40) });
  }

  render() {
    return (
      <div className='section'>
        {this.state.loading && (
          <div className="loading-overlay">
            <div className="loading-icon"></div>
          </div>)
        }
        <div className='container'>
          <div className='columns'>
            <div className='column'>
              <div className='card'>
                <header className='card-header'>
                  <p className='card-header-title is-centered'>Latest Blocks</p>
                </header>
                <div className='card-content'>
                  <div className='content'>
                    <table className='table is-fullwidth'>
                      <thead>
                        <tr>
                          <th>Block</th>
                          <th></th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.blocks.map((block) => (
                          <tr key={block.hash}>
                            <td><i class="lni lni-layout"></i> {block.number}</td>
                            <td>{moment(block.timestamp * 1000).fromNow()}</td>
                            <td><a href={'/explore-block?str=' + block.number} className='button is-link is-small'>Scan &rarr;</a></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className='column'>
              <div className='card'>
                <header className='card-header'>
                  <p className='card-header-title is-centered'>Latest Transactions</p>
                </header>
                <div className='card-content transactions-table-container'>
                  <div className='content'>
                    <table className='table is-fullwidth'>
                      <thead>
                        <tr>
                          <th>Hash</th>
                          <th></th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.txns.map((txn) => (
                          <tr key={txn.hash}>
                            <td><i class="lni lni-fitbit"></i> {txn.hash}</td>
                            <td>{moment(txn.timestamp * 1000).fromNow()}</td>
                            <td><a href={'/search-hash?str=' + txn.hash} className='button is-warning is-small'>View &rarr;</a></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
