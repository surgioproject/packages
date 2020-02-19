import { observer } from 'mobx-react';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import { ArtifactConfig } from 'surgio/build/types';

import { getDownloadUrl } from '../../libs/utils';
import { useStores } from '../../stores';
import ActionButtons from '../ActionButtons';
import ArtifactCopyButtons from '../ArtifactCopyButtons';

const useStyles = makeStyles(theme => ({
  ArtifactCard: {
    '& .MuiCardActions-root': {
      flexWrap: 'wrap',
    },
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
  contentSection: {
    margin: theme.spacing(1.5, 0),
    '&:first-child': {
      marginTop: 0,
    },
    '&:last-child': {
      marginBottom: 0,
    },
  },
  providersContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  categoriesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  tag: {
    margin: theme.spacing(0.5),
  },
  actionButton: {
    margin: theme.spacing(1),
    textDecoration: 'none',
  },
}));

export interface ArtifactCardProps {
  artifact: ArtifactConfig;
}

function ArtifactCard({ artifact }: ArtifactCardProps) {
  const classes = useStyles();
  const { config: configStore } = useStores();
  const providers = [artifact.provider].concat(artifact.combineProviders || []);
  const downloadUrl = getDownloadUrl(artifact.name, false, configStore.config.accessToken);
  const previewUrl = getDownloadUrl(artifact.name, true, configStore.config.accessToken);

  const providersElement = providers.map(item => {
    return (
      <Chip data-testid="display-provider-item"
            className={classes.tag}
            key={item}
            label={item} />
    );
  });

  const categoriesElement = artifact.categories
    ? artifact.categories.map(cat =>(
        <Chip data-testid="display-category-item"
              className={classes.tag}
              key={cat}
              label={cat} />
      ))
    : null;

  return (
    <Card className={classes.ArtifactCard}>
      <CardHeader title={artifact.name} />

      <CardContent>
        {/*<Typography className={classes.urlContainer}*/}
        {/*            component="pre"*/}
        {/*            paragraph>*/}
        {/*  { previewUrl }*/}
        {/*</Typography>*/}

        <div data-testid="display-provider-list"
             className={classes.contentSection}>
          <Typography gutterBottom variant="body1">
            Providers
          </Typography>
          <div className={classes.providersContainer}>
            { providersElement }
          </div>
        </div>

        {
          artifact.categories && (
            <>
              <Divider />
              <div className={classes.contentSection}>
                <Typography gutterBottom variant="body1">
                  分类
                </Typography>
                <div className={classes.categoriesContainer}>
                  { categoriesElement }
                </div>
              </div>
            </>
          )
        }
      </CardContent>

      <CardActions disableSpacing>
        <Link data-testid="download-button"
              target="_blank"
              rel="nofollow"
              href={downloadUrl}>
          <Button className={classes.actionButton}
                  variant="contained"
                  size="medium"
                  color="primary">
            下载
          </Button>
        </Link>

        <Link data-testid="preview-button"
              target="_blank"
              rel="nofollow"
              href={previewUrl}>
          <Button className={classes.actionButton}
                  variant="contained"
                  size="medium"
                  color="primary">
            预览
          </Button>
        </Link>

        <div className={classes.actionButton}>
          <ArtifactCopyButtons artifact={artifact} />
        </div>

        <ActionButtons artifact={artifact} />
      </CardActions>
    </Card>
  );
}

export default observer(ArtifactCard);
