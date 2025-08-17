// assets
import { FileWordOutlined, UserAddOutlined } from '@ant-design/icons';

// icons
const icons = {
    FileWordOutlined,
    UserAddOutlined
};

// ==============================|| MENU ITEMS - EXTRA PAGES ||============================== //

const pages = {
    id: 'authentication',
    type: 'group',
    children: [
        {
            id: 'Dashboard',
            title: 'Dashboard',
            type: 'item',
            url: '/Dashboard',
            icon: icons.FileWordOutlined,
        },
        // Uncomment and update the following block if needed
        // {
        //     id: 'register1',
        //     title: 'Register',
        //     type: 'item',
        //     url: '/register',
        //     icon: icons.UserAddOutlined,
        //     target: '_blank' // Use '_blank' to open in a new tab
        // }
    ]
};

export default pages;
