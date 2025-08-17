import PropTypes from 'prop-types';

// material-ui
import { Box } from '@mui/material';

// project import
import MainCard from 'components/MainCard';

// ==============================|| AUTHENTICATION - CARD WRAPPER ||============================== //

const AuthCard = ({ children, ...other }) => (
    <MainCard
        sx={{
            width: '100%', // Full width
            maxWidth: { xs: '100%', sm: 600, md: 750, lg: 900, xl: 1200 }, // Responsive max-width
            margin: 'auto', // Centering
            '& > *': {
                flexGrow: 1,
                flexBasis: '50%'
            }
        }}
        content={false}
        {...other}
        border={false}
        boxShadow
        shadow={(theme) => theme.customShadows.z1}
    >
        <Box sx={{ p: { xs: 3, sm: 4, md: 5, xl: 6 } }}>{children}</Box>
    </MainCard>
);

AuthCard.propTypes = {
    children: PropTypes.node
};

export default AuthCard;
