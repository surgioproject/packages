import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import React, { useEffect } from 'react'
import useSWR from 'swr'
import { ArtifactConfig } from 'surgio/internal'
import { defaultFetcher } from '@/libs/utils'
import ArtifactCard from '@/components/ArtifactCard'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'

const Page = (): JSX.Element => {
  const { data: artifactList, error } = useSWR<ReadonlyArray<ArtifactConfig>>(
    '/api/artifacts',
    defaultFetcher
  )
  const [categorySelection, setCategorySelection] = React.useState<{
    [key: string]: boolean
  }>({})
  const [categories, setCategories] = React.useState<string[]>([])

  useEffect(() => {
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
      <div className="flex justify-center text-2xl font-semibold">
        🚨 加载失败 🚨
      </div>
    )
  }

  if (!artifactList) {
    return (
      <div className="flex justify-center items-center text-lg">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        加载中...
      </div>
    )
  }

  const handleCategoryChange = (name: string) => (checked: boolean) => {
    setCategorySelection({
      ...categorySelection,
      [name]: checked,
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
          <div key={item.name}>
            <ArtifactCard artifact={item} />
          </div>
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
                <div key={artifact.name}>
                  <ArtifactCard artifact={artifact} />
                </div>
              )
            })
        )
      }
    })

    return result
  }

  return (
    <div>
      <Card>
        {categories.length > 0 ? (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Artifacts</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <Separator />

              <div className="space-y-2">
                <div className="font-semibold">分类</div>
                <div className="flex flex-wrap">
                  {categories.map((cat) => (
                    <div
                      key={cat}
                      className="flex items-center space-x-2 mr-4 my-1"
                    >
                      <Checkbox
                        id={`cb-${cat}`}
                        checked={categorySelection[cat]}
                        onCheckedChange={(val) =>
                          handleCategoryChange(cat)(val === true)
                        }
                        value={cat}
                      />
                      <label
                        htmlFor={`cb-${cat}`}
                        className="text-sm leading-none"
                      >
                        {cat}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <CardHeader>
            <CardTitle className="text-2xl">Artifacts</CardTitle>
          </CardHeader>
        )}
      </Card>

      <div className="mt-6 lg:mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {getArtifactListElement()}
      </div>
    </div>
  )
}

export default Page
