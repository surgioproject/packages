import makeStyles from '@mui/styles/makeStyles'
import React from 'react'

import SubscriptionPanel from '../../components/SubscriptionPanel'

const useStyles = makeStyles((theme) => ({
  panels: {},
  panel: {},
}))

const Page: React.FC = () => {
  const classes = useStyles()

  return (
    <div>
      <div className={classes.panels}>
        <div className={classes.panel}>
          <SubscriptionPanel />
        </div>
      </div>
    </div>
  )
}

export default Page
