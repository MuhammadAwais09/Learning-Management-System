import PropTypes from 'prop-types';

// material-ui
import { Box, Grid } from '@mui/material';

// project import
import AuthCard from './AuthCard';
import Logo from '../../assets/images/icons/login.png';

// ==============================|| AUTHENTICATION - WRAPPER ||============================== //

const AuthWrapper = ({ children }) => (
    <Box sx={{ minHeight: '100vh' }}>
        <Grid
            container
            direction="column"
            justifyContent="flex-end"
            sx={{
                minHeight: '100vh'
            }}
        >
            <Grid item xs={12}>
                <Grid container direction="column" alignItems="center">
                    {/* First Image */}
                    {/* <img
                        src={Logo}
                        alt="Learnify Logo"
                        style={{ width: '200px', height: '150px' }} // Adjust width and height here
                    /> */}
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Grid
                    item
                    xs={12}
                    container
                    justifyContent="center"
                    alignItems="center"
                    sx={{ minHeight: { xs: 'calc(100vh - 134px)' } }}
                >
                    <Grid item>
                        <AuthCard>{children}</AuthCard>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    </Box>
);

AuthWrapper.propTypes = {
    children: PropTypes.node
};

export default AuthWrapper;
