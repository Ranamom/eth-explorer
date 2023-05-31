import Image from 'next/image';
import React, { Component } from 'react';
import logo from '../public/logo.png';
import Head from 'next/head';

export default class Layout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            search: ''
        };
    }

    search = (e) => {
        e.preventDefault();
        if (this.state.search === '') {
            return alert('Please type something to search');
        }

        const { search } = this.state;

        // Check if the input is an address
        if (search.startsWith('0x') && search.length === 42) {
            window.location.href = `/search-address?str=${search}`;
        }
        // Check if the input is a hash
        else if (search.startsWith('0x') && search.length === 66) {
            window.location.href = `/search-hash?str=${search}`;
        }
        // Check if the input is a block number
        else if (!isNaN(search)) {
            window.location.href = `/explore-block?str=${search}`;
        }
        // Invalid input
        else {
            alert('Invalid search input');
        }
    };

    render() {
        const { children } = this.props;
        return (
            <>
                <Head>
                    <title>Explore the Blockchain</title>
                    <link href="https://cdn.lineicons.com/4.0/lineicons.css" rel="stylesheet" />
                </Head>
                <nav className="navbar is-link" role="navigation" aria-label="main navigation">
                    <div className="navbar-brand">
                        <a className="navbar-item" href="/">
                            <Image src={logo} alt="logo" width={60} height={80} />
                        </a>
                        <a role="button" href='/' className="navbar-burger" aria-label="menu">
                            <i class="lni lni-home mt-3"></i>
                        </a>
                    </div>
                    <div id="navbarBasicExample" className="navbar-menu">
                        <div className="navbar-end">
                            <div className="navbar-item">
                                <a href='/' className='lni lni-home'> Home
                                </a>
                            </div>
                        </div>
                    </div>
                </nav>
                <div className="container mt-4">
                    <div className="columns is-centered">
                        <div className="column is-half">
                            <form onSubmit={this.search}>
                                <div className="field has-addons">
                                    <div className="control is-expanded">
                                        <input
                                            className="input is-primary"
                                            type="text"
                                            placeholder="Search Hash, Block number, Address etc"
                                            value={this.state.search}
                                            onChange={(e) => this.setState({ search: e.target.value })}
                                        />
                                    </div>
                                    <div className="control">
                                        <button type="submit" className="button is-primary">
                                            Search
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    {children}
                </div>
                <footer className="footer has-background-dark has-text-light has-text-centered mt-6">
                    <div className="content">
                        <p>
                            &copy; {new Date().getFullYear()} {process.env.NEXT_PUBLIC_BRAND_NAME}. All rights reserved.
                            <br />
                            <small style={{ color: '#ccc' }}>Disclaimer: This website provides information on the blockchain and is for informational purposes only. It does not provide financial or investment advice.</small>
                        </p>
                    </div>
                </footer>
            </>
        );
    }
}
