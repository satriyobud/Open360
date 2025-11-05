import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Dashboard,
  People,
  Assessment,
  Category,
  Quiz,
  Assignment,
  Feedback,
  BarChart,
  Logout,
  Menu as MenuIcon,
  AccountCircle
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';

// Import admin components
import DashboardOverview from '../components/admin/DashboardOverview.tsx';
import EmployeeManagement from '../components/admin/EmployeeManagement.tsx';
import ReviewCycleManagement from '../components/admin/ReviewCycleManagement.tsx';
import CategoryManagement from '../components/admin/CategoryManagement.tsx';
import QuestionManagement from '../components/admin/QuestionManagement.tsx';
import AssignmentManagement from '../components/admin/AssignmentManagement.tsx';
import FeedbackManagement from '../components/admin/FeedbackManagement.tsx';
import ReportsDashboard from '../components/admin/ReportsDashboard.tsx';
import DepartmentsManagement from '../components/admin/DepartmentsManagement.tsx';
import FeedbackSummaries from '../components/admin/FeedbackSummaries.tsx';

const drawerWidth = 240;

const AdminDashboard: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
    { text: 'Employees', icon: <People />, path: '/admin/employees' },
    { text: 'Departments', icon: <People />, path: '/admin/departments' },
    { text: 'Review Cycles', icon: <Assessment />, path: '/admin/review-cycles' },
    { text: 'Categories', icon: <Category />, path: '/admin/categories' },
    { text: 'Questions', icon: <Quiz />, path: '/admin/questions' },
    { text: 'Assignments', icon: <Assignment />, path: '/admin/assignments' },
    { text: 'Feedbacks', icon: <Feedback />, path: '/admin/feedbacks' },
    { text: 'Reports', icon: <BarChart />, path: '/admin/reports' },
    { text: 'Summaries', icon: <Assessment />, path: '/admin/summaries' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Open360
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem disabled>
              <Typography variant="body2">
                {user?.name} ({user?.email})
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Routes>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/employees" element={<EmployeeManagement />} />
          <Route path="/departments" element={<DepartmentsManagement />} />
          <Route path="/review-cycles" element={<ReviewCycleManagement />} />
          <Route path="/categories" element={<CategoryManagement />} />
          <Route path="/questions" element={<QuestionManagement />} />
          <Route path="/assignments" element={<AssignmentManagement />} />
          <Route path="/feedbacks" element={<FeedbackManagement />} />
          <Route path="/reports" element={<ReportsDashboard />} />
          <Route path="/summaries" element={<FeedbackSummaries />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default AdminDashboard;

