import Vue from 'vue';
import Router from 'vue-router';

// Containers
import Full from '../containers/Full';

// Views
import Login from '../views/Login';
import ErrorPage from '../views/ErrorPage';
import Warning from '../views/Warning';
import Home from '../views/Home';
import AlertEvent from '@/views/Alert/Event';
import AlertBookmark from '@/views/Alert/Bookmark';
import ReportList from '@/views/Report/List';
import ReportDetail from '@/views/Report/ReportDetail';
import AddTemplate from '@/views/Report/AddTemplate';
import analyzeCaseList from '../views/analyzeCase/List';
import analyzeCaseViewer from '../views/analyzeCase/CaseViewer';
import analyzeCaseReport from '../views/analyzeCase/CaseReport';
import analyzeCaseStatus from '../views/analyzeCase/CaseStatus';
import AttendanceCamera from '@/views/Attendance/Camera';
import AttendanceDetailToday from '@/views/Attendance/DetailToday';
import AttendanceWelcome from '@/views/Attendance/Welcome';
import AttendanceDoctor from '@/views/Attendance/Doctor';
import AttendanceEventNewest from '@/views/Attendance/EventNewest';
import AttendanceEventBookmark from '@/views/Attendance/EventBookmark';
import AttendanceManageStaff from '@/views/Attendance/ManageStaff';
import AttendanceManageGuest from '@/views/Attendance/ManageGuest';
import AttendanceManageStranger from '@/views/Attendance/ManageStranger';
import AttendanceManageStructure from '@/views/Attendance/ManageStructure';
import AttendanceManageMonitor from '@/views/Attendance/ManageMonitor';
import AttendanceManageRegion from '@/views/Attendance/ManageRegion';
import AttendanceReportSummary from '@/views/Attendance/ReportSummary';
import AttendanceReportDetail from '@/views/Attendance/ReportDetail';
import ReportStaff from '@/views/Attendance/ReportStaff';
import AlertDashboard from '@/views/Alert/Dashboard';
import AlertThief from '@/views/Alert/Thief';
import AlertFloorPlan from '@/views/Alert/FloorPlan';
import AlertHospitalBed from '@/views/Alert/HospitalBed';
import AlertManageProfile from '@/views/Alert/ManageProfile';
import AlertManageThief from '@/views/Alert/ManageThief';
import AlertManageRegion from '@/views/Alert/ManageRegion';
import AlertManageMonitor from '@/views/Alert/ManageMonitor';
import AlertManageStranger from '@/views/Alert/ManageStranger';
import AlertReportSummary from '@/views/Alert/ReportSummary';
import AlertReportDetail from '@/views/Alert/ReportDetail';
import ManageVms from '../views/Manage/VMS/VMS';
import ManageCamera from '../views/Manage/Camera/Camera';
import ManageHoliday from '../views/Manage/Holiday';
import ManageConfiguration from '../views/Manage/Configuration';
import ManageGroupUser from '../views/Manage/Group/GroupUser';
import ManageListUser from '../views/Manage/Group/ListUser';
import WelcomeWelcome from '@/views/Welcome/Welcome';
import WelcomeEventNewest from '@/views/Welcome/EventNewest';
import WelcomeEventBookmark from '@/views/Welcome/EventBookmark';
import WelcomeManageGuest from '@/views/Welcome/ManageGuest';
import WelcomeManageMonitor from '@/views/Welcome/ManageMonitor';
import WelcomeReportSummary from '@/views/Welcome/ReportSummary';
import WelcomeReportDetail from '@/views/Welcome/ReportDetail';
import ProcessMonitorDashboard from '@/views/ProcessMonitor/Dashboard';
import ProcessMonitorDashboardHcc from '@/views/ProcessMonitor/DashboardHcc';
import ProcessMonitorEventBookmark from '@/views/ProcessMonitor/EventBookmark';
import ProcessMonitorEventNewest from '@/views/ProcessMonitor/EventNewest';
import ProcessMonitorEventNewestHcc from '@/views/ProcessMonitor/EventNewestHcc';
import ProcessMonitorManageRegion from '@/views/ProcessMonitor/ManageRegion';
import ProcessMonitorManageMonitor from '@/views/ProcessMonitor/ManageMonitor';
import ProcessMonitorReportSummary from '@/views/ProcessMonitor/ReportSummary';
import ProcessMonitorReportDetail from '@/views/ProcessMonitor/ReportDetail';
import ProcessMonitorMap from '@/views/ProcessMonitor/Map';
import TrafficDashboard from '@/views/Traffic/Dashboard';
import TrafficEventBookmark from '@/views/Traffic/EventBookmark';
import TrafficEventNewest from '@/views/Traffic/EventNewest';
import TrafficManageRegion from '@/views/Traffic/ManageRegion';
import TrafficManageMonitor from '@/views/Traffic/ManageMonitor';
import TrafficReportSummary from '@/views/Traffic/ReportSummary';
import TrafficReportDetail from '@/views/Traffic/ReportDetail';
import TrafficMap from '@/views/Traffic/Map';
import PeopleCountDashboard from '@/views/PeopleCount/Dashboard';
import PeopleCountEventBookmark from '@/views/PeopleCount/EventBookmark';
import PeopleCountEventNewest from '@/views/PeopleCount/EventNewest';
import PeopleCountManageRegion from '@/views/PeopleCount/ManageRegion';
import PeopleCountManageMonitor from '@/views/PeopleCount/ManageMonitor';
import PeopleCountReportSummary from '@/views/PeopleCount/ReportSummary';
import PeopleCountReportDetail from '@/views/PeopleCount/ReportDetail';
import VehicleCountDashboard from '@/views/VehicleCount/Dashboard';
import VehicleCountEventBookmark from '@/views/VehicleCount/EventBookmark';
import VehicleCountEventNewest from '@/views/VehicleCount/EventNewest';
import VehicleCountManageRegion from '@/views/VehicleCount/ManageRegion';
import VehicleCountManageProfile from '@/views/VehicleCount/ManageProfile';
import VehicleCountManageMonitor from '@/views/VehicleCount/ManageMonitor';
import VehicleCountReportSummary from '@/views/VehicleCount/ReportSummary';
import VehicleCountReportDetail from '@/views/VehicleCount/ReportDetail';

// VueX store
import store from '../store';

import CONSTANTS from '@/constants';

Vue.use(Router);

Vue.component('warning', Warning);

// Before enter functions
const ifNotAuthenticated = (to, from, next) => {
    if (!store.getters['auth/isAuthenticated']) {
        next();
        return;
    }
    next('/home');
};
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateConfiguration() {
    await sleep(100);
    let listConfiguration = store.getters['configuration/items'];
    if (listConfiguration.length === 0) {
        listConfiguration = await store.dispatch('configuration/getList');
    }
    for (const config of listConfiguration) {
        if (config.name !== 'Web Parameters') continue;
        for (const key in config.objectValue) CONSTANTS[key] = config.objectValue[key];
        break;
    }
}
const ifAuthenticated = async (to, from, next) => {
    if (store.getters['auth/isAuthenticated']) {
        await updateConfiguration();
        next();
        return;
    }
    next('/login');
};

const beforeEnterManage = async (to, from, next) => {
    ifAuthenticated(to, from, next);
    await updateConfiguration();
    const userFunction = store.getters['auth/currentUser'].userDetail.functions;
    if (userFunction.indexOf('user') !== -1 && userFunction.indexOf('manage') === -1) {
        next('/manage/user');
        return;
    }
    next();
};

export default new Router({
    mode: 'hash',
    linkActiveClass: 'open active',
    routes: [
        {
            path: '/warning',
            name: 'warning',
            component: Warning
        },
        {
            path: '/login',
            name: 'Login',
            component: Login,
            beforeEnter: ifNotAuthenticated
        },
        {
            path: '*',
            name: 'ErrorPage',
            component: ErrorPage
        },
        {
            path: '/',
            redirect: '/home',
            name: 'Home',
            component: Full,
            children: [
                {
                    path: 'home',
                    name: 'Home',
                    component: Home,
                    beforeEnter: ifAuthenticated
                },
                // Analyze view
                {
                    path: 'analyze-case',
                    redirect: '/analyze-case',
                    name: 'Analyze',
                    component: {
                        render(c) {
                            return c('router-view');
                        }
                    },
                    children: [
                        // Survey
                        {
                            path: '',
                            name: 'Cases',
                            component: analyzeCaseList,
                            beforeEnter: ifAuthenticated
                        },
                        {
                            path: ':id(\\d+)/viewer',
                            name: 'Case viewer',
                            component: analyzeCaseViewer,
                            beforeEnter: ifAuthenticated
                        },
                        {
                            path: ':id(\\d+)/report',
                            name: 'Case Report',
                            component: analyzeCaseReport,
                            beforeEnter: ifAuthenticated
                        },
                        {
                            path: ':id(\\d+)/status',
                            name: 'Case status',
                            component: analyzeCaseStatus,
                            beforeEnter: ifAuthenticated
                        }
                    ]
                },
                {
                    path: 'report',
                    name: 'Report',
                    redirect: '/report',
                    component: {
                        render(c) {
                            return c('router-view');
                        }
                    },
                    children: [
                        {
                            path: '',
                            name: 'List Report',
                            component: ReportList,
                            beforeEnter: ifAuthenticated
                        },
                        {
                            path: 'create-template',
                            name: 'Create Template',
                            component: AddTemplate,
                            beforeEnter: ifAuthenticated
                        },
                        {
                            path: ':id',
                            name: 'Report Detail',
                            component: ReportDetail,
                            beforeEnter: ifAuthenticated
                        }
                    ]
                },

                // Alert view
                {
                    path: 'alert',
                    name: 'Alert',
                    redirect: '/alert/dashboard',
                    component: {
                        render(c) {
                            return c('router-view');
                        }
                    },
                    children: [
                        {
                            path: 'dashboard',
                            name: 'Alert Dashboard',
                            component: AlertDashboard,
                            beforeEnter: ifAuthenticated
                        },
                        {
                            path: 'thief',
                            name: 'Thief Dashboard',
                            component: AlertThief,
                            beforeEnter: ifAuthenticated
                        },
                        {
                            path: 'floor-plan',
                            name: 'Floor plan alert',
                            component: AlertFloorPlan,
                            beforeEnter: ifAuthenticated
                        },
                        {
                            path: 'hospital-bed',
                            name: 'Hospital Bed alert',
                            component: AlertHospitalBed,
                            beforeEnter: ifAuthenticated
                        },
                        {
                            path: 'event',
                            name: 'Alert',
                            redirect: '/alert/event/newest',
                            component: {
                                render(c) {
                                    return c('router-view');
                                }
                            },
                            children: [
                                {
                                    path: 'newest',
                                    name: 'Newest events',
                                    component: AlertEvent,
                                    beforeEnter: ifAuthenticated
                                },
                                {
                                    path: 'bookmark',
                                    name: 'Bookmarks',
                                    component: AlertBookmark,
                                    beforeEnter: ifAuthenticated
                                }
                            ]
                        },
                        {
                            path: 'manage',
                            name: 'Manage',
                            redirect: '/alert/manage/profile',
                            component: {
                                render(c) {
                                    return c('router-view');
                                }
                            },
                            children: [
                                {
                                    path: 'profile',
                                    name: 'Profile',
                                    component: AlertManageProfile,
                                    beforeEnter: beforeEnterManage
                                },
                                {
                                    path: 'thief',
                                    name: 'Thief',
                                    component: AlertManageThief,
                                    beforeEnter: beforeEnterManage
                                },
                                {
                                    path: 'stranger',
                                    name: 'Stranger',
                                    component: AlertManageStranger,
                                    beforeEnter: beforeEnterManage
                                },
                                {
                                    path: 'region',
                                    name: 'Region',
                                    component: AlertManageRegion,
                                    beforeEnter: beforeEnterManage
                                },
                                {
                                    path: 'monitor',
                                    name: 'Monitor',
                                    component: AlertManageMonitor,
                                    beforeEnter: beforeEnterManage
                                }
                            ]
                        },
                        {
                            path: 'report',
                            name: 'Report',
                            redirect: '/alert/report/summary',
                            component: {
                                render(c) {
                                    return c('router-view');
                                }
                            },
                            children: [
                                {
                                    path: 'summary',
                                    name: 'Summary',
                                    component: AlertReportSummary,
                                    beforeEnter: beforeEnterManage
                                },
                                {
                                    path: 'detail',
                                    name: 'Detail',
                                    component: AlertReportDetail,
                                    beforeEnter: beforeEnterManage
                                }
                            ]
                        }
                    ]
                },

                // Attendance view
                {
                    path: 'attendance',
                    name: 'Attendance',
                    redirect: '/attendance/camera',
                    component: {
                        render(c) {
                            return c('router-view');
                        }
                    },
                    children: [
                        {
                            path: 'camera',
                            name: 'AttendanceCamera',
                            component: AttendanceCamera,
                            beforeEnter: ifAuthenticated
                        },
                        {
                            path: 'detailtoday',
                            name: 'DetailToday',
                            component: AttendanceDetailToday,
                            beforeEnter: ifAuthenticated
                        },
                        {
                            path: 'welcome',
                            name: 'Welcome',
                            component: AttendanceWelcome,
                            beforeEnter: ifAuthenticated
                        },
                        {
                            path: 'doctor',
                            name: 'Find Doctor',
                            component: AttendanceDoctor,
                            beforeEnter: ifAuthenticated
                        },
                        {
                            path: 'event',
                            name: 'Alert',
                            redirect: '/attendance/event/newest',
                            component: {
                                render(c) {
                                    return c('router-view');
                                }
                            },
                            children: [
                                {
                                    path: 'newest',
                                    name: 'Newest events',
                                    component: AttendanceEventNewest,
                                    beforeEnter: ifAuthenticated
                                },
                                {
                                    path: 'bookmark',
                                    name: 'Bookmarks',
                                    component: AttendanceEventBookmark,
                                    beforeEnter: ifAuthenticated
                                }
                            ]
                        },
                        {
                            path: 'manage',
                            name: 'Manage',
                            redirect: '/attendance/manage/staff',
                            component: {
                                render(c) {
                                    return c('router-view');
                                }
                            },
                            children: [
                                {
                                    path: 'staff',
                                    name: 'Staff',
                                    component: AttendanceManageStaff,
                                    beforeEnter: beforeEnterManage
                                },
                                {
                                    path: 'guest',
                                    name: 'AttendanceGuest',
                                    component: AttendanceManageGuest,
                                    beforeEnter: ifAuthenticated
                                },
                                {
                                    path: 'stranger',
                                    name: 'AttendanceStranger',
                                    component: AttendanceManageStranger,
                                    beforeEnter: ifAuthenticated
                                },
                                {
                                    path: 'structure',
                                    name: 'AttendanceStructure',
                                    component: AttendanceManageStructure,
                                    beforeEnter: ifAuthenticated
                                },
                                {
                                    path: 'monitor',
                                    name: 'AttendanceMonitor',
                                    component: AttendanceManageMonitor,
                                    beforeEnter: ifAuthenticated
                                },
                                {
                                    path: 'region',
                                    name: 'AttendanceManageRegion',
                                    component: AttendanceManageRegion,
                                    beforeEnter: ifAuthenticated
                                }
                            ]
                        },
                        {
                            path: 'report',
                            name: 'Report',
                            redirect: '/attendance/report/summary',
                            component: {
                                render(c) {
                                    return c('router-view');
                                }
                            },
                            children: [
                                {
                                    path: 'summary',
                                    name: 'Summary',
                                    component: AttendanceReportSummary,
                                    beforeEnter: beforeEnterManage
                                },
                                {
                                    path: 'detail',
                                    name: 'Detail',
                                    component: AttendanceReportDetail,
                                    beforeEnter: beforeEnterManage
                                },
                                {
                                    path: 'staff-report',
                                    name: 'StaffReport',
                                    component: ReportStaff,
                                    beforeEnter: ifAuthenticated
                                }
                            ]
                        }
                    ]
                },

                // Traffic view
                {
                    path: 'traffic',
                    name: 'Traffic',
                    redirect: '/traffic/dashboard',
                    component: {
                        render(c) {
                            return c('router-view');
                        }
                    },
                    children: [
                        {
                            path: 'dashboard',
                            name: 'Traffic Dashboard',
                            component: TrafficDashboard,
                            beforeEnter: ifAuthenticated
                        },
                        {
                            path: 'map',
                            name: 'Traffic map',
                            component: TrafficMap,
                            beforeEnter: ifAuthenticated
                        },
                        {
                            path: 'event',
                            name: 'Alert',
                            redirect: '/traffic/event/newest',
                            component: {
                                render(c) {
                                    return c('router-view');
                                }
                            },
                            children: [
                                {
                                    path: 'newest',
                                    name: 'Newest events',
                                    component: TrafficEventNewest,
                                    beforeEnter: ifAuthenticated
                                },
                                {
                                    path: 'bookmark',
                                    name: 'Bookmarks',
                                    component: TrafficEventBookmark,
                                    beforeEnter: ifAuthenticated
                                }
                            ]
                        },
                        {
                            path: 'manage',
                            name: 'Manage',
                            redirect: '/traffic/manage/region',
                            component: {
                                render(c) {
                                    return c('router-view');
                                }
                            },
                            children: [
                                {
                                    path: 'region',
                                    name: 'Region',
                                    component: TrafficManageRegion,
                                    beforeEnter: beforeEnterManage
                                },
                                {
                                    path: 'monitor',
                                    name: 'Monitor',
                                    component: TrafficManageMonitor,
                                    beforeEnter: beforeEnterManage
                                }
                            ]
                        },
                        {
                            path: 'report',
                            name: 'Report',
                            redirect: '/traffic/report/summary',
                            component: {
                                render(c) {
                                    return c('router-view');
                                }
                            },
                            children: [
                                {
                                    path: 'summary',
                                    name: 'Summary',
                                    component: TrafficReportSummary,
                                    beforeEnter: beforeEnterManage
                                },
                                {
                                    path: 'detail',
                                    name: 'Detail',
                                    component: TrafficReportDetail,
                                    beforeEnter: beforeEnterManage
                                }
                            ]
                        }
                    ]
                },

                // Management view
                {
                    path: 'management',
                    name: 'Management',
                    redirect: '/management/manage',
                    component: {
                        render(c) {
                            return c('router-view');
                        }
                    },
                    children: [
                        {
                            path: 'manage',
                            name: 'Manage',
                            redirect: '/management/manage/camera',
                            component: {
                                render(c) {
                                    return c('router-view');
                                }
                            },
                            children: [
                                {
                                    path: 'camera',
                                    name: 'Camera',
                                    component: ManageCamera,
                                    beforeEnter: ifAuthenticated
                                },
                                {
                                    path: 'vms',
                                    name: 'VMS',
                                    component: ManageVms,
                                    beforeEnter: beforeEnterManage
                                },
                                {
                                    path: 'holiday',
                                    name: 'Holiday',
                                    component: ManageHoliday,
                                    beforeEnter: beforeEnterManage
                                },
                                {
                                    path: 'configuration',
                                    name: 'Configuration',
                                    component: ManageConfiguration,
                                    beforeEnter: beforeEnterManage
                                }
                            ]
                        },
                        {
                            path: 'user',
                            name: 'User',
                            redirect: '/management/user/group',
                            component: {
                                render(c) {
                                    return c('router-view');
                                }
                            },
                            children: [
                                // GroupUser
                                {
                                    path: 'group',
                                    name: 'Group User',
                                    component: ManageGroupUser,
                                    beforeEnter: ifAuthenticated
                                },
                                {
                                    path: 'user',
                                    name: 'List Users',
                                    component: ManageListUser,
                                    beforeEnter: ifAuthenticated
                                }
                            ]
                        }
                    ]
                },

                // Welcome view
                {
                    path: 'welcome',
                    name: 'Welcome',
                    redirect: '/welcome/camera',
                    component: {
                        render(c) {
                            return c('router-view');
                        }
                    },
                    children: [
                        {
                            path: 'welcome',
                            name: 'Welcome',
                            component: WelcomeWelcome,
                            beforeEnter: ifAuthenticated
                        },
                        {
                            path: 'event',
                            name: 'Alert',
                            redirect: '/welcome/event/newest',
                            component: {
                                render(c) {
                                    return c('router-view');
                                }
                            },
                            children: [
                                {
                                    path: 'newest',
                                    name: 'Newest events',
                                    component: WelcomeEventNewest,
                                    beforeEnter: ifAuthenticated
                                },
                                {
                                    path: 'bookmark',
                                    name: 'Bookmarks',
                                    component: WelcomeEventBookmark,
                                    beforeEnter: ifAuthenticated
                                }
                            ]
                        },
                        {
                            path: 'manage',
                            name: 'Manage',
                            redirect: '/welcome/manage/guest',
                            component: {
                                render(c) {
                                    return c('router-view');
                                }
                            },
                            children: [
                                {
                                    path: 'guest',
                                    name: 'Guest',
                                    component: WelcomeManageGuest,
                                    beforeEnter: beforeEnterManage
                                },
                                {
                                    path: 'monitor',
                                    name: 'WelcomeMonitor',
                                    component: WelcomeManageMonitor,
                                    beforeEnter: ifAuthenticated
                                }
                            ]
                        },
                        {
                            path: 'report',
                            name: 'Report',
                            redirect: '/welcome/report/summary',
                            component: {
                                render(c) {
                                    return c('router-view');
                                }
                            },
                            children: [
                                {
                                    path: 'summary',
                                    name: 'Summary',
                                    component: WelcomeReportSummary,
                                    beforeEnter: beforeEnterManage
                                },
                                {
                                    path: 'detail',
                                    name: 'Detail',
                                    component: WelcomeReportDetail,
                                    beforeEnter: beforeEnterManage
                                }
                            ]
                        }
                    ]
                },

                // Process monitor view
                {
                    path: 'process-monitor',
                    name: 'Process monitor',
                    redirect: '/process-monitor/dashboard',
                    component: {
                        render(c) {
                            return c('router-view');
                        }
                    },
                    children: [
                        {
                            path: 'dashboard',
                            name: 'Process monitor dashboard',
                            component: ProcessMonitorDashboard,
                            beforeEnter: ifAuthenticated
                        },
                        {
                            path: 'dashboardhcc',
                            name: 'Process monitor dashboardhcc',
                            component: ProcessMonitorDashboardHcc,
                            beforeEnter: ifAuthenticated
                        },
                        {
                            path: 'map',
                            name: 'Process monitor map',
                            component: ProcessMonitorMap,
                            beforeEnter: ifAuthenticated
                        },
                        {
                            path: 'event',
                            name: 'Alert',
                            redirect: '/process-monitor/event/newest',
                            component: {
                                render(c) {
                                    return c('router-view');
                                }
                            },
                            children: [
                                {
                                    path: 'newest',
                                    name: 'Newest events',
                                    component: ProcessMonitorEventNewest,
                                    beforeEnter: ifAuthenticated
                                },
                                {
                                    path: 'bookmark',
                                    name: 'Bookmarks',
                                    component: ProcessMonitorEventBookmark,
                                    beforeEnter: ifAuthenticated
                                }
                            ]
                        },
                        {
                            path: 'eventhcc',
                            name: 'Alert',
                            redirect: '/process-monitor/eventhcc/newest',
                            component: {
                                render(c) {
                                    return c('router-view');
                                }
                            },
                            children: [
                                {
                                    path: 'newest',
                                    name: 'Newest events',
                                    component: ProcessMonitorEventNewestHcc,
                                    beforeEnter: ifAuthenticated
                                },
                                {
                                    path: 'bookmark',
                                    name: 'Bookmarks',
                                    component: ProcessMonitorEventBookmark,
                                    beforeEnter: ifAuthenticated
                                }
                            ]
                        },
                        {
                            path: 'manage',
                            name: 'Manage',
                            redirect: '/process-monitor/manage/region',
                            component: {
                                render(c) {
                                    return c('router-view');
                                }
                            },
                            children: [
                                {
                                    path: 'region',
                                    name: 'Region',
                                    component: ProcessMonitorManageRegion,
                                    beforeEnter: beforeEnterManage
                                },
                                {
                                    path: 'monitor',
                                    name: 'Monitor',
                                    component: ProcessMonitorManageMonitor,
                                    beforeEnter: beforeEnterManage
                                }
                            ]
                        },
                        {
                            path: 'report',
                            name: 'Report',
                            redirect: '/process-monitor/report/detail',
                            component: {
                                render(c) {
                                    return c('router-view');
                                }
                            },
                            children: [
                                {
                                    path: 'summary',
                                    name: 'Summary',
                                    component: ProcessMonitorReportSummary,
                                    beforeEnter: beforeEnterManage
                                },
                                {
                                    path: 'detail',
                                    name: 'Detail',
                                    component: ProcessMonitorReportDetail,
                                    beforeEnter: beforeEnterManage
                                }
                            ]
                        }
                    ]
                },

                // PeopleCount view
                {
                    path: 'people-count',
                    name: 'PeopleCount',
                    redirect: '/people-count/dashboard',
                    component: {
                        render(c) {
                            return c('router-view');
                        }
                    },
                    children: [
                        {
                            path: 'dashboard',
                            name: 'PeopleCount Dashboard',
                            component: PeopleCountDashboard,
                            beforeEnter: ifAuthenticated
                        },
                        {
                            path: 'event',
                            name: 'Alert',
                            redirect: '/people-count/event/newest',
                            component: {
                                render(c) {
                                    return c('router-view');
                                }
                            },
                            children: [
                                {
                                    path: 'newest',
                                    name: 'Newest events',
                                    component: PeopleCountEventNewest,
                                    beforeEnter: ifAuthenticated
                                },
                                {
                                    path: 'bookmark',
                                    name: 'Bookmarks',
                                    component: PeopleCountEventBookmark,
                                    beforeEnter: ifAuthenticated
                                }
                            ]
                        },
                        {
                            path: 'manage',
                            name: 'Manage',
                            redirect: '/people-count/manage/region',
                            component: {
                                render(c) {
                                    return c('router-view');
                                }
                            },
                            children: [
                                {
                                    path: 'region',
                                    name: 'Region',
                                    component: PeopleCountManageRegion,
                                    beforeEnter: beforeEnterManage
                                },
                                {
                                    path: 'monitor',
                                    name: 'Monitor',
                                    component: PeopleCountManageMonitor,
                                    beforeEnter: beforeEnterManage
                                }
                            ]
                        },
                        {
                            path: 'report',
                            name: 'Report',
                            redirect: '/people-count/report/summary',
                            component: {
                                render(c) {
                                    return c('router-view');
                                }
                            },
                            children: [
                                {
                                    path: 'summary',
                                    name: 'Summary',
                                    component: PeopleCountReportSummary,
                                    beforeEnter: beforeEnterManage
                                },
                                {
                                    path: 'detail',
                                    name: 'Detail',
                                    component: PeopleCountReportDetail,
                                    beforeEnter: beforeEnterManage
                                }
                            ]
                        }
                    ]
                },
                // VehicleCount view
                {
                    path: 'vehicle-count',
                    name: 'VehicleCount',
                    redirect: '/vehicle-count/dashboard',
                    component: {
                        render(c) {
                            return c('router-view');
                        }
                    },
                    children: [
                        {
                            path: 'dashboard',
                            name: 'VehicleCount Dashboard',
                            component: VehicleCountDashboard,
                            beforeEnter: ifAuthenticated
                        },
                        {
                            path: 'event',
                            name: 'Alert',
                            redirect: '/vehicle-count/event/newest',
                            component: {
                                render(c) {
                                    return c('router-view');
                                }
                            },
                            children: [
                                {
                                    path: 'newest',
                                    name: 'Newest events',
                                    component: VehicleCountEventNewest,
                                    beforeEnter: ifAuthenticated
                                },
                                {
                                    path: 'bookmark',
                                    name: 'Bookmarks',
                                    component: VehicleCountEventBookmark,
                                    beforeEnter: ifAuthenticated
                                }
                            ]
                        },
                        {
                            path: 'manage',
                            name: 'Manage',
                            redirect: '/vehicle-count/manage/region',
                            component: {
                                render(c) {
                                    return c('router-view');
                                }
                            },
                            children: [
                                {
                                    path: 'region',
                                    name: 'Region',
                                    component: VehicleCountManageRegion,
                                    beforeEnter: beforeEnterManage
                                },
                                {
                                    path: 'profile',
                                    name: 'Profile',
                                    component: VehicleCountManageProfile,
                                    beforeEnter: beforeEnterManage
                                },
                                {
                                    path: 'monitor',
                                    name: 'Monitor',
                                    component: VehicleCountManageMonitor,
                                    beforeEnter: beforeEnterManage
                                }
                            ]
                        },
                        {
                            path: 'report',
                            name: 'Report',
                            redirect: '/vehicle-count/report/summary',
                            component: {
                                render(c) {
                                    return c('router-view');
                                }
                            },
                            children: [
                                {
                                    path: 'summary',
                                    name: 'Summary',
                                    component: VehicleCountReportSummary,
                                    beforeEnter: beforeEnterManage
                                },
                                {
                                    path: 'detail',
                                    name: 'Detail',
                                    component: VehicleCountReportDetail,
                                    beforeEnter: beforeEnterManage
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
});
