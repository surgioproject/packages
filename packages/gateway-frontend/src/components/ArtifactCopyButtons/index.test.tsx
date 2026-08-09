import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'
import { ArtifactConfig } from 'surgio/internal'
import { CATEGORIES } from 'surgio/constant'

import ArtifactCopyButtons from './'

describe('<ArtifactCopyButtons />', () => {
  beforeAll(() => {
    Object.defineProperty(global, 'ResizeObserver', {
      configurable: true,
      value: class {
        disconnect() {}
        observe() {}
        unobserve() {}
      },
    })

    Object.defineProperties(HTMLElement.prototype, {
      hasPointerCapture: {
        configurable: true,
        value: jest.fn(() => false),
      },
      releasePointerCapture: {
        configurable: true,
        value: jest.fn(),
      },
      scrollIntoView: {
        configurable: true,
        value: jest.fn(),
      },
      setPointerCapture: {
        configurable: true,
        value: jest.fn(),
      },
    })
  })

  test('renders component', () => {
    const artifact = generateArtifact()
    const { getByTestId } = render(
      <SnackbarProvider>
        <ArtifactCopyButtons artifact={artifact} />
      </SnackbarProvider>
    )
    const $copyButton = getByTestId('copy-button')
    const $changeTypeButton = getByTestId('format-select')

    expect($copyButton).toBeInTheDocument()
    expect($copyButton.textContent).toBe('复制')
    expect($changeTypeButton).toBeInTheDocument()
  })

  test('renders simple component', () => {
    const artifact = generateArtifact({
      categories: [CATEGORIES.SNIPPET],
    })
    const { getByTestId } = render(
      <SnackbarProvider>
        <ArtifactCopyButtons artifact={artifact} />
      </SnackbarProvider>
    )
    const $copyButton = getByTestId('copy-button')
    const $changeTypeButton = getByTestId('format-select')

    expect($copyButton).toBeInTheDocument()
    expect($copyButton.textContent).toBe('复制')
    expect($changeTypeButton).toBeDisabled()
  })

  test('copies a Loon artifact URL', async () => {
    const user = userEvent.setup()
    const artifact = generateArtifact()

    render(
      <SnackbarProvider>
        <ArtifactCopyButtons artifact={artifact} />
      </SnackbarProvider>
    )

    await user.click(screen.getByTestId('format-select'))
    await user.click(await screen.findByText('Loon Proxy'))

    expect(screen.getByTestId('copy-button')).toHaveAttribute(
      'data-clipboard-text',
      `${window.location.origin}/get-artifact/test.conf?format=loon`
    )
  })
})

function generateArtifact(partial?: Partial<ArtifactConfig>): ArtifactConfig {
  return {
    name: 'test.conf',
    template: 'test',
    provider: 'test',
    templateType: 'default',
    ...partial,
  }
}
