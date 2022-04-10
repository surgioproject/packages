import Container from '@material-ui/core/Container';
import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { ArtifactConfig } from 'surgio/build/types';
import useSWR from 'swr';
import {
  useParams,
  useLocation
} from "react-router-dom";
import ArtifactCard from '../../../components/ArtifactCard';

import { defaultFetcher } from '../../../libs/utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    EmbedArtifactPage: {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#fff',
    },
  }),
);

const Page: React.FC = () => {
  const classes = useStyles();
  const { artifactName } = useParams<{artifactName: string}>();
  const location = useLocation();
  const artifactParams = new URLSearchParams(location.search);
  const { data: artifact, error } = useSWR<ArtifactConfig>(
    `/api/artifacts/${artifactName}`,
    defaultFetcher,
  );

  if (error) {
    return <div className={classes.EmbedArtifactPage}>Failed to load</div>;
  }

  if (!artifact) {
    return (
      <div className={classes.EmbedArtifactPage}>
        Loading...
      </div>
    );
  }

  ['dl', 'access_token'].forEach(key => {
    artifactParams.delete(key);
  });

  return (
    <Container className={classes.EmbedArtifactPage} >
      <ArtifactCard artifact={artifact} isEmbed artifactParams={artifactParams} />
    </Container>
  );
};

export default Page;
