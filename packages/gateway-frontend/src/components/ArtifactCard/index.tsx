import { observer } from 'mobx-react';
import { useSnackbar } from 'notistack';
import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { ArtifactConfig } from 'surgio/build/types';
import Clipboard from 'react-clipboard.js';

import { getDownloadUrl } from '../../libs/utils';
import { useStores } from '../../stores';
import ArtifactActionButtons from '../ArtifactActionButtons';
import ArtifactCopyButtons from '../ArtifactCopyButtons';
import QrCodeButton from '../QrCodeButton';

const useStyles = makeStyles(theme => ({
  ArtifactCard: {
    '& .MuiCardActions-root': {
      flexWrap: 'wrap',
    },
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
    margin: theme.spacing(0.5, 1),
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
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
}));

export interface ArtifactCardProps {
  artifact: ArtifactConfig;
  isEmbed?: boolean;
}

function ArtifactCard({artifact, isEmbed}: ArtifactCardProps) {
  const classes = useStyles();
  const { config: configStore } = useStores();
  const providers = [artifact.provider].concat(artifact.combineProviders || []);
  const downloadUrl = getDownloadUrl(artifact.name, false, configStore.config.accessToken);
  const previewUrl = getDownloadUrl(artifact.name, true, configStore.config.accessToken);
  const [expanded, setExpanded] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const onCopySuccess = () => {
    enqueueSnackbar('复制成功', { variant: 'success' });
  };

  const onCopyError = () => {
    enqueueSnackbar('复制失败', { variant: 'error' });
  };

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
          <QrCodeButton text={previewUrl} />
        </div>

        <div className={classes.actionButton}>
          <ArtifactCopyButtons artifact={artifact} />
        </div>

        <div className={classes.actionButton}>
          <ArtifactActionButtons artifact={artifact} />
        </div>

        {
          !isEmbed && (
            <IconButton
              className={clsx(classes.expand, {
                [classes.expandOpen]: expanded,
              })}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </IconButton>
          )
        }
      </CardActions>

      {
        !isEmbed && (
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <CardContent>
              <Typography paragraph>Embed</Typography>

              <Grid container spacing={3}>
                <Grid item xs={11}>
                  <Typography className={classes.urlContainer}
                              component="pre">
                    { getEmbedCode(artifact.name, configStore.config.accessToken) }
                  </Typography>
                </Grid>
                <Grid item xs={1}>
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Clipboard component={IconButton}
                               data-testid="copy-button"
                               data-clipboard-text={getEmbedCode(artifact.name, configStore.config.accessToken)}
                               onSuccess={onCopySuccess}
                               onError={onCopyError}>
                      <FileCopyIcon />
                    </Clipboard>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Collapse>
        )
      }
    </Card>
  );
}

function getEmbedCode(artifact: string, accessToken?: string|null): string {
  const url = new URL(`/embed/artifact/${artifact}`, window.location.origin);

  if (accessToken) {
    url.searchParams.set('access_token', accessToken)
  }

  return `<iframe loading="lazy" src="${url.toString()}" height="400px" width="100%"></iframe>`;
}

export default observer(ArtifactCard);
