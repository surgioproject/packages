import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Grow from '@mui/material/Grow'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import makeStyles from '@mui/styles/makeStyles'
import { observer } from 'mobx-react-lite'
import { useSnackbar } from 'notistack'
import React, { forwardRef } from 'react'
import Clipboard from 'react-clipboard.js'

import { getExportProviderUrl } from '../../libs/utils'
import { useStores } from '../../stores'

const useStyles = makeStyles((theme) => ({
  ProviderCopyButtons: {},
}))

const options = [
  '复制 Surge Policy 地址',
  '复制 Clash Provider 地址',
  '复制 Quantumult X Server Remote 地址',
  '复制 SS 订阅',
  '复制 SSR 订阅',
  '复制 V2Ray 订阅',
]

export interface ProviderCopyButtonsProps {
  providerNameList: ReadonlyArray<string>
}

function ProviderCopyButtons({ providerNameList }: ProviderCopyButtonsProps) {
  const classes = useStyles()
  const { config: configStore } = useStores()
  const [open, setOpen] = React.useState(false)
  const anchorRef = React.useRef<HTMLDivElement>(null)
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const { enqueueSnackbar } = useSnackbar()
  const providers = providerNameList.join(',')
  const downloadToken =
    configStore.config.viewerToken || configStore.config.accessToken
  const urls: string[] = [
    getExportProviderUrl(providers, 'surge-policy', true, downloadToken),
    getExportProviderUrl(providers, 'clash-provider', true, downloadToken),
    getExportProviderUrl(providers, 'qx-server', true, downloadToken),
    getExportProviderUrl(providers, 'ss', true, downloadToken),
    getExportProviderUrl(providers, 'ssr', true, downloadToken),
    getExportProviderUrl(providers, 'v2ray', true, downloadToken),
  ]

  const onCopySuccess = () => {
    enqueueSnackbar('复制成功', { variant: 'success' })
  }

  const onCopyError = () => {
    enqueueSnackbar('复制失败', { variant: 'error' })
  }

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number
  ) => {
    setSelectedIndex(index)
    setOpen(false)
  }

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen)
  }

  const handleClose = (targetElement: Element) => {
    if (anchorRef.current && anchorRef.current.contains(targetElement)) {
      return
    }

    setOpen(false)
  }

  return (
    <Grid item xs={12} className={classes.ProviderCopyButtons}>
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
              <ClickAwayListener
                onClickAway={(e) => {
                  if (e.target instanceof Element) handleClose(e.target)
                }}
              >
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
  )
}

interface CopyButtonProps {
  children: React.ReactNode[]
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
  )
})

export default observer(ProviderCopyButtons)
