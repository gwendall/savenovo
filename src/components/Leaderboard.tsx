import axios from "axios";
import Link from "next/link";
import React from "react";
import { useQuery } from "react-query";
import styled from "styled-components";
import { mainnet, useEnsName } from "wagmi";
import { EthereumAddress, shortenAddress } from "../utils";
import { saveNovoContractAddress } from "../utils/contract";
import ExternalLink from "./ExternalLink";
import { Table, TableRow } from "./Table";

const LeaderboardRow: React.FC<{
    address: EthereumAddress;
    count: number;
}> = ({ address, count }) => {
    const {
        data: ensName
    } = useEnsName({
        address,
        chainId: mainnet.id,
        enabled: Boolean(address),
    });
    return (
        <ExternalLink href={`https://opensea.io/${address}`}>
            <TableRow>
                <td style={{flex: 1}}>{ensName || shortenAddress(address)}</td>
                <td style={{ textAlign: 'right' }}>{count} pixel{count>1?'s':''}</td>
            </TableRow>
        </ExternalLink>
    )
};

const LeaderboardContainer = styled.div`
    margin: 50px 0 25px 0;
`;

const LeaderboardTitle = styled.div`
    margin-bottom: 10px;
    font-weight: bold;
    text-align: center;
`;

const LeaderboardTable = styled.table`
    display: table; 
    width: 100%; 
    table-layout: fixed;
    border: black solid thin;
    padding: 5px 0;
`;

const Leaderboard = () => {
    const { data: owners = [], isLoading } = useQuery({
        queryKey: "owners",
        queryFn: () => axios.get('https://api.reservoir.tools/owners/v1', {
            headers: {
                withCredentials: false,
                ['x-api-key']: 'a6fd6fb8-564f-5b46-8e12-b02134cfd70e',
            },
            params: {
                collection: saveNovoContractAddress,
                offset: 0,
                limit: 500
            }
        }).then(({ data }) => data?.owners || []),
        keepPreviousData: true,
        refetchOnWindowFocus: true,
        refetchInterval: 1000 * 10,
    });
    const [showAll, setShowAll] = React.useState<Boolean>(false);
    const filteredOwners = showAll ? owners : owners.slice(0, 10);
    return (
        <LeaderboardContainer>
            <LeaderboardTitle>Supporters leaderboard</LeaderboardTitle>
            {isLoading ? <div>Loading...</div> : owners.length === 0 ? (
                <div>
                    Could not load leaderboard, try again later.
                </div>
            ) : (
                <>
                    <Table>
                        {filteredOwners.map(({ address, ownership }: any) => (
                            <LeaderboardRow key={ `row-${address}`}  address={address} count={ownership.tokenCount} />
                        ))}
                    </Table>
                    {!showAll ? (
                        <a onClick={() => setShowAll(true)} style={{
                            cursor: 'pointer',
                            textAlign: 'center',
                            margin: 'auto',
                            marginTop: 10,
                            display: 'table'
                        }}>
                            Show more supporters
                        </a>
                    ) : null}
                </>
            )}
        </LeaderboardContainer>
    )
};

export default Leaderboard;