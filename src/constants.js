import timezones from './timezones';
const CONSTANTS = {
    SSO_LOGIN_URL:
        process.env.NODE_ENV === 'development'
            ? 'https://sso.benhvienk.vn/Login.aspx?ReturnURL=http://localhost:8080/#/login'
            : 'https://sso.benhvienk.vn/Login.aspx?ReturnURL=https://demo.smartcam.vn/#/login',
    SSO_COOKIE_TOKEN_NAME: 'BkavSSO',
    SSO_COOKIE_DOMAIN: '.benhvienk.vn',
    SSO_COOKIE_PATH: '/',
    ENDPOINT_SERVICE: {
        API: 1,
        VMS_API: 2
    },
    CASE_LIST_PER: 5,
    CASE_LIST_RELOAD_INTERVAL: 15000, // 15s
    TIMEZONES: timezones,
    VIDEO_STATUS: {
        VMS_DOWNLOAD: -1,
        AVAILABLE: 0,
        PROCESSING: 1,
        DONE: 2,
        ERROR: 3
    },
    VIDEO_STATUS_TEXTES: [
        {
            id: -1,
            text: 'vmsDownload'
        },
        {
            id: 0,
            text: 'available'
        },
        {
            id: 1,
            text: 'processing'
        },
        {
            id: 2,
            text: 'done'
        },
        {
            id: 3,
            text: 'error'
        }
    ],
    LOADING_ICON: '/static/img/loader-green.gif',
    VIDEO_SNAPSHOT_SIZE: {
        ORIGINAL: 'original',
        MEDIUM: 'medium',
        SMALL: 'small'
    },
    ADD_VIDEO_SOURCES: {
        UPLOAD: 'upload',
        VMS_IMPORT: 'vmsImport',
        EXISTED_VIDEO: 'chooseExistedVideo'
    },
    USER_FUNCTIONS: {
        ANALYZE: 'analyze',
        MONITOR: 'monitor',
        REPORT: 'report',
        MANAGE: 'manage',
        TOOL: 'tool',
        USER: 'user',
        SYSTEM: 'system',
        ATTENDANCE: 'attendance'
    },
    ITEM_PER_PAGE: 10,
    VIDEO_OBJECT_PER: 600,
    PROFILE_ITEM_PER: 54,
    PLATE_PROFILE_ITEM_PER: 24,
    COLOR_FILTERS: [
        {
            text: 'black',
            color: '#4D4D4D'
        },
        {
            text: 'white',
            color: '#fff'
        },
        {
            text: 'red',
            color: '#B32424'
        },
        {
            text: 'yellow',
            color: '#F7D631'
        },
        {
            text: 'green',
            color: '#29991F'
        },
        {
            text: 'cyan',
            color: '#29CCCC'
        },
        {
            text: 'blue',
            color: '#2E6BE6'
        },
        {
            text: 'purple',
            color: '#9629CC'
        }
    ],
    BOOKMARK_TYPES: {
        OBJECT: 'object'
    },
    DEFAULT_OBJECT_FILTER: {
        sources: ['all'],
        classes: ['all'],
        colors: ['all'],
        areas: []
    },
    VISUAL_LAYER_TYPES: {
        ACTIVITES: 'activity',
        DWELL: 'dwell',
        PATH: 'path',
        BACKGROUND_CHANGES: 'backgroundChanges'
    },
    VIDEO_LIST_PER: 30,
    USER_EMAIL_SYSTEM: 'system',
    MAX_ATTENDANCE_EVENT: 4,
    MAX_ATTENDANCE_FACE: 12,
    MAX_ATTENDANCE_STRANGER: 6,
    ATTENDANCE_EVENT_INTERVAL: 10 * 1000,
    ALERT_ITEM_PER_PAGE: 200,
    MAX_TRAFFIC_EVENT: 6,
    ATTENDANCE_FACE_INTERVAL: 15 * 1000,
    ALERT_EVENT_TIME_OUT: 3,
    MAX_ALERT_EVENT: 10,
    PRESENT_CAM_RATIO: 0,
    RECEPTION_INTERVAL: 30 * 1000,
    RECEPTION_REPORT_DETAIL_PER_PAGE: 100,
    RECEPTION_CAMERA_STATUSES: {
        PRESENT: 1,
        ABSENT: 2,
        BROKEN: 3,
        NO_SCHEDULE: 4
    },
    RECEPTION_MAX_EVENT: 6,
    RECEPTION_TOP_REGION_COUNT: 3,
    CAMERA_ITEM_PER_PAGE: 50,
    MORNING_WORK_TIME_START_HOUR: 7,
    MORNING_WORK_TIME_START_MINUTES: 30,
    MORNING_WORK_TIME_END_HOUR: 11,
    MORNING_WORK_TIME_END_MINUTES: 30,
    AFTERNOON_WORK_TIME_START_HOUR: 13,
    AFTERNOON_WORK_TIME_START_MINUTES: 0,
    AFTERNOON_WORK_TIME_END_HOUR: 17,
    AFTERNOON_WORK_TIME_END_MINUTES: 0,
    EVENT_MAX_TIME_DISPLAY: 10 * 3600 * 1000, // 300000
    CAM_LIVE_RELOAD_URL: 60 * 1000,
    ITEM_PEOPLE_COUNT_PER_PAGE: 20,
    FIND_DOCTOR_EVENT_LIMIT: 100
};
export default CONSTANTS;
