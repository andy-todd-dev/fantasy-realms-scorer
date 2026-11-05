// react-aria has test-only code that reads window.screen.orientation as it loads. React Native's
// Jest environment defines window but not screen, so without this any import of Gluestack throws.
window.screen = { orientation: { angle: 0 } };
