import type { GetServerSideProps, NextPage } from 'next'
import Image from 'next/image'
import React from 'react'
import NovoPixels from '../components/NovoPixels';
import SaveNovo from '../components/SaveNovo';

const Home: NextPage<{
  host: string;
}> = ({
  host
}) => {
  if ([
    'novopixels.com'
  ].includes(host)) {
    return <NovoPixels />;
  }
  return (
    <SaveNovo />
  );
}

export default Home;

export const getServerSideProps: GetServerSideProps = async (ctx) => ({
  props: {
    host: ctx.req.headers.host || null
  }
});