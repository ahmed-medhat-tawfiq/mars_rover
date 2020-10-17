import { Color } from './logger.enums';

export class LoggerService {
  private disabled: boolean;
  private prefix: string;

  constructor(prefix: string, disabled?: boolean) {
    this.disabled = disabled || false;
    this.prefix = prefix ? `[${prefix}]` : '';
  }

  error(...args: any[]): void {
    if (!this.disabled) console.error(Color.RED, 'ERROR', this.prefix , args);
  }

  info(...args: any[]): void {
    if (!this.disabled) console.log(Color.GREEN, 'INFO', this.prefix , args);
  }
}
