import { Test, TestingModule } from '@nestjs/testing';
import { ClubesService } from './clubes.service';

describe('ClubesService', () => {
  let service: ClubesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClubesService],
    }).compile();

    service = module.get<ClubesService>(ClubesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
