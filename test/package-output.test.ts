import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { JSDOM } from 'jsdom'
import { describe, expect, test } from 'vitest'

const require = createRequire(import.meta.url)
const repositoryRoot = resolve(import.meta.dirname, '..')

type PackFile = {
  path: string
}

type PackResult = {
  files: PackFile[]
}

type PackageManifest = {
  main: string
  types?: string
}

const packages = [
  {
    directory: 'packages/gateway',
    required: ['dist/index.js', 'dist/index.d.ts'],
  },
  {
    directory: 'packages/gateway-frontend',
    required: ['index.js', 'index.d.ts', 'build/index.html'],
  },
  {
    directory: 'packages/logger',
    required: ['dist/index.js', 'dist/index.d.ts'],
  },
  {
    directory: 'packages/eslint-config-surgio',
    required: ['index.js'],
  },
] as const

const pack = (directory: string): string[] => {
  const output = execFileSync('pnpm', ['pack', '--dry-run', '--json'], {
    cwd: resolve(repositoryRoot, directory),
    encoding: 'utf8',
  })
  const parsed = JSON.parse(output) as PackResult | PackResult[]
  const result = Array.isArray(parsed) ? parsed[0] : parsed

  return result.files.map(({ path }) => path.replace(/^package\//, ''))
}

describe('published package output', () => {
  test.each(packages)('$directory contains only publishable files', (item) => {
    const packageDirectory = resolve(repositoryRoot, item.directory)
    const manifest = require(resolve(
      packageDirectory,
      'package.json'
    )) as PackageManifest
    const files = pack(item.directory)
    const main = manifest.main.replace(/^\.\//, '')

    expect(files).toContain('package.json')
    expect(files).toContain(main)
    item.required.forEach((file) => expect(files).toContain(file))

    if (manifest.types) {
      expect(files).toContain(manifest.types.replace(/^\.\//, ''))
    }

    expect(files).not.toContain('.node-version')
    expect(files).not.toContain('tsconfig.json')
    expect(files).not.toContain('tsconfig.build.json')
    expect(files).not.toContain('vitest.config.ts')
    expect(files).not.toContain('vitest.e2e.config.ts')
    expect(files).not.toContain('vitest.config.mts')
    expect(files).not.toContain('vitest.e2e.config.mts')
    expect(files).not.toContain('vite.config.mts')
    expect(files).not.toContainEqual(expect.stringMatching(/(^|\/)src\//))
    expect(files).not.toContainEqual(
      expect.stringMatching(/(^|\/)(?:__tests__|coverage)\//)
    )
    expect(files).not.toContainEqual(
      expect.stringMatching(/\.(?:spec|test)\.[^.]+(?:\.map)?$/)
    )
  })

  test('CommonJS entrypoints load from their declared main files', () => {
    const gateway = require(resolve(repositoryRoot, 'packages/gateway'))
    const frontend = require(resolve(
      repositoryRoot,
      'packages/gateway-frontend'
    ))
    const logger = require(resolve(repositoryRoot, 'packages/logger'))
    const eslintConfig = require(resolve(
      repositoryRoot,
      'packages/eslint-config-surgio'
    ))

    expect(gateway.createHttpServer).toBeTypeOf('function')
    expect(gateway.createLambdaHandler).toBeTypeOf('function')
    expect(frontend).toBeTypeOf('function')
    expect(logger.createLogger).toBeTypeOf('function')
    expect(eslintConfig).toBeInstanceOf(Array)
  })

  test('frontend HTML references assets included in the package', () => {
    const frontendDirectory = resolve(
      repositoryRoot,
      'packages/gateway-frontend'
    )
    const html = readFileSync(resolve(frontendDirectory, 'build/index.html'), {
      encoding: 'utf8',
    })
    const document = new JSDOM(html).window.document
    const assetUrls = [
      ...Array.from(
        document.querySelectorAll<HTMLScriptElement>('script[src]')
      ),
      ...Array.from(
        document.querySelectorAll<HTMLLinkElement>(
          'link[rel="stylesheet"][href]'
        )
      ),
    ]
      .map(
        (element) => element.getAttribute('src') ?? element.getAttribute('href')
      )
      .filter((url): url is string => url?.startsWith('/') === true)
    const files = pack('packages/gateway-frontend')

    expect(assetUrls.length).toBeGreaterThan(0)
    assetUrls.forEach((url) => {
      const assetPath = url.replace(/^\//, '')

      expect(existsSync(resolve(frontendDirectory, 'build', assetPath))).toBe(
        true
      )
      expect(files).toContain(`build/${assetPath}`)
    })
  })
})
