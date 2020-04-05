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
import React from 'react';
import Clipboard from 'react-clipboard.js';

import { getExportProviderUrl } from '../../libs/utils';
import { useStores } from '../../stores';

const useStyles = makeStyles(theme => ({
  ProviderCopyButtons: {
  },
}));

const options = [
  '复制 Surge Policy 地址',
  '复制 Clash Provider 地址',
  '复制 Quantumult X Server Remote 地址',
];

export interface ProviderCopyButtonsProps {
  providerNameList: ReadonlyArray<string>;
}

function ProviderCopyButtons({ providerNameList }: ProviderCopyButtonsProps) {
  const classes = useStyles();
  const { config: configStore } = useStores();
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const providers = providerNameList.join(',');
  const urls: string[] = [
    getExportProviderUrl(providers,'surge-policy', true, configStore.config.accessToken),
    getExportProviderUrl(providers,'clash-provider', true, configStore.config.accessToken),
    getExportProviderUrl(providers,'qx-server', true, configStore.config.accessToken),
  ];

  const onCopySuccess = () => {
    enqueueSnackbar('复制成功', { variant: 'success' });
  };

  const onCopyError = () => {
    enqueueSnackbar('复制失败', { variant: 'error' });
  };

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number,
  ) => {
    setSelectedIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = (event: React.MouseEvent<Document, MouseEvent>) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  return (
    <Grid item xs={12} className={classes.ProviderCopyButtons}>
      <ButtonGroup variant="contained"
                   color="primary"
                   ref={anchorRef}
                   aria-label="split button">
        <Clipboard component={CopyButton}
                   data-testid="copy-button"
                   data-clipboard-text={urls[selectedIndex]}
                   onSuccess={onCopySuccess}
                   onError={onCopyError}>
          {options[selectedIndex]}
        </Clipboard>

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
      </ButtonGroup>
      <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal style={{ zIndex: 2 }}>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu">
                  {options.map((option, index) => (
                    <MenuItem
                      key={option}
                      selected={index === selectedIndex}
                      onClick={event => handleMenuItemClick(event, index)}
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

const CopyButton = React.forwardRef<any, CopyButtonProps>((props, ref) => {
  return (
    <Button ref={ref}
            variant="contained"
            size="medium"
            color="primary"
            {...props}
    >{ props.children }</Button>
  );
});

export default observer(ProviderCopyButtons);
