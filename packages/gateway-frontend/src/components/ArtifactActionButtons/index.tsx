import { Button } from '@/components/ui/button'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { ArtifactConfig } from 'surgio/internal'
import { CATEGORIES } from 'surgio/constant'
import { JsonObject } from 'type-fest'
import { getDownloadUrl } from '@/libs/utils'
import { useDownloadToken } from '@/stores'

export interface ArtifactActionButtonsProps {
  artifact: ArtifactConfig
  artifactParams?: URLSearchParams
}

function ArtifactActionButtons({
  artifact,
  artifactParams,
}: ArtifactActionButtonsProps) {
  const downloadToken = useDownloadToken()
  const previewUrl = getDownloadUrl(
    artifact.name,
    true,
    downloadToken,
    artifactParams
  )

  const SurgeButtons: React.FC = () => {
    if (
      artifact.name.toLowerCase().includes('surge') ||
      artifact?.categories?.includes(CATEGORIES.SURGE)
    ) {
      return (
        <div>
          <a
            href={`surge:///install-config?url=${encodeURIComponent(
              previewUrl
            )}`}
          >
            <Button variant="secondary">添加到 Surge</Button>
          </a>
        </div>
      )
    }

    return <></>
  }

  const ClashButtons: React.FC = () => {
    if (
      artifact.name.toLowerCase().includes('clash') ||
      artifact?.categories?.includes(CATEGORIES.CLASH)
    ) {
      return (
        <div>
          <a
            href={`clash://install-config?url=${encodeURIComponent(
              previewUrl
            )}`}
          >
            <Button variant="secondary">添加到 ClashX/CFW</Button>
          </a>
        </div>
      )
    }

    return <></>
  }

  const QuantumultXButtons: React.FC = () => {
    if (artifact?.categories?.includes(CATEGORIES.QUANTUMULT_X_SERVER)) {
      const json: JsonObject = {
        server_remote: [previewUrl],
      }
      return (
        <div>
          <a
            href={`quantumult-x:///update-configuration?remote-resource=${encodeURIComponent(
              JSON.stringify(json)
            )}`}
          >
            <Button variant="secondary">添加到 ClashX/CFW</Button>
          </a>
        </div>
      )
    }

    if (artifact?.categories?.includes(CATEGORIES.QUANTUMULT_X_FILTER)) {
      const json: JsonObject = {
        filter_remote: [previewUrl],
      }
      return (
        <div>
          <a
            href={`quantumult-x:///update-configuration?remote-resource=${encodeURIComponent(
              JSON.stringify(json)
            )}`}
          >
            <Button variant="secondary">添加到 Quantumult X</Button>
          </a>
        </div>
      )
    }

    if (artifact?.categories?.includes(CATEGORIES.QUANTUMULT_X_REWRITE)) {
      const json: JsonObject = {
        rewrite_remote: [previewUrl],
      }
      return (
        <div>
          <a
            href={`quantumult-x:///update-configuration?remote-resource=${encodeURIComponent(
              JSON.stringify(json)
            )}`}
          >
            <Button variant="secondary">添加到 Quantumult X</Button>
          </a>
        </div>
      )
    }

    return <></>
  }

  const LoonButtons: React.FC = () => {
    if (
      artifact.name.toLowerCase().includes('loon') ||
      artifact?.categories?.includes(CATEGORIES.LOON)
    ) {
      return (
        <div>
          <a href={`loon://import?sub=${encodeURIComponent(previewUrl)}`}>
            <Button variant="secondary">添加到 Loon</Button>
          </a>
        </div>
      )
    }

    return <></>
  }

  const SurfboardButtons: React.FC = () => {
    if (
      artifact.name.toLowerCase().includes('surfboard') ||
      artifact?.categories?.includes('Surfboard')
    ) {
      return (
        <div>
          <a
            href={`surfboard:///install-config?url=${encodeURIComponent(
              previewUrl
            )}`}
          >
            <Button variant="secondary">添加到 Surfboard</Button>
          </a>
        </div>
      )
    }

    return <></>
  }

  return (
    <div data-testid="action-buttons">
      <SurgeButtons />
      <ClashButtons />
      <QuantumultXButtons />
      <LoonButtons />
      <SurfboardButtons />
    </div>
  )
}

export default observer(ArtifactActionButtons)
