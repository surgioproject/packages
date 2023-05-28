import { observer } from 'mobx-react-lite'
import React, { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import TextField from '@mui/material/TextField'
import Paper from '@mui/material/Paper'
import { Theme } from '@mui/material/styles'
import makeStyles from '@mui/styles/makeStyles'
import createStyles from '@mui/styles/createStyles'
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
  const navigate = useNavigate()

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()

    client
      .post('/api/auth', {
        json: {
          accessToken: token,
        },
      })
      .then(() => {
        navigate('/', { replace: true })
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
