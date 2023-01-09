import Link from "next/link";
import { useBalance, useContractReads } from "wagmi";
import ExternalLink from "../components/ExternalLink";
import Head from "../components/Head";
import { Table, TableRow } from "../components/Table";
import { formatAmount } from "../utils";
import { recoveryWalletAddress } from "../utils/const";
import { saveNovoContract, saveNovoContractAddress } from "../utils/contract";

const fundraiseGoal = 76.5;

const iniatiaves = [
    {
        title: 'Recovery wallet',
        link: `https://etherscan.io/address/${recoveryWalletAddress}`,
        description: 'Make a direct donation to this wallet. The proceeds will be used to buy the punk back.',
    },
    {
        title: 'GoFundNovo',
        link: 'https://www.desiena.ch/gofundnovo',
        description: 'Mint a token from this collection. It will be burnable and redeemable for a piece of art based on Novo. The proceeds will be sent to the recovery wallet.',
    },
    {
        title: 'NovoPixels',
        link: `https://novopixels.com`,
        description: 'Mint a token from this collection. The proceeds will be sent to the recovery wallet.',
    },
    {
        title: 'Be careful what you click!',
        link: 'https://app.manifold.xyz/c/cryptonovofundraiser',
        description: 'Mint a token from this collection. The proceeds will be sent to the recovery wallet.',
    },
    {
        title: 'OnChainNovo',
        link: 'https://opensea.io/collection/onchainnovo',
        description: 'Trade tokens from this collection. The royalties will be sent to the recovery wallet.',
    }
];

const Donated = () => {
    const { data: recoveryWalletBalance } = useBalance({
        address: recoveryWalletAddress,
    });
    const { data: saveNovoContractBalance } = useBalance({
        address: saveNovoContractAddress,
    });
    const { data: darioContractBalance } = useBalance({
        address: '0xda21Efd79e994628E09A3CcA4a268879CF15dAbF',
    });
    const donatedOnWallet = Number(recoveryWalletBalance?.value) / Math.pow(10, 18);
    const donatedOnPixels = Number(saveNovoContractBalance?.value) / Math.pow(10, 18);
    const donatedOnDario = Number(darioContractBalance?.value) / Math.pow(10, 18);
    const donatedTotal = donatedOnWallet + donatedOnPixels + donatedOnDario;
    return (
        <div style={{ marginTop: 30, textAlign: 'left' }}>
            <Head description="See how much has been donated" />
            <h1>How can I help?</h1>
            <div style={{
                
            }}>
                {iniatiaves.map(({
                    title,
                    link,
                    description
                }, index) => (
                    <div key={`xxx-${title}`} style={{marginBottom: 20}}>
                        <ExternalLink href={link}>
                            <div>{ index + 1}. {title}</div>
                        </ExternalLink>
                        <div>{description}</div>
                    </div>
                ))}
            </div>
            <h1 style={{marginTop: 50}}>Raised as of now</h1>
            <Table>
                <ExternalLink href={`https://etherscan.io/address/${recoveryWalletAddress}`}>
                    <TableRow>
                        <td style={{flex: 1}}>Recovery wallet balance</td>
                        <td style={{ textAlign: 'right' }}>{formatAmount(donatedOnWallet, 2)} ETH</td>
                    </TableRow>
                </ExternalLink>
                <ExternalLink href={`https://etherscan.io/address/${saveNovoContractAddress}`}>
                    <TableRow>
                        <td style={{flex: 1}}>NovoPixels contract balance</td>
                        <td style={{ textAlign: 'right' }}>{formatAmount(donatedOnPixels, 2)} ETH</td>
                    </TableRow>
                </ExternalLink>
                <ExternalLink href={`https://etherscan.io/address/0xda21efd79e994628e09a3cca4a268879cf15dabf`}>
                    <TableRow>
                        <td style={{flex: 1}}>GoFundNovo deployer balance</td>
                        <td style={{ textAlign: 'right' }}>{formatAmount(donatedOnDario, 2)} ETH</td>
                    </TableRow>
                </ExternalLink>
            </Table>
            <Table style={{ borderTop: 0 }}>
                <TableRow>
                    <td style={{flex: 1}}>Total donated</td>
                    <td style={{ textAlign: 'right' }}>{formatAmount(donatedTotal, 2)} ETH</td>
                </TableRow>
                <TableRow>
                    <td style={{flex: 1}}>Goal</td>
                    <td style={{ textAlign: 'right' }}>{formatAmount(fundraiseGoal, 2)} ETH</td>
                </TableRow>
                <TableRow style={{color: '#d60000'}}>
                    <td style={{flex: 1}}>Still missing</td>
                    <td style={{ textAlign: 'right' }}>{formatAmount(fundraiseGoal - donatedTotal, 2)} ETH</td>
                </TableRow>
            </Table>
        </div>
    )
};

export default Donated;