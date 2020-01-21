import React from 'react';
import useSWR from 'swr';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { ArtifactConfig } from 'surgio/build/types';

import { defaultFetcher } from '../../libs/utils';
import { Config } from '../../types';
import ArtifactCard from '../../components/ArtifactCard';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    listContainer: {
    },
    listItem: {
      marginBottom: theme.spacing(3),
    },
  }),
);

const Page: React.FC = () => {
  const classes = useStyles();
  const { data: config } = useSWR<Config>(
    '/api/config',
    defaultFetcher,
  );
  const { data: artifactList, error } = useSWR<ReadonlyArray<ArtifactConfig>>(
    '/api/artifacts',
    defaultFetcher,
  );

  if (error) {
    return <div>Failed to load</div>;
  }

  if (!artifactList) {
    return <div>Loading...</div>;
  }

  const list = artifactList.map(item => {
    return (
      <div className={classes.listItem} key={item.name}>
        <ArtifactCard artifact={item} />
      </div>
    );
  });

  return (
    <div className="ArtifactListPage">
      <div className={classes.listContainer}>
        { list }
      </div>
    </div>
  );
};

export default Page;
