import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import useSWR from 'swr';

import ProviderCard from '../../components/ProviderCard';
import { Provider } from '../../libs/types';
import { defaultFetcher } from '../../libs/utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    ProviderListPage: {},
    headerContainer: {
      padding: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    listContainer: {},
    listItem: {
      marginBottom: theme.spacing(4),
    },
  }),
);

const Page: React.FC = () => {
  const classes = useStyles();
  const { data: providerList, error } = useSWR<ReadonlyArray<Provider>>(
    '/api/providers',
    defaultFetcher,
  );

  if (error) {
    return <Box display="flex" justifyContent="center">Failed to load</Box>;
  }

  if (!providerList) {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress />;
      </Box>
    );
  }

  const getProviderListElement = () => {
    if (!providerList) return null;

    return providerList.map(provider => {
      return (
        <div className={classes.listItem} key={provider.name}>
          <ProviderCard provider={provider} />
        </div>
      );
    });
  };

  return (
    <div className={classes.ProviderListPage}>
      <Paper className={classes.headerContainer}>
        <Typography variant="h4">Providers</Typography>
      </Paper>
      <div className={classes.listContainer}>
        { getProviderListElement() }
      </div>
    </div>
  );
};

export default Page;
