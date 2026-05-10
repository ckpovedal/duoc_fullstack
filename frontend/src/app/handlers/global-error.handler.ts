import { ErrorHandler, Injectable, inject } from '@angular/core';

import { LoggerService } from '../services/logger.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private logger = inject(LoggerService);

  handleError(error: unknown): void {
    this.logger.error('angular', error);
  }
}
