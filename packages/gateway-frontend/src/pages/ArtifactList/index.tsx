import Grid from '@mui/material/Grid'
import React from 'react'
import useSWR from 'swr'
import { Theme } from '@mui/material/styles'
import makeStyles from '@mui/styles/makeStyles'
import createStyles from '@mui/styles/createStyles'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import { ArtifactConfig } from 'surgio/internal'

import { defaultFetcher } from '../../libs/utils'
import ArtifactCard from '../../components/ArtifactCard'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    ArtifactListPage: {},
    headerContainer: {
      padding: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    categories: {
      margin: theme.spacing(2, 0, 0),
    },
    category: {},
    listContainer: {},
    listItem: {},
  })
)

const Page: React.FC = () => {
  const classes = useStyles()
  const { data: artifactList, error } = useSWR<ReadonlyArray<ArtifactConfig>>(
    '/api/artifacts',
    defaultFetcher
  )
  const [categorySelection, setCategorySelection] = React.useState<{
    [key: string]: boolean
  }>({})
  const [categories, setCategories] = React.useState<string[]>([])

  React.useEffect(() => {
    if (artifactList) {
      const result = artifactList
        .reduce<string[]>((accu, curr): string[] => {
          if (Array.isArray(curr?.categories)) {
            accu.push(...curr.categories)
          }
          return accu
        }, [])
        .filter((item, index, arr) => {
          const find = arr.findIndex((i) => i === item)
          return index === find
        })

      result.forEach((cat) => {
        setCategorySelection((prevVal) => {
          return {
            ...prevVal,
            [cat]: false,
          }
        })
      })

      setCategories(result)
    }
  }, [artifactList])

  if (error) {
    return (
      <Box display="flex" justifyContent="center">
        Failed to load
      </Box>
    )
  }

  if (!artifactList) {
    return (
      <Box display="flex" justifyContent="center">
        Loading...
      </Box>
    )
  }

  const handleCategoryChange =
    (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setCategorySelection({
        ...categorySelection,
        [name]: event.target.checked,
      })
    }

  const getArtifactListElement = () => {
    if (!artifactList) return null

    const result: JSX.Element[] = []
    const hasSelection = Object.keys(categorySelection).some(
      (key) => categorySelection[key]
    )

    if (!hasSelection) {
      return artifactList.map((item) => {
        return (
          <Grid
            item
            xs={12}
            lg={6}
            className={classes.listItem}
            key={item.name}
          >
            <ArtifactCard artifact={item} />
          </Grid>
        )
      })
    }

    Object.keys(categorySelection).forEach((item) => {
      if (categorySelection[item]) {
        result.push(
          ...artifactList
            .filter((artifact) => {
              return artifact?.categories?.includes(item)
            })
            .map((artifact) => {
              return (
                <Grid
                  item
                  xs={12}
                  lg={6}
                  className={classes.listItem}
                  key={artifact.name}
                >
                  <ArtifactCard artifact={artifact} />
                </Grid>
              )
            })
        )
      }
    })

    return <>{result}</>
  }

  return (
    <div className={classes.ArtifactListPage}>
      <Paper className={classes.headerContainer}>
        {categories.length > 0 ? (
          <>
            <Typography gutterBottom variant="h4">
              Artifacts
            </Typography>
            <Divider />
            <div className={classes.categories}>
              <Typography gutterBottom variant="body1">
                分类
              </Typography>
              <FormGroup row>
                {categories.map((cat) => (
                  <FormControlLabel
                    className={classes.category}
                    key={cat}
                    control={
                      <Checkbox
                        checked={categorySelection[cat]}
                        onChange={handleCategoryChange(cat)}
                        value={cat}
                        color="primary"
                      />
                    }
                    label={cat}
                  />
                ))}
              </FormGroup>
            </div>
          </>
        ) : (
          <Typography variant="h4">Artifacts</Typography>
        )}
      </Paper>
      <div className={classes.listContainer}>
        <Grid container spacing={3}>
          {getArtifactListElement()}
        </Grid>
      </div>
    </div>
  )
}

export default Page
