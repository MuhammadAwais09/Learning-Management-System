import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import NavGroup from './NavGroup';
import { 
  DashboardOutlined, 
  UserOutlined, 
  FileWordOutlined, 
  QuestionCircleOutlined, 
  SettingOutlined, 
  AppstoreAddOutlined, 
  ProfileOutlined, 
  BarChartOutlined,
  BookOutlined,
  RobotOutlined,
} from '@ant-design/icons';

const Navigation = () => {
  const userType = localStorage.getItem('role');
  const icons = {
    DashboardOutlined,
    UserOutlined,
    FileWordOutlined,
    QuestionCircleOutlined,
    SettingOutlined,
    AppstoreAddOutlined,
    ProfileOutlined,
    BarChartOutlined,
    BookOutlined,
    RobotOutlined,
  };

  const [pages, setPages] = useState({
    id: 'main',
    title: 'Main Menu',
    type: 'group',
    children: [],
  });

  useEffect(() => {
    const navigation = {
      id: 'main',
      title: 'Main Menu',
      type: 'group',
      children: [],
    };

    if (userType === 'Admin') {
      navigation.children = [
        {
          id: 'Dashboard',
          title: 'Dashboard',
          type: 'item',
          url: '/admin/dashboard',
          icon: icons.DashboardOutlined,
        },
        {
          id: 'TeacherManagement',
          title: 'Teacher Management',
          type: 'item',
          url: '/admin-teacher-management',
          icon: icons.AppstoreAddOutlined,
        },
        {
          id: 'UserManagement',
          title: 'User Management',
          type: 'item',
          url: '/admin-user-management',
          icon: icons.ProfileOutlined,
        },
        {
          id: 'Reports',
          title: 'Reports',
          type: 'item',
          url: '/admin-reports',
          icon: icons.BarChartOutlined,
        },
        {
          id: 'Settings',
          title: 'Settings',
          type: 'item',
          url: '/admin-settings',
          icon: icons.SettingOutlined,
        },
      ];
    } else if (userType === 'Teacher') {
      navigation.children = [
        {
          id: 'Dashboard',
          title: 'Dashboard',
          type: 'item',
          url: '/teacher/dashboard',
          icon: icons.DashboardOutlined,
        },
        {
          id: 'CourseManagement',
          title: 'Course Management',
          type: 'item',
          url: '/teacher/course-management',
          icon: icons.AppstoreAddOutlined,
        },
        {
          id: 'Communication',
          title: 'Communication',
          type: 'item',
          url: '/teacher/communication',
          icon: icons.QuestionCircleOutlined,
        },
        {
          id: 'AssessmentGrading',
          title: 'Assessment & Grading',
          type: 'item',
          url: '/teacher/assessment-grading',
          icon: icons.BookOutlined,
        },
        {
          id: 'ProgressTracking',
          title: 'Progress Tracking',
          type: 'item',
          url: '/teacher/progress-tracking',
          icon: icons.BarChartOutlined,
        },
        {
          id: 'AIChatbot',
          title: 'AI Chatbot',
          type: 'item',
          url: '/teacher/ai-chatbot',
          icon: icons.RobotOutlined,
        },
        {
          id: 'Profile',
          title: 'Profile',
          type: 'item',
          url: '/teacher/profile',
          icon: icons.ProfileOutlined,
        },
        {
          id: 'Settings',
          title: 'Settings',
          type: 'item',
          url: '/teacher/settings',
          icon: icons.SettingOutlined,
        },
      ];
    } else if (userType === 'Student') {
      navigation.children = [
        {
          id: 'Dashboard',
          title: 'Dashboard',
          type: 'item',
          url: '/student/dashboard',
          icon: icons.DashboardOutlined,
        },
        {
          id: 'Courses',
          title: 'Courses',
          type: 'item',
          url: '/student/courses',
          icon: icons.FileWordOutlined,
        },
        {
          id: 'Communication',
          title: 'Communication',
          type: 'item',
          url: '/student/communication',
          icon: icons.QuestionCircleOutlined,
        },
        {
          id: 'AssessmentGrading',
          title: 'Assessment & Grading',
          type: 'item',
          url: '/student/assessment-grading',
          icon: icons.BookOutlined,
        },
        {
          id: 'ProgressTracking',
          title: 'Progress Tracking',
          type: 'item',
          url: '/student/progress-tracking',
          icon: icons.BarChartOutlined,
        },
        {
          id: 'AIChatbot',
          title: 'AI Chatbot',
          type: 'item',
          url: '/student/ai-chatbot',
          icon: icons.RobotOutlined,
        },
        {
          id: 'Profile',
          title: 'Profile',
          type: 'item',
          url: '/student/profile',
          icon: icons.ProfileOutlined,
        },
        {
          id: 'Settings',
          title: 'Settings',
          type: 'item',
          url: '/student/settings',
          icon: icons.SettingOutlined,
        },
      ];
    }

    setPages(navigation);
  }, [userType]);

  return (
    <Box sx={{ pt: 2 }}>
      {pages.children.length > 0 ? (
        <NavGroup key={pages.id} item={pages} />
      ) : (
        <Typography variant="h6" color="error" align="center">
          No Navigation Items
        </Typography>
      )}
    </Box>
  );
};

export default Navigation;