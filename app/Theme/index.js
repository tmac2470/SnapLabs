import { themeManager } from 'nachos-ui'
import Colors from './colors';

const buttonTheme = themeManager.getStyle('Button')
const newButtonTheme = {
  ...buttonTheme,
  BUTTON_STATE_PRIMARY: Colors.primary
}

const inputTheme = themeManager.getStyle('Input')
const newInputTheme = {
  ...inputTheme,
  INPUT_VALID_COLOR: Colors.primary
}
themeManager.setSource('Button', () => (newButtonTheme))
themeManager.setSource('Input', () => (newInputTheme))
