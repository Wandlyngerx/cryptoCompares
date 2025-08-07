import { TestBed } from '@angular/core/testing';

import { Cripto } from './cripto';

describe('Cripto', () => {
  let service: Cripto;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cripto);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
