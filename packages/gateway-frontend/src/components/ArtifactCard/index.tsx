import ArtifactParamsPopover from '@/components/ArtifactParamsPopover'
import ArtifactShareButton from '@/components/ArtifactShareButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getDownloadUrl } from '@/libs/utils'
import { cn } from '@/libs/shadcn'
import { useDownloadToken } from '@/stores'
import styled from '@emotion/styled'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArtifactConfig } from 'surgio/internal'
import { spacing } from 'tailwindcss/defaultTheme'

import ArtifactActionButtons from '../ArtifactActionButtons'
import ArtifactCopyButtons from '../ArtifactCopyButtons'
import QrCodeButton from '../QrCodeButton'

const ButtonsWrapper = styled.div`
  & > * {
    display: block;
    white-space: nowrap;
    margin-right: ${spacing[2]};
    margin-bottom: ${spacing[2]};
  }
  margin-bottom: -${spacing[2]};
`

interface ArtifactCardProps {
  artifact: ArtifactConfig
  isEmbed?: boolean
  artifactParams?: URLSearchParams
}

function ArtifactCard({
  artifact,
  isEmbed,
  artifactParams,
}: ArtifactCardProps) {
  const providers = [artifact.provider].concat(artifact.combineProviders || [])
  const downloadToken = useDownloadToken()
  const downloadUrl = useMemo(
    () => getDownloadUrl(artifact.name, false, downloadToken, artifactParams),
    [artifact.name, artifactParams, downloadToken]
  )
  const previewUrl = useMemo(
    () => getDownloadUrl(artifact.name, true, downloadToken, artifactParams),
    [artifact.name, artifactParams, downloadToken]
  )
  const extraParams = useMemo(() => {
    const pairs: [string, string][] = []
    if (!artifactParams) {
      return pairs
    }
    for (const [key, value] of artifactParams.entries()) {
      pairs.push([key, value])
    }
    return pairs
  }, [artifactParams])

  const providersElement = providers.map((item) => {
    return (
      <Badge
        data-testid="display-provider-item"
        className="mr-3 mb-3"
        key={item}
      >
        {item}
      </Badge>
    )
  })

  const categoriesElement = artifact.categories
    ? artifact.categories.map((cat) => (
        <Badge
          data-testid="display-category-item"
          className="mr-3 mb-3"
          key={cat}
        >
          {cat}
        </Badge>
      ))
    : null

  return (
    <Card className={cn(isEmbed && `w-full`)}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <div className="text-xl flex-1 truncate">{artifact.name}</div>
          {extraParams.length > 0 && (
            <ArtifactParamsPopover params={extraParams} />
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div data-testid="display-provider-list" className="space-y-2 -mb-3">
          <div className="font-semibold">Providers</div>
          <div className="flex flex-wrap">{providersElement}</div>
        </div>

        {artifact.categories && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2 -mb-3">
              <div className="font-semibold">分类</div>
              <div className="flex flex-wrap">{categoriesElement}</div>
            </div>
          </>
        )}

        <Separator className="my-4" />

        <div>
          <ButtonsWrapper className="flex flex-wrap">
            <a
              data-testid="download-button"
              target="_blank"
              rel="nofollow noreferrer"
              href={downloadUrl}
            >
              <Button className="block">下载</Button>
            </a>

            <a
              data-testid="preview-button"
              target="_blank"
              rel="nofollow noreferrer"
              href={previewUrl}
            >
              <Button>预览</Button>
            </a>

            <QrCodeButton text={previewUrl} />

            {isEmbed ? null : <ArtifactShareButton artifact={artifact} />}

            <ArtifactActionButtons
              artifact={artifact}
              artifactParams={artifactParams}
            />
          </ButtonsWrapper>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <div className="font-semibold">复制订阅地址</div>
              <ArtifactCopyButtons
                artifact={artifact}
                artifactParams={artifactParams}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default observer(ArtifactCard)
