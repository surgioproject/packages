import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react';
import { useSnackbar } from 'notistack';
import React, { forwardRef } from 'react';
import Clipboard from 'react-clipboard.js';
import { ArtifactConfig } from 'surgio/build/types';
import { CATEGORIES } from 'surgio/build/utils/constant';

import { getDownloadUrl } from '../../libs/utils';
import { useStores } from '../../stores';

const useStyles = makeStyles((theme) => ({
  ArtifactCopyButtons: {},
}));

const options = [
  '复制地址',
  '复制 Surge Policy 地址',
  '复制 Clash Provider 地址',
  '复制 Quantumult X Server Remote 地址',
  '复制 SS 订阅',
  '复制 SSR 订阅',
  '复制 V2Ray 订阅',
];

export interface ArtifactCopyButtonsProps {
  artifact: ArtifactConfig;
}

function ArtifactCopyButtons({ artifact }: ArtifactCopyButtonsProps) {
  const classes = useStyles();
  const { config: configStore } = useStores();
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const urls: string[] = [
    getDownloadUrl(artifact.name, true, configStore.config.accessToken),
    getDownloadUrl(
      `${artifact.name}?format=surge-policy`,
      true,
      configStore.config.accessToken
    ),
    getDownloadUrl(
      `${artifact.name}?format=clash-provider`,
      true,
      configStore.config.accessToken
    ),
    getDownloadUrl(
      `${artifact.name}?format=qx-server`,
      true,
      configStore.config.accessToken
    ),
    getDownloadUrl(
      `${artifact.name}?format=ss`,
      true,
      configStore.config.accessToken
    ),
    getDownloadUrl(
      `${artifact.name}?format=ssr`,
      true,
      configStore.config.accessToken
    ),
    getDownloadUrl(
      `${artifact.name}?format=v2ray`,
      true,
      configStore.config.accessToken
    ),
  ];

  const onCopySuccess = () => {
    enqueueSnackbar('复制成功', { variant: 'success' });
  };

  const onCopyError = () => {
    enqueueSnackbar('复制失败', { variant: 'error' });
  };

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number
  ) => {
    setSelectedIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: React.MouseEvent<Document, MouseEvent>) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  return (
    <Grid item xs={12} className={classes.ArtifactCopyButtons}>
      <ButtonGroup
        variant="contained"
        color="primary"
        ref={anchorRef}
        aria-label="split button"
      >
        <Clipboard
          component={CopyButton}
          data-testid="copy-button"
          data-clipboard-text={urls[selectedIndex]}
          onSuccess={onCopySuccess}
          onError={onCopyError}
        >
          {options[selectedIndex]}
        </Clipboard>

        {!artifact.categories?.includes(CATEGORIES.SNIPPET) && (
          <Button
            color="primary"
            size="small"
            aria-controls={open ? 'split-button-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-label="select url type"
            aria-haspopup="menu"
            onClick={handleToggle}
          >
            <ArrowDropDownIcon />
          </Button>
        )}
      </ButtonGroup>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        style={{ zIndex: 2 }}
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu">
                  {options.map((option, index) => (
                    <MenuItem
                      key={option}
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Grid>
  );
}

interface CopyButtonProps {
  children: React.ReactNode[];
}

const CopyButton = forwardRef<any, CopyButtonProps>(function CopyButton(
  props,
  ref
) {
  return (
    <Button
      ref={ref}
      variant="contained"
      size="medium"
      color="primary"
      {...props}
    >
      {props.children}
    </Button>
  );
});

export default observer(ArtifactCopyButtons);
