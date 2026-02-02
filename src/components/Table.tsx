import styled from "styled-components";

export const Table = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    border: black solid thin;
`;

export const TableRow = styled.div`
    display: flex;
    flex-direction: row;
    padding: 5px 12px;
    color: black;
    & > *:first-child {
        flex: 1;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        margin-right: 10px;
        text-align: left;
    }
    & > *:last-child {
        text-align: right;
    }
    @media(hover: hover) {
        &:hover {
            color: #229000;
        }
    }
`;
