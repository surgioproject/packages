import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Clipboard from 'react-clipboard.js';
import Link from '@material-ui/core/Link';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { ArtifactConfig } from 'surgio/build/types';

import { getDownloadUrl, getToken } from '../../libs/utils';

const useStyles = makeStyles(theme => ({
  root: {
  },
  urlContainer: {
    'background-color': '#eee',
    'padding': theme.spacing(2, 3),
    '-webkit-overflow-scrolling': 'touch',
    'overflow-x': 'scroll',
    'font-family': [
      'fira-code',
      'monospace',
    ].join(','),
  },
  providersContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  providerTag: {
    'background-color': '#353535',
    'color': '#fff',
    'padding': '0 10px',
    'margin': '0 5px 8px 0',
    'height': '26px',
    'line-height': '26px',
    'border-radius': '13px',
    fontSize: 12,
  },
  actionButton: {
    margin: theme.spacing(1),
    textDecoration: 'none',
  },
}));

export interface ArtifactCardProps {
  artifact: ArtifactConfig;
}

export default function ArtifactCard({ artifact }: ArtifactCardProps) {
  const classes = useStyles();
  const providers = [artifact.provider].concat(artifact.combineProviders || []);
  const providersElement = providers.map(item => {
    return (
      <span className={classes.providerTag} key={item}>
        { item }
      </span>
    );
  });
  const accessToken = getToken();
  const downloadUrl = getDownloadUrl(artifact.name, false, accessToken);
  const previewUrl = getDownloadUrl(artifact.name, true, accessToken);

  const onCopySuccess = () => {
    window.alert('复制成功');
  };

  const onCopyError = () => {
    window.alert('复制失败');
  };

  return (
    <Card className={classes.root}>
      <CardHeader title={artifact.name} />

      <CardContent>
        <Typography className={classes.urlContainer}
                    component="pre"
                    paragraph>
          { downloadUrl }
        </Typography>

        <Typography gutterBottom variant="h6">
          Providers
        </Typography>
        <div className={classes.providersContainer}>
          { providersElement }
        </div>
      </CardContent>

      <CardActions disableSpacing>
        <Link target="_blank" href={downloadUrl}>
          <Button className={classes.actionButton}
                  variant="contained"
                  size="medium"
                  color="primary">
            下载
          </Button>
        </Link>

        <Link target="_blank" href={previewUrl}>
          <Button className={classes.actionButton}
                  variant="contained"
                  size="medium"
                  color="primary">
            预览
          </Button>
        </Link>

        <Clipboard component="div"
                   data-clipboard-text={downloadUrl}
                   onSuccess={onCopySuccess}
                   onError={onCopyError}>
          <Button className={classes.actionButton}
                  variant="contained"
                  size="medium"
                  color="primary">
            复制地址
          </Button>
        </Clipboard>
      </CardActions>
    </Card>
  );
}
