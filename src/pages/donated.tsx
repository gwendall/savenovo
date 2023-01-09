import Link from "next/link";
import { useBalance, useContractReads } from "wagmi";
import ExternalLink from "../components/ExternalLink";
import { Table, TableRow } from "../components/Table";
import { formatAmount } from "../utils";
import { recoveryWalletAddress } from "../utils/const";
import { saveNovoContract, saveNovoContractAddress } from "../utils/contract";

const fundraiseGoal = 80;

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
        <div style={{marginTop: 30}}>
            <h1>All donations to help Novo</h1>
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