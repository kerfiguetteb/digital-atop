import { TestBed } from '@angular/core/testing';

import { MenageService } from './menage.service';

describe('MenageService', () => {
  let service: MenageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
