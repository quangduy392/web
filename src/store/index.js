import Vue from 'vue';
import Vuex from 'vuex';
import config from './modules/config';
import page from './modules/page';
import auth from './modules/auth';
import event from './modules/event';
import camera from './modules/camera';
import monitorReport from './modules/monitorReport';
import monitor from './modules/monitor';
import user from './modules/user';
import server from './modules/server';
import action from './modules/action';
import analyzeCase from './modules/analyzeCase';
import group from './modules/group-user';
import vms from './modules/vms';
import video from './modules/video';
import caseVideo from './modules/caseVideo';
import vmsMonitor from './modules/vmsMonitor';
import vmsVideo from './modules/vmsVideo';
import report from './modules/report';
import videoObject from './modules/videoObject';
import profile from './modules/profile';
import preset from './modules/preset';
import bookmark from './modules/bookmark';
import structure from './modules/structure';
import attendance from './modules/attendance';
import stranger from './modules/stranger';
import summaryReport from './modules/summaryReport';
import zone from './modules/zone';
import websocket from './modules/websocket';
import reception from './modules/reception';
import receptionhcc from './modules/receptionhcc';
import countPeople from './modules/countPeople';
import vehicleCount from './modules/vehicleCount';
import holiday from './modules/holiday';
import configuration from './modules/configuration';
import hospitalBed from './modules/hospitalBed';
import plateProfile from './modules/plateProfile';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    modules: {
        config,
        page,
        auth,
        event,
        camera,
        monitorReport,
        monitor,
        user,
        server,
        action,
        group,
        analyzeCase,
        video,
        caseVideo,
        vms,
        vmsMonitor,
        vmsVideo,
        report,
        videoObject,
        profile,
        preset,
        bookmark,
        structure,
        attendance,
        summaryReport,
        stranger,
        websocket,
        zone,
        reception,
        receptionhcc,
        countPeople,
        vehicleCount,
        holiday,
        configuration,
        hospitalBed,
        plateProfile
    },
    strict: debug
});
