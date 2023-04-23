import { observer } from 'mobx-react'
import React, { FormEvent } from 'react'
import { useHistory } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Container from '@material-ui/core/Container'
import TextField from '@material-ui/core/TextField'
import Paper from '@material-ui/core/Paper'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import { useSnackbar } from 'notistack'

import client from '../../libs/http'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    AuthPage: {},
    formContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: theme.spacing(4),
    },
    formInner: {
      marginBottom: theme.spacing(3),
    },
  })
)

const Page: React.FC = () => {
  const classes = useStyles()
  const [token, setToken] = React.useState('')
  const { enqueueSnackbar } = useSnackbar()
  const history = useHistory()

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()

    client
      .post('/api/auth', {
        json: {
          accessToken: token,
        },
      })
      .then(() => {
        history.replace('/')
      })
      .catch(() => {
        enqueueSnackbar('授权失败', { variant: 'error' })
        setToken('')
      })
  }

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setToken(event.target.value.trim())
  }

  return (
    <div className={classes.AuthPage}>
      <Container maxWidth="sm">
        <Paper variant="outlined" className={classes.formContainer}>
          <Typography gutterBottom variant="h4">
            授权
          </Typography>
          <form onSubmit={onSubmit}>
            <div className={classes.formInner}>
              <TextField
                required
                value={token}
                onChange={onChange}
                type="password"
                id="accessToken"
                label="Access Token"
              />
            </div>

            <Button variant="contained" color="primary" type="submit">
              确认
            </Button>
          </form>
        </Paper>
      </Container>
    </div>
  )
}

export default observer(Page)
