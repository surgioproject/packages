import { ExpressAdapter } from '@nestjs/platform-express'
import express from 'express'

export function createAdapter(): ExpressAdapter {
  const instance = express()
  return new ExpressAdapter(instance)
}
