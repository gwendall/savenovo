import Link from "next/link";
import { useRouter } from "next/router";
import styled, { createGlobalStyle } from "styled-components";
import Head from "./Head";
import ExternalLink from "./ExternalLink";

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

const saveNovoData = {
  title: 'SaveNovo',
  description: 'Help CryptoNovo get his punk back',
  tagline: `All the initiatives to help Novo get his punk back`,
  image: 'banner.png',
};

const novoPixelsData = {
  title: 'NovoPixels',
  description: 'Help CryptoNovo get his punk back',
  tagline: `Mint novo's punk pixels to help buy his punk back`,
  image: 'banner.png',
};

const punksInParisData = {
  title: 'Punks in Paris',
  description: 'Bonjour (BJ) les punks, bienvenue à Paris',
  tagline: 'Bonjour (BJ) les punks, bienvenue à Paris',
  image: 'punksinparis.png',
};

const novoArtShowData = {
  title: 'Novo Art Show',
  description: 'Burn your GoFundNovo tokens to get art',
  tagline: '',
  image: 'banner.png',
};

type AppData = {
  title: string;
  description: string;
  tagline: string;
  image: string;
};

const getData = (host: string): AppData => {
  if (host === 'savenovo.com') {
    return saveNovoData;
  }
  if (
    [
      'punks.fr',
      'punksinparis.xyz',
      'jaimelespunks.com',
      'jaimelespunks.xyz',
    ].includes(host)
  ) {
    return punksInParisData;
  }
  return novoPixelsData;
};

const useData = (host: string): AppData => {
  const router = useRouter();
  if (router.pathname.startsWith('/art')) { 
    return novoArtShowData;
  }
  return getData(host);
};

const Layout: React.FC<{
  children: React.ReactNode;
  host?: string;
}> = ({
  children,
  host
}) => {
  const {
    title,
    description,
    tagline,
    image,
  } = useData(host as string);
  return (
    <>
      <Head
        {...{
          title,
          description,
          image: `https://${host}/${image}`,
          url: `https://${host}`,
          siteName: host,
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
            <Title>{ title }</Title>
          </Link>
          <div>{ tagline }</div>
          {children}
          <div>
            <div>---</div>
            <ExternalLink href="https://github.com/gwendall/savenovo">View the source code of this website</ExternalLink>
          </div>
        </Main>
      </Container>
    </>
  )
};

export default Layout;