/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import Link from "next/link";
import { useBalance, useContractReads } from "wagmi";
import ExternalLink from "../components/ExternalLink";
import Head from "../components/Head";
import { Table, TableRow } from "../components/Table";
import { formatAmount } from "../utils";
import { recoveryWalletAddress } from "../utils/const";
import { saveNovoContract, saveNovoContractAddress } from "../utils/contract";
import * as blockies from 'blockies-ts';

const fundraiseGoal = 76.5;

const iniatiaves = [
    {
        title: 'Recovery wallet',
        link: `https://etherscan.io/address/${recoveryWalletAddress}`,
        description: 'Make a direct donation to this wallet. The proceeds will be used to buy the punk back.',
        image: typeof window === 'undefined' ? '' : blockies.create({ seed: recoveryWalletAddress })?.toDataURL(),
    },
    {
        title: 'GoFundNovo',
        link: 'https://www.desiena.ch/gofundnovo',
        description: 'Mint a token from this collection. The proceeds will be sent to the recovery wallet.',
        image: '/gofundnovo.png',
    },
    {
        title: 'NovoPixels',
        link: `https://novopixels.com`,
        description: 'Mint a token from this collection. The proceeds will be sent to the recovery wallet.',
        image: '/novopixels.gif',
    },
    {
        title: 'Be careful what you click!',
        link: 'https://app.manifold.xyz/c/cryptonovofundraiser',
        description: 'Mint a token from this collection. The proceeds will be sent to the recovery wallet.',
        image: '/becareful.gif'
    },
    {
        title: 'OnChainNovo',
        link: 'https://opensea.io/collection/onchainnovo',
        description: 'Trade tokens from this collection. The royalties will be sent to the recovery wallet.',
        image: '/onchainnovo.png'
    }
];

const Donated = () => {
    const {
        data: recoveryWalletBalance,
        isLoading: isLoadingRecoveryWalletBalance,
    } = useBalance({
        address: recoveryWalletAddress,
    });
    const {
        data: saveNovoContractBalance,
        isLoading: isLoadingSaveNovoContractBalance,
    } = useBalance({
        address: saveNovoContractAddress,
    });
    const {
        data: darioContractBalance,
        isLoading: isLoadingDarioContractBalance,
    } = useBalance({
        address: '0xda21Efd79e994628E09A3CcA4a268879CF15dAbF',
    });
    const isLoading = isLoadingRecoveryWalletBalance ||
        isLoadingSaveNovoContractBalance ||
        isLoadingDarioContractBalance;
    const donatedOnWallet = Number(recoveryWalletBalance?.value) / Math.pow(10, 18);
    const donatedOnPixels = Number(saveNovoContractBalance?.value) / Math.pow(10, 18);
    const donatedOnDario = Number(darioContractBalance?.value) / Math.pow(10, 18);
    const donatedTotal = donatedOnWallet + donatedOnPixels + donatedOnDario;
    const formatAmount2 = (amount: number, decimals: number) => isLoading ? '-' : formatAmount(amount, decimals);
    return (
        <div style={{ marginTop: 30, textAlign: 'left' }}>
            <Head title="Save Novo" description="Help Novo get his punk back" />
            <div style={{ marginTop: 40 }}>
                On January 4th, 2023, CryptoNovo <ExternalLink href="https://twitter.com/CryptoNovo311/status/1610485939280744456">was scammed</ExternalLink> and lost most of his NFTs, including the iconic CryptoPunk <ExternalLink href="https://cryptopunks.app/cryptopunks/details/3706">#3706</ExternalLink>.<br /><br />
                Several initiatives have been started to help Novo recover his lost punk. This page sums them all.<br /><br />
                Unfortunately, scams still occur everyday. Today it is Novo, but tomorrow it could be you. Let's be helpful.<br /><br />
            </div>
            <h1 style={{marginTop: 15}}>Raised as of now</h1>
            <Table>
                <ExternalLink href={`https://etherscan.io/address/${recoveryWalletAddress}`}>
                    <TableRow>
                        <td style={{flex: 1}}>Recovery wallet balance</td>
                        <td style={{ textAlign: 'right' }}>{formatAmount2(donatedOnWallet, 2)} ETH</td>
                    </TableRow>
                </ExternalLink>
                <ExternalLink href={`https://etherscan.io/address/${saveNovoContractAddress}`}>
                    <TableRow>
                        <td style={{flex: 1}}>NovoPixels contract balance</td>
                        <td style={{ textAlign: 'right' }}>{formatAmount2(donatedOnPixels, 2)} ETH</td>
                    </TableRow>
                </ExternalLink>
                <ExternalLink href={`https://etherscan.io/address/0xda21efd79e994628e09a3cca4a268879cf15dabf`}>
                    <TableRow>
                        <td style={{flex: 1}}>GoFundNovo deployer balance</td>
                        <td style={{ textAlign: 'right' }}>{formatAmount2(donatedOnDario, 2)} ETH</td>
                    </TableRow>
                </ExternalLink>
            </Table>
            <Table style={{ borderTop: 0, marginBottom: 40 }}>
                <TableRow>
                    <td style={{flex: 1}}>Total donated</td>
                    <td style={{ textAlign: 'right' }}>{formatAmount2(donatedTotal, 2)} ETH</td>
                </TableRow>
                <TableRow>
                    <td style={{flex: 1}}>Goal</td>
                    <td style={{ textAlign: 'right' }}>{formatAmount2(fundraiseGoal, 2)} ETH</td>
                </TableRow>
                <TableRow style={{color: '#d60000'}}>
                    <td style={{flex: 1}}>Still missing</td>
                    <td style={{ textAlign: 'right' }}>{formatAmount2(fundraiseGoal - donatedTotal, 2)} ETH</td>
                </TableRow>
            </Table>
            <h1 style={{marginBottom: 0}}>How can I help?</h1>
            <div style={{
                marginTop: 5,
                marginBottom: 25
            }}>These are all vetted community initiatives. Pick one (or several) you like!</div>
            <div>
                {iniatiaves.map(({
                    title,
                    link,
                    description,
                    image
                }, index) => (
                    <div key={`xxx-${title}`} style={{
                        marginBottom: 24,
                        display: 'flex',
                        flexDirection: 'row',
                    }}>
                        <div style={{
                            width: 64,
                            marginRight: 12
                        }}>
                            <Image
                                src={image}
                                alt={title}
                                width={64}
                                height={64}
                            />
                        </div>
                        <div style={{ flex: 1, position: 'relative', top: -3}}>
                            <ExternalLink href={link}>
                                <div>{title}</div>
                            </ExternalLink>
                            <div>{description}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{
                fontWeight: 'bold',
                marginTop: 30,
            }}>Have a good day!</div>
        </div>
    )
};

export default Donated;