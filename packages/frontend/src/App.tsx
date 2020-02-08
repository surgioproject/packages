import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import { SnackbarProvider } from 'notistack';
import clsx from 'clsx';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import ListIcon from '@material-ui/icons/List';
import MenuIcon from '@material-ui/icons/Menu';
import GitHubIcon from '@material-ui/icons/GitHub';
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';

import './App.css';
import { defaultFetcher } from './libs/utils';
import ArtifactListPage from './pages/ArtifactList';
import AuthPage from './pages/Auth';
import HomePage from './pages/Home';
import NotFoundPage from './pages/NotFound';
import { useStores } from './stores';
import { Config } from './stores/config';

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
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
  }),
);

interface ResponsiveDrawerProps {
  container?: Element;
}

export default observer((props: ResponsiveDrawerProps) => {
  const { container } = props;
  const classes = useStyles();
  const theme = useTheme();
  const stores = useStores();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const validateAuth = () => {
    return defaultFetcher<{accessToken?: string}>('/api/auth/validate');
  };

  const updateConfig = () => {
    return defaultFetcher<Partial<Config>>('/api/config');
  };

  useEffect(() => {
    validateAuth()
      .then(user => {
        if (user.accessToken) {
          stores.config.updateConfig({
            accessToken: user.accessToken,
          });
        }

        return updateConfig();
      })
      .catch(err => {
        // 授权失败，直接获取配置信息
        return updateConfig();
      })
      .then(config => {
        stores.config.updateConfig(config);
      })
      .catch(err => {
        console.error(err);
      });
  }, [stores.config]);

  const drawer = (
    <div>
      <div className={clsx(classes.toolbar, classes.versionInfo)}>
        {
          stores.config.isReady && (
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
          )
        }
      </div>
      <Divider />
      <List>
        <ListItemLink to="/list-artifact" primary="Artifacts" icon={<ListIcon />} />
      </List>
    </div>
  );

  return (
    <Router>
      <SnackbarProvider maxSnack={3}>
        <div className={classes.root}>
          { stores.config.isReady && (
            <>
              <CssBaseline />

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
                  <Typography variant="h6" noWrap className={classes.pageTitle}>
                    <Link component={RouterLink} to="/">
                      Surgio Dashboard
                    </Link>
                  </Typography>
                  <div>
                    <Link href="https://github.com/geekdada/surgio"
                          rel="noopener noreferrer"
                          target="_blank">
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

              <main className={classes.content}>
                <div className={classes.toolbar} />
                <Switch>
                  <Route path="/list-artifact">
                    <ArtifactListPage />
                  </Route>
                  <Route path="/auth">
                    <AuthPage />
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
          ) }
        </div>
      </SnackbarProvider>
    </Router>
  );
});

interface ListItemLinkProps {
  icon?: React.ReactElement;
  primary: string;
  to: string;
}

function ListItemLink(props: ListItemLinkProps) {
  const { icon, primary, to } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef<any, Omit<RouterLinkProps, 'to'>>((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to],
  );

  return (
    <li>
      <ListItem button component={renderLink}>
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
}
