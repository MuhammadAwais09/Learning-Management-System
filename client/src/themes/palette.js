// material-ui
import { createTheme } from '@mui/material/styles';

// third-party
import { presetPalettes } from '@ant-design/colors';

// project import
import ThemeOption from './theme';

// ==============================|| DEFAULT THEME - PALETTE  ||============================== //

const Palette = (mode) => {
    const colors = presetPalettes;

    const greyPrimary = [
        '#ffffff',
        '#fafafa',
        '#f5f5f5',
        '#f0f0f0',
        '#d9d9d9',
        '#bfbfbf',
        '#8c8c8c',
        '#595959',
        '#262626',
        '#141414',
        '#000000'
    ];
    const greyAscent = ['#fafafa', '#bfbfbf', '#434343', '#1f1f1f'];
    const greyConstant = ['#fafafb', '#e6ebf1'];

    colors.grey = [...greyPrimary, ...greyAscent, ...greyConstant];

    const paletteColor = ThemeOption(colors);

    return createTheme({
        palette: {
            mode,
            common: {
                black: '#040404',
                white: '#fff'
            },
            primary: {
                main: '#1e2b55', // Dark Blue as the main theme color
                contrastText: '#fff'
            },
            secondary: {
                main: '#93ccab', // Green
                contrastText: '#000'
            },
            warning: {
                main: '#eaba2b', // Yellow
                contrastText: '#000'
            },
            info: {
                main: '#f1d291', // Light Brown
                contrastText: '#000'
            },
            background: {
                paper: '#f5f5f5', // Light grey background
                default: '#fafafa'
            },
            text: {
                primary: '#1e2b55', // Dark Blue for primary text
                secondary: paletteColor.grey[700],
                disabled: paletteColor.grey[400]
            },
            action: {
                disabled: paletteColor.grey[300]
            },
            divider: paletteColor.grey[200],
        }
    });
};

export default Palette;
