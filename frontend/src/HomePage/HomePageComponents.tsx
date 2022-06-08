import styled from "styled-components";

export const Row = styled.div`
    display: flex;
    flex-direction: row;
    height: 10%;
    justify-content: space-between;
`;
export const Title = styled.div`
    font-size:60px;
    font-family:  "Rockwell",Arial, sans-serif;
    color: 	rgb(192,192,192);
    display: flex;
    margin-left: auto;
     margin-right: auto;
`;
export const Column = styled.div`
    display: flex;
    flex-direction: column;
    height: 60%;
    justify-content: space-between;
`;

export const BackgroundDiv = styled.div`
    background-image: url('/stolen_asset.jpg');
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-size: 100% 100%;
    height: 89%;
    width: 95%;
    margin: 3px;
    padding: 8px;
    position: absolute;
    border-color: black;
    border-style: solid;
    border-width: 2px;
`;

export const Navbar = styled.div`
width: 95%;
height: fit-content;

border: 2px solid black;

background-color: #63FFFE;

padding: 5px;
margin: 3px;
`;