import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsModule } from './departments.module';
import { DepartmentsService } from './departments.service';

describe('DepartmentsModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [DepartmentsModule],
    }).compile();
  });

  it('should compile the module and resolve its providers correctly', () => {
    expect(module).toBeDefined();
    const service = module.get<DepartmentsService>(DepartmentsService);
    expect(service).toBeDefined();
  });
});
