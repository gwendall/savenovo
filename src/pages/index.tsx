import type { GetServerSideProps, NextPage } from 'next'
import Image from 'next/image'
import React from 'react'
import PunksInParis from '../components/PunksInParis';
import NovoPixels from '../components/NovoPixels';
import SaveNovo from '../components/SaveNovo';

const Home: NextPage<{
  host: string;
}> = ({
  host
}) => {
  if ([
    'savenovo.com'
  ].includes(host)) {
    return <SaveNovo />;
  }
  if ([
    'punksinparis.xyz',
    'punks.fr'
  ].includes(host)) {
    return <PunksInParis />;
  }
  return (
    <NovoPixels />
  );
}

export default Home;

export const getServerSideProps: GetServerSideProps = async (ctx) => ({
  props: {
    host: ctx.req.headers.host || null
  }
});