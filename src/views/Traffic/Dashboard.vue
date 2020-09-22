<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item class="text-nowrap" active>{{
                        $t('trafficMonitor.commonTitle')
                    }}</b-nav-item>
                </b-navbar-nav>
            </template>
            <template slot="sub-header-middle"></template>
        </sub-header>

        <div class="page-content sub-header-page-content">
            <div class="d-flex h-100">
                <div class="h-100 pr-0 overflow-y-auto flex-1 px-1 py-2">
                    <div v-if="selectedCameras.length" class="mih-100 d-flex flex-column">
                        <b-row class="mx-0">
                            <b-col
                                v-for="(camera, index) in selectedCameras"
                                :key="camera.id"
                                class="px-1 mb-2"
                                :cols="4"
                            >
                                <div class="ratio-16-9 position-relative border border-gray-500">
                                    <div
                                        class="obsolute-full overflow-hidden"
                                        v-if="camera.liveUrl"
                                    >
                                        <b-img :src="camera.liveUrl" class="w-100"></b-img>

                                        <i
                                            @click="() => openVideoModal(camera.liveUrl)"
                                            class="icon-size-fullscreen icons font-2xl"
                                            style="position: absolute; bottom: 10px; right: 10px; font-weight: bold; cursor: pointer;"
                                        ></i>
                                    </div>

                                    <div
                                        v-if="!camera.liveUrl"
                                        class="obsolute-full d-flex justify-content-center align-items-center text-muted"
                                    >
                                        {{ $i18n.t('attendanceCamera.noVideo') }}
                                    </div>

                                    <div
                                        v-if="camera.name"
                                        class="position-absolute"
                                        style="top: 0; right: 0; background: rgba(0, 0, 0, 0.6); padding: 6px 10px;"
                                    >
                                        {{ camera.name }}
                                    </div>
                                </div>
                            </b-col>
                        </b-row>

                        <b-row class="mx-0 mb-2" v-if="events.length">
                            <b-col
                                cols="2"
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
                                        <router-link to="/alert/event">
                                            {{ $i18n.t('attendanceCamera.seeMore') }}
                                            <i
                                                class="fa fa-arrow-circle-right"
                                                aria-hidden="true"
                                            ></i>
                                        </router-link>
                                    </div>
                                    <div class="flex-1">
                                        <!-- <div
                                            class="mb-2 font-16 text-warning"
                                        >Đông xe ở ngã tư Hàng Bài</div>
                                        <div class="mb-2 font-16 text-danger">Ùn tắc ở đường Tố Hữu</div>
                                        <div class="mb-2 font-16 text-danger">Ùn tắc ở đường Xã Đàn</div>-->
                                    </div>
                                </div>
                            </b-col>

                            <b-col class="px-1">
                                <div class="h-100 border border-gray-500 p-2 d-flex flex-column">
                                    <div class="d-flex mb-2 pb-2 border-bottom border-gray-500">
                                        <h5 class="text-uppercase flex-1 mb-0">
                                            {{ $t('common.listFollow') }}
                                        </h5>
                                        <router-link to="/attendance/stranger">
                                            {{ $i18n.t('attendanceCamera.seeMore') }}
                                            <i
                                                class="fa fa-arrow-circle-right"
                                                aria-hidden="true"
                                            ></i>
                                        </router-link>
                                    </div>
                                    <div class="d-flex flex-1" v-if="events.length">
                                        <!-- <div
                                            cols="2"
                                            v-for="item in [4, 5, 6, 7, 8, 9]"
                                            class="traffic-object flex-grow-1 mx-1 text-center d-flex justify-content-center"
                                            :style="
                                                `background-image:url(https://api.smartcam.vn/api/video-image/99/${item}-0.jpg);`
                                            "
                                        >
                                            <span style="position: absolute; bottom: 0">
                                                {{
                                                $moment().format('YYYY/MM/DD')
                                                }}
                                            </span>
                                        </div>-->
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
                <div class="att-cam_sidebar att-alert_sidebar h-100">
                    <TrafficSidebar
                        @doFilter="updateSelectedCameraList"
                        :eventCountLevel="eventCountLevel"
                    ></TrafficSidebar>
                </div>
            </div>
        </div>

        <!-- video modal -->
        <b-modal
            ref="videoModal"
            hide-header
            hide-footer
            size="xl"
            centered
            body-class="border border-gray-500 p-0"
        >
            <div class="ratio-16-9 position-relative">
                <div
                    class="obsolute-full d-flex flex-column justify-content-center align-items-center"
                >
                    <img src="/static/img/loader-green.gif" class="standalone-loading" />
                </div>
                <div class="obsolute-full overflow-hidden">
                    <b-img :src="modalVideoUrl" class="w-100"></b-img>
                </div>
            </div>
        </b-modal>

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
import AttendanceSubNavbarNav from '../Attendance/SubNavbarNav';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import CONSTANTS from '@/constants';
import getAlertEventImageUrl from '@/utils/getAlertEventImageUrl';
import API_CONFIG from '@/api-config';
import TrafficSidebar from '@/components/TrafficSidebar';
import EventItem from '@/components/EventItem.vue';
import StrangerItem from '@/components/StrangerItem.vue';
import CaseObject from '@/components/CaseObject';

export default {
    components: {
        AttendanceSubNavbarNav,
        TrafficSidebar,
        EventItem,
        StrangerItem,
        CaseObject
    },
    mounted: function() {
        this.$nextTick(function() {
            this.resetAttendanceData();
            this.getEventTypeList();
            this.getEventCountLevel();
            if (this.fetchEventCountInterval) {
                clearInterval(this.fetchEventCountInterval);
            }
            this.fetchEventCountInterval = setInterval(() => {
                this.getEventCountLevel();
            }, 5000);
        });
    },
    computed: {
        ...mapState({
            cameras: state => state.camera.items,
            attendanceStatus: state => state.attendance.attendanceStatus,
            eventCountLevel: state => state.event.eventCountLevel,
            message: state => state.websocket.message
        })
    },
    watch: {
        message() {
            if (
                this.message.view === 'traffic' &&
                this.selectedCameras.find(el => el.id === this.message.cameraId)
            ) {
                this.events.unshift(this.message);
                this.events = this.events.slice(0, CONSTANTS.MAX_TRAFFIC_EVENT);
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
            fetchEventCountInterval: null,
            selectedEvent: {},
            eventVideoSrc: '',
            modalVideoUrl: null
        };
    },
    methods: {
        ...mapActions({
            getNewestEventList: 'event/getNewestEventNoCommit',
            resetAttendanceData: 'attendance/resetData',
            getAttendanceStatus: 'attendance/getAttendanceStatus',
            getEventTypeList: 'event/getEventTypes',
            getNewestStrangerListReplace: 'stranger/getNewestStrangerListReplace',
            getEventCountLevel: 'event/getEventCountLevel'
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
                // this.getAttendanceStatus();
                // this.fetchStangerList();
            }, CONSTANTS.ATTENDANCE_EVENT_INTERVAL);
            this.isShowLoading = true;
            await this.fetchEventList();
            this.isShowLoading = false;
        },
        async fetchEventList() {
            const response = await Promise.all(
                this.selectedCameras.map(camera => {
                    if (camera.id) {
                        return this.getNewestEventList({
                            count: CONSTANTS.MAX_TRAFFIC_EVENT,
                            cameraId: camera.id
                        });
                    } else {
                        return [];
                    }
                })
            );
            this.events = _.sortBy(_.flatten(response), 'createdAt', 'asc')
                .reverse()
                .slice(0, CONSTANTS.MAX_TRAFFIC_EVENT);
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
            this.strangers = _.sortBy(_.flatten(response), 'createdAt', 'asc')
                .reverse()
                .slice(0, CONSTANTS.MAX_ATTENDANCE_STRANGER);
        },
        getCameraName(id) {
            const camera = this.cameras.find(el => el.id === id);
            if (camera) return camera.name;
        },
        changeEventVideo(event) {
            this.selectedEvent = event;
            this.eventVideoSrc = `${this.BASE_URL}event-image/${event.id}/video.mp4`;
            this.novideo = `${API_CONFIG.BASE_URL}event-image/${event.id}/snapshot.jpg`;
        },
        openVideoModal(modalVideoUrl) {
            this.modalVideoUrl = modalVideoUrl;
            this.$refs.videoModal.show();
        }
    },
    beforeDestroy() {
        if (this.fetchDataInterval) {
            clearInterval(this.fetchDataInterval);
        }
        if (this.fetchEventCountInterval) {
            clearInterval(this.fetchEventCountInterval);
        }
    }
};
</script>

<style lang="scss" scoped>
.event-text-color {
    color: lime;
    background-color: rgba(0, 0, 0, 0.6);
}
.traffic-object {
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    position: relative;
    min-width: 55px;
    max-width: 20%;
}
</style>
