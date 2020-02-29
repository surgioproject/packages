import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import React from 'react';
import useSWR from 'swr';
import uniqWith from 'lodash-es/uniqWith';

import { Provider } from '../../libs/types';
import { defaultFetcher } from '../../libs/utils';

const useStyles = makeStyles(theme => ({
  SubscriptionPanel: {
    padding: theme.spacing(2),
  },
  SubscriptionPanelItem: {},
}));

export interface SubscriptionPanelItemProps {
  provider: Provider;
}

function SubscriptionPanel() {
  const classes = useStyles();
  const { data: providerList, error } = useSWR<ReadonlyArray<Provider>>(
    '/api/providers',
    defaultFetcher,
  );

  if (error) {
    return <Box display="flex" justifyContent="center">Failed to load</Box>;
  }

  if (!providerList) {
    return <CircularProgress />;
  }

  const supportedProviderList = uniqWith(
    providerList
      .filter(provider => provider.supportGetSubscriptionUserInfo && provider.url),
    (provider, other) => {
      // return new URL(provider.url as string).host === new URL(other.url as string).host;
      return provider.url === other.url;
    }
  );

  return (
    <Paper className={classes.SubscriptionPanel}>
      <Typography gutterBottom variant="h4">订阅</Typography>

      <Grid container spacing={3}>
        {
          supportedProviderList.map((provider: Provider) => {
            return (
              <SubscriptionPanelItem provider={provider}
                                     key={provider.name} />
            );
          })
        }
      </Grid>

    </Paper>
  );
}

function SubscriptionPanelItem({ provider }: SubscriptionPanelItemProps) {
  const classes = useStyles();
  const { data, error } = useSWR<any>(
    `/api/providers/${provider.name}/subscription`,
    defaultFetcher,
  );

  if (error) {
    return (
      <Grid item xs={12} sm={6} lg={4} key={provider.name}>
        <div className={classes.SubscriptionPanelItem}>
          <Typography gutterBottom variant="h6">
            { provider.name }
          </Typography>
          <Typography gutterBottom variant="body2">
            Failed to load
          </Typography>
        </div>
      </Grid>
    );
  }

  if (typeof data === 'undefined') {
    return (
      <Grid item xs={12} sm={6} lg={4} key={provider.name}>
        <Typography gutterBottom variant="h6">
          { provider.name }
        </Typography>
        <Skeleton />
        <Skeleton />
      </Grid>
    );
  }

  if (data === null) {
    return (<></>);
  }

  return (
    <Grid item xs={12} sm={6} lg={4} key={provider.name}>
      <div className={classes.SubscriptionPanelItem}>
        <Typography gutterBottom variant="h6">
          { provider.name }
        </Typography>
        <div>
          <Typography gutterBottom variant="body2">
            已用流量：{data.used}
          </Typography>
          <Typography gutterBottom variant="body2">
            剩余流量：{data.left}
          </Typography>
          <Typography gutterBottom variant="body2">
            有效期至：{data.expire}
          </Typography>
        </div>
      </div>
    </Grid>
  );
}

export default SubscriptionPanel;
