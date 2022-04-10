import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
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
    listItem: {},
  })
);

const Page: React.FC = () => {
  const classes = useStyles();
  const { data: providerList, error } = useSWR<ReadonlyArray<Provider>>(
    '/api/providers',
    defaultFetcher
  );

  const getProviderListElement = () => {
    if (error) {
      return (
        <Box display="flex" justifyContent="center">
          Failed to load
        </Box>
      );
    }

    if (!providerList) {
      return (
        <Box display="flex" justifyContent="center">
          <CircularProgress />;
        </Box>
      );
    }

    return (
      <div className={classes.listContainer}>
        <Grid container spacing={3}>
          {providerList.map((provider) => {
            return (
              <Grid
                item
                xs={12}
                lg={6}
                className={classes.listItem}
                key={provider.name}
              >
                <ProviderCard provider={provider} />
              </Grid>
            );
          })}
        </Grid>
      </div>
    );
  };

  return (
    <div className={classes.ProviderListPage}>
      <Paper className={classes.headerContainer}>
        <Typography variant="h4">Providers</Typography>
      </Paper>

      {getProviderListElement()}
    </div>
  );
};

export default Page;
