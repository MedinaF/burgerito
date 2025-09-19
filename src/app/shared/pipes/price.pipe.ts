import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'price',
  standalone: true
})
export class PricePipe implements PipeTransform {
  private readonly formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  });

  transform(value: number | null | undefined): string {
    if (typeof value !== 'number') {
      return this.formatter.format(0);
    }

    return this.formatter.format(value);
  }
}
