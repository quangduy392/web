<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item class="text-nowrap" active>
                        {{ $t('welcome.commonTitle') }}
                    </b-nav-item>
                </b-navbar-nav>
            </template>
            <template slot="sub-header-middle"></template>
        </sub-header>

        <div class="page-content sub-header-page-content">
            <div class="d-flex h-100">
                <div class="h-100 pr-0 overflow-y-auto flex-1 p-3">
                    <div v-if="selectedCameras.length" class="h-100 d-flex flex-column">
                        <b-row>
                            <b-col
                                v-for="(camera, index) in selectedCameras"
                                :key="camera.id"
                                :class="{ 'pr-0 mr-3': index === 0, 'pl-0': index === 1 }"
                            >
                                <div class="ratio-16-9 position-relative border border-gray-500">
                                    <div
                                        class="obsolute-full overflow-hidden d-flex justify-content-center"
                                        v-if="camera.liveUrl"
                                    >
                                        <b-img :src="camera.liveUrl" class="w-100"></b-img>

                                        <span
                                            v-show="messages.length > 0"
                                            style="position: absolute; top: 30px; max-width: 1060px; border-radius: 10px;"
                                            class="event-text-color"
                                        >
                                            <div
                                                class="text-center"
                                                style="font-weight: 600"
                                                :style="
                                                    messages.length > 1
                                                        ? 'font-size: 2rem'
                                                        : 'font-size: 2.5rem;'
                                                "
                                                v-for="(message, index) in messages"
                                                :key="index"
                                            >
                                                <span
                                                    style="padding-left: 10px"
                                                    v-if="index === 0"
                                                    >{{ $t('welcome.welcomeTxt') }}</span
                                                >
                                                <span style="padding: 0 10px">
                                                    {{ message.welcome }}
                                                </span>
                                            </div>
                                        </span>

                                        <span
                                            style="position: absolute; bottom: 10px; left: 0px; width: 100%"
                                        >
                                            <attendance-newest-face-list
                                                :events="events"
                                            ></attendance-newest-face-list>
                                        </span>
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
                    </div>

                    <div
                        v-if="!selectedCameras.length"
                        class="h-100 d-flex flex-column justify-content-center align-items-center text-center"
                    >
                        <h4>{{ $i18n.t('attendanceCamera.noSelectedVideo') }}</h4>
                        {{ $i18n.t('attendanceCamera.pleaseSelectVideo') }}
                    </div>
                </div>
                <div class="att-face_sidebar h-100">
                    <attendance-welcome-sidebar
                        @doFilter="updateSelectedCameraList"
                    ></attendance-welcome-sidebar>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import CONSTANTS from '@/constants';
import API_CONFIG from '@/api-config';
import AttendanceWelcomeSidebar from '@/components/AttendanceWelcomeSidebar';
import AttendanceNewestFaceList from '@/components/AttendanceNewestFaceList';

export default {
    components: {
        AttendanceWelcomeSidebar,
        AttendanceNewestFaceList
    },
    mounted: function() {
        this.$nextTick(function() {
            this.resetAttendanceData();
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
            if (
                this.message.type === 'face' &&
                this.message.profileId &&
                this.selectedCameras.length > 0 &&
                this.message.cameraId === this.selectedCameras[0].id
            ) {
                this.events = this.events.filter(item => item.profileId !== this.message.profileId);
                this.events.unshift(this.message);
                this.events = this.events.slice(0, CONSTANTS.MAX_ATTENDANCE_FACE);
                this.fetchMessageList();
            }
        }
    },
    data() {
        return {
            BASE_URL: API_CONFIG.BASE_URL,
            isShowLoading: true,
            selectedCameras: [],
            events: [],
            fetchDataInterval: null,
            messages: []
        };
    },
    methods: {
        ...mapActions({
            getNewestEventList: 'event/getNewestEventNoCommit',
            resetAttendanceData: 'attendance/resetData',
            getAttendanceGreeting: 'attendance/getAttendanceGreeting'
        }),
        async updateSelectedCameraList({ selectedCameras }) {
            this.selectedCameras = selectedCameras;
            await this.reloadData();
        },
        async reloadData() {
            if (this.fetchDataInterval) {
                clearInterval(this.fetchDataInterval);
            }
            this.fetchDataInterval = setInterval(() => {
                this.fetchEventList();
                this.fetchMessageList();
            }, CONSTANTS.ATTENDANCE_FACE_INTERVAL);
            this.isShowLoading = true;
            await this.fetchEventList();
            await this.fetchMessageList();
            this.isShowLoading = false;
        },
        async fetchEventList() {
            const response = await Promise.all(
                this.selectedCameras.map(camera => {
                    if (camera.id) {
                        return this.getNewestEventList({
                            count: CONSTANTS.MAX_ATTENDANCE_FACE,
                            type: 'face',
                            cameraId: camera.id
                        });
                    } else {
                        return [];
                    }
                })
            );
            const allEvents = _.sortBy(_.flatten(response), 'createdAt', 'asc').reverse();
            this.events = _.uniqBy(allEvents, 'profileId').slice(0, CONSTANTS.MAX_ATTENDANCE_FACE);
            this.events = this.events.filter(item => {
                const checkEvent =
                    this.$moment(new Date()).valueOf() - this.$moment(item.createdAt).valueOf();
                if (checkEvent <= CONSTANTS.EVENT_MAX_TIME_DISPLAY) {
                    return item;
                }
            });
        },
        async fetchMessageList() {
            this.selectedCameras.map(camera => {
                if (camera.id) {
                    return this.getAttendanceGreeting({
                        cameraId: camera.id
                    }).then(response => {
                        this.messages = response.slice(0, 2);
                    });
                } else {
                    return [];
                }
            });
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
