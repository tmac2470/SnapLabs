import { themeManager } from 'nachos-ui'
import Colors from './colors';

const buttonTheme = themeManager.getStyle('Button')
const newButtonTheme = {
  ...buttonTheme,
  BUTTON_STATE_PRIMARY: Colors.primary,
  BUTTON_STATE_SUCCESS: Colors.secondary,
  BUTTON_STATE_DANGER: Colors.danger,
  BUTTON_ROUNDED_RADIUS: 4
}

const inputTheme = themeManager.getStyle('Input')
const newInputTheme = {
  ...inputTheme,
  INPUT_VALID_COLOR: Colors.primary,
  INPUT_WARN_COLOR: Colors.danger
}
themeManager.setSource('Button', () => (newButtonTheme))
themeManager.setSource('Input', () => (newInputTheme))
