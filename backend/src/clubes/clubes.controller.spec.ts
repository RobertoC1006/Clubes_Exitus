import { Test, TestingModule } from '@nestjs/testing';
import { ClubesController } from './clubes.controller';

describe('ClubesController', () => {
  let controller: ClubesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClubesController],
    }).compile();

    controller = module.get<ClubesController>(ClubesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
