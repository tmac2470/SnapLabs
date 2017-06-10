// Angular
import { Directive, HostListener } from '@angular/core';
// Ionic
import { Keyboard } from '@ionic-native/keyboard';

@Directive({
  selector: '[appHideKeyBoardGo]'
})
export class HideKeyboardOnGoDirective {
  constructor(private keyboard: Keyboard) { }

  @HostListener('keypress', ['$event'])
  onKeypress(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      this.keyboard.close();
    }
  }

};
