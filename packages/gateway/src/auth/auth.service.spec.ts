import { Test, TestingModule } from '@nestjs/testing'
import path from 'path'
import sinon from 'sinon'

import { SurgioModule } from '../surgio/surgio.module.js'
import { SurgioService } from '../surgio/surgio.service.js'
import { AuthService } from './auth.service.js'

describe('AuthService', () => {
  let authService: AuthService
  let surgioService: SurgioService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
      imports: [
        SurgioModule.register({
          cwd: path.join(
            import.meta.dirname,
            '../../__tests__/__fixtures__/gateway'
          ),
        }),
      ],
    }).compile()

    authService = module.get<AuthService>(AuthService)
    surgioService = module.get<SurgioService>(SurgioService)
  })

  it('should be defined', () => {
    expect(authService).toBeDefined()
  })

  it('validates access token', () => {
    expect(authService.validateAccessToken('abcd')).toBeTruthy()
    expect(authService.validateAccessToken('false')).toBeFalsy()
  })

  it('validates viewer token', () => {
    expect(authService.validateViewerToken('efgh')).toBeTruthy()
    expect(authService.validateViewerToken('false')).toBeFalsy()
  })

  it('ignore validation when auth turned off', () => {
    const sandbox = sinon.createSandbox()

    sandbox.stub(surgioService.surgioHelper.config.gateway, 'auth').value(false)

    expect(authService.validateAccessToken('false')).toBeTruthy()

    sandbox.restore()
  })
})
