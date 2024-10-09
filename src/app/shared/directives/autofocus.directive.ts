import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';
import { BreakpointObserverService } from '../../services/breakpoint-observer.service';

@Directive({
  selector: '[appAutofocus]',
  standalone: true
})
export class AutofocusDirective implements AfterViewInit {
  private breakpointService = inject(BreakpointObserverService);

  constructor(private elementRef: ElementRef) { }

  ngAfterViewInit(): void {
    if (!this.breakpointService.isMobile) {
      this.elementRef.nativeElement.focus();
    }
  }
}
