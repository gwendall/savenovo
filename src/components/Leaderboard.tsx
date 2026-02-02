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
        <Link href={`/?wallet=${address}`} replace scroll>
            <TableRow>
                <span style={{flex: 1}}>{ensName || shortenAddress(address)}</span>
                <span style={{ textAlign: 'right' }}>{count} pixel{count>1?'s':''}</span>
            </TableRow>
        </Link>
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

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY;

const Leaderboard = () => {
    const { data: owners = [], isLoading } = useQuery({
        queryKey: "owners",
        queryFn: async () => {
            if (!ALCHEMY_API_KEY) return [];

            const response = await axios.get(
                `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getOwnersForContract`,
                {
                    params: {
                        contractAddress: saveNovoContractAddress,
                        withTokenBalances: true,
                    }
                }
            );

            // Transform Alchemy response to match expected format
            const ownersData = response.data?.owners || [];
            return ownersData
                .map((owner: any) => ({
                    address: owner.ownerAddress,
                    ownership: {
                        tokenCount: owner.tokenBalances?.length || 0
                    }
                }))
                .filter((owner: any) => owner.ownership.tokenCount > 0)
                .sort((a: any, b: any) => b.ownership.tokenCount - a.ownership.tokenCount);
        },
        keepPreviousData: true,
        refetchOnWindowFocus: true,
        refetchInterval: 1000 * 10,
        enabled: Boolean(ALCHEMY_API_KEY),
    });
    const [showAll, setShowAll] = React.useState<Boolean>(false);
    const filteredOwners = showAll ? owners : owners.slice(0, 10);
    return (
        <LeaderboardContainer>
            <LeaderboardTitle>Supporters leaderboard</LeaderboardTitle>
            {!ALCHEMY_API_KEY ? (
                <div>Leaderboard unavailable</div>
            ) : isLoading ? <div>Loading...</div> : owners.length === 0 ? (
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
