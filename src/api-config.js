var API_CONFIG = {
    /* ****** WEBSOCKET ******** */
    WEBSOCKET_URL: 'wss://localhost:9000/refresh',
    /* ****** WEB API ******** */
    BASE_URL: 'http://localhost:9000/api/',
    /* ****** Root URL ******** */
    WARNING_URL: 'http://localhost:9000/VA/#/warning',
    // Api detail
    auth: {
        login: 'login/',
        changePass: 'user-password/',
        ssoLogin: 'ssocheck',
        ssoLoginV2: 'ssocheckV2'
    },
    analyzeCase: {
        indexFull: 'case-full',
        index: 'case/',
        detail: 'case/:id'
    },
    bookmark: {
        index: 'bookmark/',
        detail: 'bookmark/:id'
    },
    event: {
        index: 'event',
        detail: 'event/:id',
        newest: 'event-newest',
        image: 'event-image/:id/0.jpg',
        imageWithType: 'event-image/:id/:type.jpg',
        type: 'event-type-template',
        countLevel: 'event-count-level'
    },
    camera: {
        index: 'camera',
        detail: 'camera/:id',
        temp: 'camera-template',
        listCam: 'camera-list'
    },
    monitor: {
        index: 'monitor',
        type: 'monitor-type-template',
        detail: 'monitor/:id',
        param: 'monitor-param-template/:id',
        scheduled: 'monitor-scheduled'
    },
    user: {
        index: 'user',
        detail: 'user/:id',
        user: 'user-info',
        admin: 'user-info-admin',
        options: 'user-option',
        functions: 'user-function-template'
    },
    group: {
        index: 'group',
        detail: 'group/:id',
        user: 'user'
    },
    videoSnapshot: {
        original: 'video-image/:id/snapshot.jpg',
        medium: 'video-image/:id/snapshot-md.jpg',
        small: 'video-image/:id/snapshot-sm.jpg'
    },
    video: {
        index: 'video/',
        detail: 'video/:id',
        upload: 'video-upload/',
        videoPlay: 'event-image/:id/video.mp4',
        objectFocus: 'object-focus',
        objectOrigin: 'object-origin',
        heatMap: 'video-heatmap',
        briefVideo: 'brief',
        backgroundImage: 'video-image/:id/background.jpg'
    },
    server: {
        index: 'server',
        detail: 'server/'
    },
    action: {
        index: 'action-template'
    },
    caseVideo: {
        index: 'case-video/',
        indexFull: 'case-video-full/',
        detail: 'case-video/:id',
        createMultiple: 'case-video-list'
    },
    vms: {
        index: 'vms/',
        detail: 'vms/:id/',
        temp: 'vms-template'
    },

    // VMS api
    vmsMonitor: {
        index: 'monitors'
    },
    vmsVideo: {
        index: 'monitor_events'
    },

    // Report
    report: {
        index: 'report',
        detail: 'report/:id/'
    },
    template: {
        index: 'report-template',
        detail: 'report-template/:id/'
    },
    videoObject: {
        index: 'video-object/',
        detail: 'video-object/:id/',
        image: 'video-image/:videoId/:objectId-0.jpg'
    },

    // Profile API
    profile: {
        index: 'profile',
        detail: 'profile/:id',
        uploadAva: 'profile/:id/upload-portrait',
        profileImg: 'profile-image',
        profileImgDetail: 'profile-image/:id',
        image: 'profile-files/:profileId/:id.jpg',
        profilePortraitImage: 'profile-files/:id/portrait'
    },

    // Preset
    preset: {
        index: 'preset',
        detail: 'preset/:id'
    },

    department: {
        index: 'department',
        detail: 'department/:id',
        profile: 'profile-list'
    },
    // Attendance
    attendance: {
        groupPresentReport: 'staff-report/current-group-present',
        attendanceStatus: 'attendance-status',
        attendanceGreeting: 'welcome-message',
        staffWorkTimeReport: 'staff-report/staff-worktime-report'
    },
    // summaryReport
    summaryReport: {
        timeReport: 'staff-report/group-time-report',
        lateReport: 'staff-report/group-late-report',
        absentReport: 'staff-report/group-absent-report',
        topLate: 'staff-report/top-late-report',
        topAbsent: 'staff-report/top-absent-report',
        staffTimeReport: 'staff-report/staff-time-report'
    },
    // Stranger API
    stranger: {
        index: 'unknown-guest',
        detail: 'unknown-guest/:id'
    },
    // Zone API
    zone: {
        index: 'zone',
        detail: 'zone/:id',
        camera: 'zone-camera',
        cameraDetail: 'zone-camera/:id'
    },
    reception: {
        receptionTime: 'reception-time',
        receptionTimeReport: 'reception-time-report',
        receptionCameraStatus: 'reception-camera-status'
    },
    // Count People API
    countPeople: {
        count: 'event-count-zone',
        calculatePeople: 'statistic-today',
        statisticReport: 'statistic-detail-report',
        statisticSummaryReport: 'statistic-summary-report'
    },
    // Count Vehicle API
    countVehicle: {
        index: 'plate-profile',
        detail: 'plate-profile/:id',
        calculateVehicle: 'car-statistic-today',
        carStatisticReport: 'car-statistic-detail-report',
        carStatisticSummaryReport: 'car-statistic-summary-report'
    },
    // Holiday API
    holiday: {
        index: 'holiday',
        detail: 'holiday/:id'
    },
    // Configuration API
    configuration: {
        index: 'system-parameter',
        detail: 'system-parameter/:id'
    },
    hospitalBed: {
        index: 'hospital-bed'
    },
    monitorReport: {
        index: 'monitor-report'
    }
};

export default API_CONFIG;
