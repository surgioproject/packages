import { observer } from 'mobx-react';
import React from 'react';
import { ArtifactConfig } from 'surgio/build/types';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Button from '@material-ui/core/Button';
import { CATEGORIES } from 'surgio/build/utils/constant';
import { JsonObject } from 'type-fest';

import { getDownloadUrl } from '../../libs/utils';
import { useStores } from '../../stores';

export interface ArtifactActionButtonsProps {
  artifact: ArtifactConfig;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    ArtifactActionButtons: {},
    actionButton: {},
  })
);

function ArtifactActionButtons({ artifact }: ArtifactActionButtonsProps) {
  const classes = useStyles();
  const { config: configStore } = useStores();
  const previewUrl = getDownloadUrl(
    artifact.name,
    true,
    configStore.config.accessToken
  );

  const SurgeButtons: React.FC = () => {
    if (
      artifact.name.toLowerCase().includes('surge') ||
      artifact?.categories?.includes(CATEGORIES.SURGE)
    ) {
      return (
        <div className={classes.actionButton}>
          <Button
            component={Link}
            color="secondary"
            size="medium"
            rel="nofollow"
            target="_blank"
            href={`surge:///install-config?url=${encodeURIComponent(
              previewUrl
            )}`}
          >
            Add to Surge
          </Button>
        </div>
      );
    }

    return <></>;
  };

  const ClashButtons: React.FC = () => {
    if (
      artifact.name.toLowerCase().includes('clash') ||
      artifact?.categories?.includes(CATEGORIES.CLASH)
    ) {
      return (
        <div className={classes.actionButton}>
          <Button
            component={Link}
            color="secondary"
            size="medium"
            rel="nofollow"
            target="_blank"
            href={`clash://install-config?url=${encodeURIComponent(
              previewUrl
            )}`}
          >
            Add to ClashX/CFW
          </Button>
        </div>
      );
    }

    return <></>;
  };

  const QuantumultXButtons: React.FC = () => {
    if (artifact?.categories?.includes(CATEGORIES.QUANTUMULT_X_SERVER)) {
      const json: JsonObject = {
        server_remote: [previewUrl],
      };
      return (
        <div className={classes.actionButton}>
          <Button
            data-testid="quanx-server-remote"
            component={Link}
            color="secondary"
            size="medium"
            rel="nofollow"
            target="_blank"
            href={`quantumult-x:///update-configuration?remote-resource=${encodeURIComponent(
              JSON.stringify(json)
            )}`}
          >
            Add to Quantumult X
          </Button>
        </div>
      );
    }

    if (artifact?.categories?.includes(CATEGORIES.QUANTUMULT_X_FILTER)) {
      const json: JsonObject = {
        filter_remote: [previewUrl],
      };
      return (
        <div className={classes.actionButton}>
          <Button
            data-testid="quanx-filter-remote"
            component={Link}
            color="secondary"
            size="medium"
            rel="nofollow"
            target="_blank"
            href={`quantumult-x:///update-configuration?remote-resource=${encodeURIComponent(
              JSON.stringify(json)
            )}`}
          >
            Add to Quantumult X
          </Button>
        </div>
      );
    }

    if (artifact?.categories?.includes(CATEGORIES.QUANTUMULT_X_REWRITE)) {
      const json: JsonObject = {
        rewrite_remote: [previewUrl],
      };
      return (
        <div className={classes.actionButton}>
          <Button
            data-testid="quanx-rewrite-remote"
            component={Link}
            color="secondary"
            size="medium"
            rel="nofollow"
            target="_blank"
            href={`quantumult-x:///update-configuration?remote-resource=${encodeURIComponent(
              JSON.stringify(json)
            )}`}
          >
            Add to Quantumult X
          </Button>
        </div>
      );
    }

    return <></>;
  };

  return (
    <div data-testid="action-buttons" className={classes.ArtifactActionButtons}>
      <SurgeButtons />
      <ClashButtons />
      <QuantumultXButtons />
    </div>
  );
}

export default observer(ArtifactActionButtons);
