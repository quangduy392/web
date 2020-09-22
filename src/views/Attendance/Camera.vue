<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <AttendanceSubNavbarNav></AttendanceSubNavbarNav>
            </template>
            <template slot="sub-header-middle"></template>
        </sub-header>

        <div class="page-content sub-header-page-content">
            <div class="d-flex h-100">
                <div class="h-100 pr-0 overflow-y-auto flex-1 px-1 py-2">
                    <div v-if="selectedCameras.length" class="mih-100 d-flex flex-column">
                        <b-row class="mb-2 mx-0">
                            <b-col
                                v-for="(camera, index) in selectedCameras"
                                :key="camera.id"
                                class="px-1"
                            >
                                <cam-live-view :camera="camera"></cam-live-view>
                            </b-col>
                        </b-row>

                        <b-row class="mb-2 mx-0" v-if="events.length">
                            <b-col
                                cols="3"
                                v-for="(event, index) in events"
                                :key="event.id"
                                class="px-1"
                            >
                                <!-- Event list -->
                                <EventItem
                                    :event="event"
                                    hideTools
                                    @changeVideo="changeEventVideo"
                                />
                            </b-col>
                        </b-row>

                        <b-row class="flex-grow-1 mx-0">
                            <b-col class="px-1">
                                <div class="h-100 border border-gray-500 p-2 d-flex flex-column">
                                    <div class="d-flex mb-2 pb-2 border-bottom border-gray-500">
                                        <h5 class="text-uppercase flex-1 mb-0">
                                            {{ $i18n.t('attendanceCamera.attendanceStatus') }}
                                        </h5>
                                        <router-link to="/attendance/alert/newest">
                                            {{ $i18n.t('attendanceCamera.seeMore') }}
                                            <i
                                                class="fa fa-arrow-circle-right"
                                                aria-hidden="true"
                                            ></i>
                                        </router-link>
                                    </div>
                                    <div class="flex-1">
                                        <div
                                            v-for="(statusItem, index) in attendanceStatus"
                                            :key="index"
                                            class="mb-3 font-16"
                                            :class="{
                                                'text-success': index === 1,
                                                'text-warning': index === 2
                                            }"
                                        >
                                            {{ statusItem }}
                                        </div>
                                    </div>
                                </div>
                            </b-col>

                            <b-col class="px-1">
                                <div class="h-100 border border-gray-500 p-2 d-flex flex-column">
                                    <div class="d-flex mb-2 pb-2 border-bottom border-gray-500">
                                        <h5 class="text-uppercase flex-1 mb-0">
                                            {{ $i18n.t('attendanceCamera.recentStranger') }}
                                        </h5>
                                        <router-link to="/attendance/manage/stranger">
                                            {{ $i18n.t('attendanceCamera.seeMore') }}
                                            <i
                                                class="fa fa-arrow-circle-right"
                                                aria-hidden="true"
                                            ></i>
                                        </router-link>
                                    </div>
                                    <div class="flex-1 d-flex flex-column">
                                        <b-row v-if="strangers.length">
                                            <b-col
                                                cols="2"
                                                v-for="(stranger, index) in strangers"
                                                :key="index"
                                            >
                                                <StrangerItem :data="stranger" hideTools />
                                            </b-col>
                                        </b-row>
                                    </div>
                                </div>
                            </b-col>
                        </b-row>
                    </div>

                    <div
                        v-if="!selectedCameras.length"
                        class="h-100 d-flex flex-column justify-content-center align-items-center text-center"
                    >
                        <h4>{{ $i18n.t('attendanceCamera.noSelectedVideo') }}</h4>
                        {{ $i18n.t('attendanceCamera.pleaseSelectVideo') }}
                    </div>
                </div>
                <div class="att-cam_sidebar h-100">
                    <attendance-camera-sidebar
                        @doFilter="updateSelectedCameraList"
                    ></attendance-camera-sidebar>
                </div>
            </div>
        </div>

        <!-- Event detail modal -->
        <b-modal
            id="modal-video"
            hide-footer
            hide-header
            centered
            size="lg"
            body-class="p-0 d-flex justify-content-center align-items-center video-modal-border"
        >
            <video controls autoplay width="100%" height="auto" :poster="novideo">
                <source :src="eventVideoSrc" type="video/mp4" />
            </video>
            <div style="position: absolute; top: 9px; left:15px;" class="event-text-color">
                <div>{{ getCameraName(selectedEvent.cameraId) }}</div>
                <div>{{ selectedEvent.createdAt | formatDateTime }}</div>
            </div>
            <span
                style="position: absolute; top: 3px; max-width: 46%"
                class="event-text-color text-center"
                >{{ selectedEvent.text }}</span
            >
            <span style="position: absolute; top: 2px; right:5px; z-index: 1">
                <i
                    @click="$bvModal.hide('modal-video')"
                    class="fa fa-lg fa-times cursor-pointer"
                ></i>
            </span>
            <img
                style="position: absolute; top:20px; right: 20px;"
                class="border border-dark"
                height="30%"
                v-if="selectedEvent.image"
                :src="BASE_URL + selectedEvent.image.replace(/\/api/g, '')"
            />
        </b-modal>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import AttendanceSubNavbarNav from './SubNavbarNav';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import CONSTANTS from '@/constants';
import getAlertEventImageUrl from '@/utils/getAlertEventImageUrl';
import API_CONFIG from '@/api-config';
import AttendanceCameraSidebar from '@/components/AttendanceCameraSidebar';
import EventItem from '@/components/EventItem.vue';
import StrangerItem from '@/components/StrangerItem.vue';
import CamLiveView from '@/components/CamLiveView';

export default {
    components: {
        AttendanceSubNavbarNav,
        AttendanceCameraSidebar,
        EventItem,
        StrangerItem,
        CamLiveView
    },
    mounted: function() {
        this.$nextTick(function() {
            this.resetAttendanceData();
            this.getEventTypeList();
        });
    },
    computed: {
        ...mapState({
            cameras: state => state.camera.items,
            attendanceStatus: state => state.attendance.attendanceStatus,
            message: state => state.websocket.message
        })
    },
    watch: {
        message() {
            if (this.message.type === 'face') {
                const foundIndex = this.selectedCameras.findIndex(
                    selectedCamera => selectedCamera.id === this.message.cameraId
                );
                if (foundIndex > -1) {
                    this.fetchEventList();
                    this.getAttendanceStatus();
                    this.fetchStangerList();
                }
            }
        }
    },
    data() {
        return {
            BASE_URL: API_CONFIG.BASE_URL,
            isShowLoading: true,
            selectedCameras: [],
            events: [],
            novideo: '',
            strangers: [],
            fetchDataInterval: null,
            selectedEvent: {},
            eventVideoSrc: ''
        };
    },
    methods: {
        ...mapActions({
            getNewestEventList: 'event/getNewestEventNoCommit',
            resetAttendanceData: 'attendance/resetData',
            getAttendanceStatus: 'attendance/getAttendanceStatus',
            getEventTypeList: 'event/getEventTypes',
            getNewestStrangerListReplace: 'stranger/getNewestStrangerListReplace'
        }),
        getAlertEventImageUrl,
        async updateSelectedCameraList({ selectedCameras }) {
            this.selectedCameras = selectedCameras;
            await this.reloadData();
        },
        async reloadData() {
            if (this.fetchDataInterval) {
                clearInterval(this.fetchDataInterval);
            }
            this.fetchDataInterval = setInterval(async () => {
                this.fetchEventList();
                this.getAttendanceStatus();
                this.fetchStangerList();
            }, CONSTANTS.ATTENDANCE_EVENT_INTERVAL);

            this.isShowLoading = true;
            await this.fetchEventList();
            await this.getAttendanceStatus();
            await this.fetchStangerList();
            this.isShowLoading = false;
        },
        async fetchEventList() {
            const response = await Promise.all(
                this.selectedCameras.map(camera => {
                    if (camera.id) {
                        return this.getNewestEventList({
                            count: CONSTANTS.MAX_ATTENDANCE_EVENT,
                            type: 'face',
                            cameraId: camera.id
                        });
                    } else {
                        return [];
                    }
                })
            );
            this.events = _.sortBy(_.flatten(response), 'createdAt', 'asc')
                .reverse()
                .slice(0, CONSTANTS.MAX_ATTENDANCE_EVENT);
        },
        async fetchStangerList() {
            const response = await Promise.all(
                this.selectedCameras.map(camera => {
                    if (camera.id) {
                        return this.getNewestStrangerListReplace({
                            count: CONSTANTS.MAX_ATTENDANCE_STRANGER,
                            cameraId: camera.id
                        });
                    } else {
                        return [];
                    }
                })
            );
            this.strangers = _.flatten(response).slice(0, CONSTANTS.MAX_ATTENDANCE_STRANGER);
        },
        getCameraName(id) {
            const camera = this.cameras.find(el => el.id === id);
            if (camera) return camera.name;
        },
        changeEventVideo(event) {
            this.selectedEvent = event;
            this.eventVideoSrc = `${this.BASE_URL}event-image/${event.id}/video.mp4`;
            this.novideo = `${API_CONFIG.BASE_URL}event-image/${event.id}/snapshot.jpg`;
        }
    },
    beforeDestroy() {
        if (this.fetchDataInterval) {
            clearInterval(this.fetchDataInterval);
        }
    }
};
</script>

<style lang="scss" scoped>
.event-text-color {
    color: lime;
    background-color: rgba(0, 0, 0, 0.6);
}
</style>
