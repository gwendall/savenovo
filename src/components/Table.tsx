import styled from "styled-components";

export const Table = styled.table`
    display: table; 
    width: 100%; 
    table-layout: fixed;
    border: black solid thin;
`;

export const TableRow = styled.tr`
    display: flex;
    flex-direction: row;
    padding: 5px 12px;
    color: black;
    td:first-child {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        margin-right: 10px;
        text-align: left;
    }
    @media(hover: hover) {
        &:hover {
            color: #229000;
        }
    }
`;
