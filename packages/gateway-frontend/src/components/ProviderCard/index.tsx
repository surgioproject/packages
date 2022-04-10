import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import DnsIcon from '@material-ui/icons/Dns';
import Chip from '@material-ui/core/Chip';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import { useSnackbar } from 'notistack';

import { Provider } from '../../libs/types';
import { defaultFetcher } from '../../libs/utils';
import ProviderCopyButtons from '../ProviderCopyButtons';

const useStyles = makeStyles((theme) => ({
  ProviderCard: {
    '& .MuiCardActions-root': {
      flexWrap: 'wrap',
    },
  },
  providerType: {
    margin: theme.spacing(0, 0, 2),
  },
  urlContainer: {
    'background-color': '#eee',
    padding: theme.spacing(2, 3),
    margin: theme.spacing(2, 0, 0),
    '-webkit-overflow-scrolling': 'touch',
    'overflow-x': 'scroll',
    'font-family': ['fira-code', 'monospace'].join(','),
  },
  actionButton: {
    margin: theme.spacing(1),
    textDecoration: 'none',
  },
}));

export interface ProviderCardProps {
  provider: Provider;
}

function ProviderCard({ provider }: ProviderCardProps) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const checkSubscription = (providerName: string) => {
    (async () => {
      const data = await defaultFetcher<any>(
        `/api/providers/${providerName}/subscription`
      );

      if (data) {
        enqueueSnackbar(
          `🤟 已用流量：${data.used} 剩余流量：${data.left} 有效期至：${data.expire}`,
          { variant: 'success' }
        );
      } else {
        enqueueSnackbar('该 Provider 不支持查询', { variant: 'error' });
      }
    })().catch((err) => {
      enqueueSnackbar('网络问题', { variant: 'error' });
    });
  };

  return (
    <Card className={classes.ProviderCard}>
      <CardHeader title={provider.name} />

      <CardContent>
        <div className={classes.providerType}>
          <Chip icon={<DnsIcon fontSize="small" />} label={provider.type} />
        </div>

        {provider.url ? (
          <Typography
            className={classes.urlContainer}
            component="pre"
            paragraph
          >
            {provider.url}
          </Typography>
        ) : null}
      </CardContent>

      <CardActions disableSpacing>
        {provider.supportGetSubscriptionUserInfo ? (
          <Button
            className={classes.actionButton}
            variant="contained"
            color="primary"
            onClick={() => checkSubscription(provider.name)}
          >
            查询流量
          </Button>
        ) : null}
        <div className={classes.actionButton}>
          <ProviderCopyButtons providerNameList={[provider.name]} />
        </div>
      </CardActions>
    </Card>
  );
}

export default ProviderCard;
