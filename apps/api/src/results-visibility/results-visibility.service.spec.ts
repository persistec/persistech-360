import { Test, TestingModule } from '@nestjs/testing';
import { ResultsVisibilityService } from './results-visibility.service';
import { ScoringService } from '../scoring/scoring.service';
import { EvaluateeResultsDto } from '../scoring/dto/scoring-results.dto';

describe('ResultsVisibilityService', () => {
  let service: ResultsVisibilityService;
  let scoringService: jest.Mocked<ScoringService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResultsVisibilityService,
        {
          provide: ScoringService,
          useValue: {
            getEvaluateeResults: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ResultsVisibilityService>(ResultsVisibilityService);
    scoringService = module.get(ScoringService);
  });

  const getMockScoringData = (thresholdMet: boolean): EvaluateeResultsDto => ({
    evaluateeId: 'eval123',
    score: thresholdMet ? 4.5 : null,
    validSubmissionCount: thresholdMet ? 3 : 1,
    minimumResponseThreshold: 3,
    minimumResponseThresholdMet: thresholdMet,
    scoredAnswerCount: thresholdMet ? 15 : 5,
    naAnswerCount: 0,
    dimensions: [
      {
        dimensionId: 'dim1',
        score: thresholdMet ? 4.5 : null,
        criteria: [
          {
            criterionId: 'crit1',
            score: thresholdMet ? 4.5 : null,
            scoredAnswerCount: thresholdMet ? 15 : 5,
            naAnswerCount: 0,
          },
        ],
      },
    ],
    relationships: [
      {
        relationshipType: 'peer',
        score: thresholdMet ? 4.5 : null,
      },
    ],
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAdminResultView', () => {
    it('returns detailed scoring data for admin', async () => {
      const rawData = getMockScoringData(true);
      scoringService.getEvaluateeResults.mockResolvedValue(rawData);

      const result = await service.getAdminResultView('cycle1', 'eval123');

      expect(result.evaluateeId).toEqual('eval123');
      expect(result.score).toEqual(4.5);
      expect(result.validSubmissionCount).toEqual(3);
      expect(result.scoredAnswerCount).toEqual(15);
      expect(result.dimensions[0].criteria[0].scoredAnswerCount).toEqual(15);
      expect(result.relationships[0].score).toEqual(4.5);
    });
  });

  describe('getEmployeeResultView', () => {
    it('returns insufficient_responses when threshold not met', async () => {
      const rawData = getMockScoringData(false);
      scoringService.getEvaluateeResults.mockResolvedValue(rawData);

      const result = await service.getEmployeeResultView('cycle1', 'eval123');

      expect(result.status).toEqual('insufficient_responses');
      expect(result.score).toBeNull();
      expect(result.validSubmissionCount).toEqual(1);
      expect(result.minimumResponseThresholdMet).toBe(false);
      expect(result.dimensions).toEqual([]);

      // Explicitly check for absence of sensitive fields
      expect('relationships' in result).toBe(false);
      expect('evaluateeId' in result).toBe(false);
      expect('assignmentId' in result).toBe(false);
      expect('submissionId' in result).toBe(false);
    });

    it('returns published and anonymized aggregate score when threshold is met', async () => {
      const rawData = getMockScoringData(true);
      scoringService.getEvaluateeResults.mockResolvedValue(rawData);

      const result = await service.getEmployeeResultView('cycle1', 'eval123');

      expect(result.status).toEqual('published');
      expect(result.score).toEqual(4.5);
      expect(result.validSubmissionCount).toEqual(3);
      expect(result.minimumResponseThresholdMet).toBe(true);

      expect(result.dimensions).toHaveLength(1);
      expect(result.dimensions[0].dimensionId).toEqual('dim1');
      expect(result.dimensions[0].score).toEqual(4.5);
      expect(result.dimensions[0].criteria).toHaveLength(1);
      expect(result.dimensions[0].criteria[0].criterionId).toEqual('crit1');
      expect(result.dimensions[0].criteria[0].score).toEqual(4.5);

      // Verify that the criterion does NOT have scoredAnswerCount and naAnswerCount
      expect('scoredAnswerCount' in result.dimensions[0].criteria[0]).toBe(
        false,
      );
      expect('naAnswerCount' in result.dimensions[0].criteria[0]).toBe(false);

      // Explicitly check for absence of sensitive fields at root
      expect('relationships' in result).toBe(false);
      expect('evaluateeId' in result).toBe(false);
      expect('assignmentId' in result).toBe(false);
      expect('submissionId' in result).toBe(false);
    });
  });
});
