import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderConfirmationPage } from './order-confirmation.page';

describe('OrderConfirmationPage', () => {
  let component: OrderConfirmationPage;
  let fixture: ComponentFixture<OrderConfirmationPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderConfirmationPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderConfirmationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
