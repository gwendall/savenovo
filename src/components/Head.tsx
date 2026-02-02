import NextHead from 'next/head';
import React from 'react';

const viewportContent = [
  'minimum-scale=1.0',
  'maximum-scale=1.0',
  'initial-scale=1.0',
  'user-scalable=no',
  'width=device-width',
].join(', ');

type HeadProps = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  siteName?: string;
  type?: string; // "profile"
};

const Head: React.FC<HeadProps> = ({
  title = 'SaveNovo',
  description = 'Help CryptoNovo get his punk back',
  image = '/banner.png',
  url = '/',
  siteName = 'SaveNovo',
  type = 'profile',
}) => (
  <NextHead>
    {
      title ? (
        <>
          <title>{title}</title>
          <meta data-rh="true" name="title" content={ title } />
          <meta data-rh="true" name="og:title" content={ title } />
          <meta data-rh="true" name="twitter:title" content={ title } />
        </>
      ) : null
    }
    {
      description ? (
        <>
          <meta data-rh="true" name="description" content={ description } />
          <meta data-rh="true" name="og:description" content={ description } />
          <meta data-rh="true" name="twitter:description" content={ description } />
        </>
      ) : null
    }
    {
      image ? (
        <>
          <meta data-rh="true" name="image" content={ image } />
          <meta data-rh="true" name="og:image" content={ image } />
          <meta data-rh="true" name="twitter:image" content={ image } />
        </>
      ) : null
    }
    <meta data-rh="true" name="og:type" content={ type } />
    <meta data-rh="true" name="og:site_name" content={ siteName } />
    <meta data-rh="true" name="og:url" content={ url } />
    <meta data-rh="true" name="twitter:card" content="summary_large_image" />
    <meta data-rh="true" name="twitter:site" content="@gwendall" />
    <meta data-rh="true" name="twitter:creator" content="@gwendall" />
    <meta name="viewport" content={ viewportContent } />
    <meta name="theme-color" content="#000000" />
  </NextHead>
);

export default Head;
