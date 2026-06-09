import { Test, TestingModule } from '@nestjs/testing';
import { ScoringController } from './scoring.controller';
import { ScoringService } from './scoring.service';

describe('ScoringController', () => {
  let controller: ScoringController;

  const mockScoringService = {
    getCycleResults: jest.fn(),
    getEvaluateeResults: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScoringController],
      providers: [{ provide: ScoringService, useValue: mockScoringService }],
    }).compile();

    controller = module.get<ScoringController>(ScoringController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
