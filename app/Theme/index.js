import { themeManager } from 'nachos-ui'
import Colors from './colors';

const buttonTheme = themeManager.getStyle('Button')
const newButtonTheme = {
  ...buttonTheme,
  BUTTON_STATE_PRIMARY: Colors.primaryBackground
}

themeManager.setSource('Button', () => (newButtonTheme))