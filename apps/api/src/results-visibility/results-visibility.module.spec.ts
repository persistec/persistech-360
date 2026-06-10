import { Test, TestingModule } from '@nestjs/testing';
import { ResultsVisibilityModule } from './results-visibility.module';
import { ResultsVisibilityService } from './results-visibility.service';
import { ScoringModule } from '../scoring/scoring.module';
import { PrismaService } from '../database/prisma.service';

describe('ResultsVisibilityModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ResultsVisibilityModule, ScoringModule],
      providers: [
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should resolve ResultsVisibilityService', () => {
    const service = module.get<ResultsVisibilityService>(
      ResultsVisibilityService,
    );
    expect(service).toBeDefined();
  });
});
