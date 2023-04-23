import { useSnackbar } from 'notistack'
import React, { useCallback, useEffect, forwardRef, useState } from 'react'
import { observer } from 'mobx-react'
import clsx from 'clsx'
import {
  Switch,
  Route,
  Link as RouterLink,
  LinkProps as RouterLinkProps,
  Redirect,
  useLocation,
} from 'react-router-dom'
import AppBar from '@material-ui/core/AppBar'
import CssBaseline from '@material-ui/core/CssBaseline'
import Divider from '@material-ui/core/Divider'
import Drawer from '@material-ui/core/Drawer'
import Hidden from '@material-ui/core/Hidden'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import DnsIcon from '@material-ui/icons/Dns'
import SubjectIcon from '@material-ui/icons/Subject'
import MenuIcon from '@material-ui/icons/Menu'
import GitHubIcon from '@material-ui/icons/GitHub'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import loadable from '@loadable/component'

import './App.css'
import useNavElements from './hooks/useNavElements'
import client from './libs/http'
import { defaultFetcher } from './libs/utils'
import { useStores } from './stores'
import { Config } from './stores/config'
import NotFoundPage from './pages/NotFound'

const drawerWidth = 240
const ArtifactListPage = loadable(() => import('./pages/ArtifactList'), {})
const ProviderListPage = loadable(() => import('./pages/ProviderList'), {})
const HomePage = loadable(() => import('./pages/Home'), {})
const AuthPage = loadable(() => import('./pages/Auth'), {})
const EmbedArtifactPage = loadable(() => import('./pages/embeds/Artifact'), {})

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    noDrawer: {
      '& > main': {
        width: '100%',
      },
    },
    drawer: {
      [theme.breakpoints.up('md')]: {
        width: drawerWidth,
        flexShrink: 0,
      },
    },
    appBar: {
      [theme.breakpoints.up('md')]: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
      },
    },
    menuButton: {
      marginRight: theme.spacing(2),
      [theme.breakpoints.up('md')]: {
        display: 'none',
      },
    },
    toolbar: {
      ...theme.mixins.toolbar,
      display: 'flex',
    },
    versionInfo: {
      flexDirection: 'column',
      justifyContent: 'center',
      padding: theme.spacing(2),
    },
    drawerPaper: {
      width: drawerWidth,
    },
    content: {
      width: '100%',
      [theme.breakpoints.up('md')]: {
        width: `calc(100% - ${drawerWidth}px)`,
      },
      padding: theme.spacing(2, 1),
      [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(3),
      },
    },
    pageTitle: {
      flexGrow: 1,
      '& .MuiTypography-root': {
        color: '#fff',
      },
    },
    appBarIcons: {
      color: '#fff',
    },
  })
)

interface ResponsiveDrawerProps {
  container?: Element
}

const App = observer((props: ResponsiveDrawerProps) => {
  const { container } = props
  const classes = useStyles()
  const stores = useStores()
  const isShowNavElements = useNavElements()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const validateAuth = useCallback(() => {
    const search = new URLSearchParams(location.search)

    if (search.get('access_token')) {
      stores.config.updateConfig({
        accessToken: search.get('access_token'),
      })

      return defaultFetcher<{
        roles: string[]
        accessToken?: string
        viewerToken?: string
      }>('/api/auth/validate-token')
    }

    return defaultFetcher<{
      roles: string[]
      accessToken?: string
      viewerToken?: string
    }>('/api/auth/validate-cookie')
  }, [location.search, stores.config])

  const cleanCache = () => {
    client.post('/api/clean-cache').then(() => {
      enqueueSnackbar('清除成功', { variant: 'success' })
    })
  }

  const fetchConfig = () => {
    return defaultFetcher<Partial<Config>>('/api/config')
  }

  useEffect(() => {
    validateAuth()
      .then((user) => {
        if (user.accessToken) {
          stores.config.updateConfig({
            accessToken: user.accessToken,
          })
        }

        if (user.viewerToken) {
          stores.config.updateConfig({
            viewerToken: user.viewerToken,
          })
        }

        return fetchConfig()
      })
      .catch(() => {
        // 授权失败，直接获取配置信息
        return fetchConfig()
      })
      .then((config) => {
        stores.config.updateConfig(config)
      })
      .catch((err) => {
        console.error(err)
      })
  }, [stores.config, validateAuth])

  const drawer = (
    <div>
      <div className={clsx(classes.toolbar, classes.versionInfo)}>
        {stores.config.isReady && (
          <>
            <Typography variant="body2">
              <span>Core: </span>
              <code>v{stores.config.config.coreVersion}</code>
            </Typography>
            <Typography variant="body2">
              <span>Backend: </span>
              <code>v{stores.config.config.backendVersion}</code>
            </Typography>
          </>
        )}
      </div>
      <Divider />
      <List>
        <ListItemLink
          to="/artifacts"
          primary="Artifacts"
          icon={<SubjectIcon />}
        />
        <ListItemLink to="/providers" primary="Providers" icon={<DnsIcon />} />
        <li>
          <ListItem button onClick={() => cleanCache()}>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText primary="清除缓存" />
          </ListItem>
        </li>
      </List>
    </div>
  )

  return (
    <>
      <CssBaseline />

      <div
        className={clsx(
          classes.root,
          'app-root',
          !isShowNavElements && classes.noDrawer
        )}
      >
        {stores.config.isReady && (
          <>
            {isShowNavElements && (
              <>
                <AppBar position="fixed" className={classes.appBar}>
                  <Toolbar>
                    <IconButton
                      color="inherit"
                      aria-label="open drawer"
                      edge="start"
                      onClick={handleDrawerToggle}
                      className={classes.menuButton}
                    >
                      <MenuIcon />
                    </IconButton>
                    <Typography
                      variant="h6"
                      noWrap
                      className={classes.pageTitle}
                    >
                      <Link component={RouterLink} to="/">
                        Surgio Dashboard
                      </Link>
                    </Typography>
                    <div>
                      <Link
                        href="https://github.com/geekdada/surgio"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <GitHubIcon className={classes.appBarIcons} />
                      </Link>
                    </div>
                  </Toolbar>
                </AppBar>

                <nav className={classes.drawer} aria-label="folders">
                  <Hidden lgUp>
                    <Drawer
                      container={container}
                      variant="temporary"
                      open={mobileOpen}
                      onClose={handleDrawerToggle}
                      classes={{
                        paper: classes.drawerPaper,
                      }}
                      ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                      }}
                    >
                      {drawer}
                    </Drawer>
                  </Hidden>
                  <Hidden smDown>
                    <Drawer
                      classes={{
                        paper: classes.drawerPaper,
                      }}
                      variant="permanent"
                      open
                    >
                      {drawer}
                    </Drawer>
                  </Hidden>
                </nav>
              </>
            )}

            <main className={classes.content}>
              {isShowNavElements && <div className={classes.toolbar} />}

              <Switch>
                <Route path="/list-artifact">
                  <Redirect to="/artifacts" />
                </Route>
                <Route path="/artifacts">
                  <ArtifactListPage />
                </Route>
                <Route path="/providers">
                  <ProviderListPage />
                </Route>
                <Route path="/auth">
                  <AuthPage />
                </Route>
                <Route path="/embed/artifact/:artifactName">
                  <EmbedArtifactPage />
                </Route>
                <Route exact path="/">
                  <HomePage />
                </Route>
                <Route path="*">
                  <NotFoundPage />
                </Route>
              </Switch>
            </main>
          </>
        )}
      </div>
    </>
  )
})

interface ListItemLinkProps {
  icon?: React.ReactElement
  primary: string
  to: string
}

function ListItemLink(props: ListItemLinkProps) {
  const { icon, primary, to } = props

  const renderLink = React.useMemo(
    () =>
      forwardRef<any, Omit<RouterLinkProps, 'to'>>(
        function ListItemInnerComponent(itemProps, ref) {
          return <RouterLink to={to} ref={ref} {...itemProps} />
        }
      ),
    [to]
  )

  return (
    <li>
      <ListItem button component={renderLink}>
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  )
}

export default App
