import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'availability'
})
export class AvailabilityPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
