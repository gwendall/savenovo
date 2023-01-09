import Link from "next/link";
import styled, { createGlobalStyle } from "styled-components";
import Head from "./Head";

const GlobalStyle = createGlobalStyle`
  body {
    background-color: white;
    min-height: 100vh;
  }
  * {
    box-sizing: border-box;
  }
`;

const Container = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  font-family: 'VT323', monospace;
  pre {
    text-align: left;
  }
  * {
    font-size: 1.4rem;
  }
  a {
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Title = styled.div`
  margin-bottom: 10px;
  font-weight: bold;
  color: #d60000;
  font-size: 2.4rem;
`;

const Main = styled.main`
  width: 100%;
  min-height: 100vh;
  max-width: 740px;
  margin: auto;
  padding: 30px 15px;
  padding-top: 15px;
  position: relative;
`;

const Layout: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => (
    <>
        <Head
            {...{
                title: 'NovoPixels',
                description: 'Help CryptoNovo get his punk back',
                image: 'https://novopixels.com/banner.png',
                url: 'https://novopixels.com',
                siteName: 'novopixels.com',
                type: 'profile',
            }}
        />
        <GlobalStyle />
        <Container>
            <div style={{
                background: '#229000',
                color: 'white',
                padding: '10px 15px',
                marginTop: 10,
                display: 'none'
            }}>
                This is just a testnet version. The official mint will go live on Monday, January 9th at 10am EST.
            </div>
            <Main>
                <Link href="/">
                    <Title>NovoPixels</Title>
                </Link>
                <div>{ `Mint novo's punk pixels to help buy his punk back` }</div>
                {children}
            </Main>
        </Container>
    </>
);

export default Layout;