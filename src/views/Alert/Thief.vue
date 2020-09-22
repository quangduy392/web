<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item class="text-nowrap" active>{{
                        $t('alert.commonTitle')
                    }}</b-nav-item>
                </b-navbar-nav>
            </template>
            <template slot="sub-header-middle"></template>
            <template slot="sub-header-right">
                <b-form-select
                    :options="typeOptions"
                    v-model="typeSelected"
                    v-if="!isBrushing"
                    class="floorplan-select form-control bg-transparent text-primary mr-1 border-primary"
                    @change="onChangeFunction"
                ></b-form-select>
                <b-button class="mr-1" variant="danger" @click="deleteLastObject" v-if="isBrushing">
                    <i class="fa fa-trash mr-2"></i>
                    <span>
                        {{ drawing ? $t('draw.deleteLastPoint') : $t('draw.deleteLastRegion') }}
                    </span>
                </b-button>
                <b-button
                    class="mr-1"
                    variant="danger"
                    v-b-modal.delete-region-modal
                    v-if="isBrushing"
                >
                    <i class="fa fa-trash mr-2"></i>
                    <span>{{ $t('draw.deleteAllAreas') }}</span>
                </b-button>
                <b-button
                    variant="outline-primary"
                    class="mr-1"
                    v-if="!isBrushing"
                    @click="startBrushing"
                >
                    <i class="fa fa-paint-brush"></i>
                    <span class="text-uppercase">Khoanh vùng</span>
                </b-button>
                <b-button variant="outline-primary" @click="stopBrushing" v-if="isBrushing">
                    <span class="text-uppercase">{{ $t('common.cancel') }}</span>
                </b-button>
            </template>
        </sub-header>

        <div class="page-content sub-header-page-content">
            <div class="d-flex h-100" ref="container">
                <div class="h-100 pr-0 overflow-y-auto flex-1 p-2 position-relative">
                    <b-img
                        ref="videoThumbnail"
                        class="w-100 h-100"
                        :src="getBackgroundImageUrl()"
                    ></b-img>
                    <v-stage
                        ref="stage"
                        class="obsolute-full"
                        :class="isBrushing ? 'area-drawing-stage' : ''"
                        @click="onStageClick"
                        @mousemove="mouseMove"
                        :config="stageConfig"
                        v-if="stageConfig"
                    >
                        <v-layer>
                            <!-- Grid -->
                            <v-line
                                v-for="g in grid.x"
                                v-if="isBrushing"
                                :config="{
                                    points: g,
                                    stroke: 'black',
                                    strokeWidth: 0.7,
                                    opacity: 0.3
                                }"
                            />
                            <v-line
                                v-for="g in grid.y"
                                v-if="isBrushing"
                                :config="{
                                    points: g,
                                    stroke: 'black',
                                    strokeWidth: 0.7,
                                    opacity: 0.3
                                }"
                            />
                            <!-- End grid -->

                            <v-line
                                v-for="(area, index) in areas"
                                :key="`area-${index}`"
                                :config="{
                                    points: getAreaPathPoints(area.points),
                                    closed: true,
                                    stroke: 'black',
                                    opacity: 0.5,
                                    lineJoin: 'round',
                                    fill: 'red'
                                }"
                            />
                            <v-text
                                v-for="(area, index) in areas"
                                :key="`area-title-${index}`"
                                :config="getAreaTitleConfig(area)"
                            />

                            <v-image
                                v-if="!isBrushing"
                                v-for="(area, index) in areas"
                                :config="getImageConfig(area)"
                            />

                            <!-- Drawing area -->
                            <v-line
                                :config="{
                                    points: getAreaPathPoints(this.areaPoints),
                                    closed: false,
                                    stroke: 'black',
                                    opacity: 0.5,
                                    lineJoin: 'round',
                                    fill: 'green'
                                }"
                            />
                            <v-circle
                                v-for="(point, pIndex) in areaPoints"
                                :key="'p' + pIndex"
                                :config="{
                                    ...point,
                                    radius: pIndex === hovingPoint ? 10 : 5,
                                    fill: 'orange',
                                    strokeWidth: 4
                                }"
                            />
                        </v-layer>
                    </v-stage>
                </div>
                <div class="att-face_sidebar h-100" style="width: 150px;">
                    <AlertThiefSidebar
                        :eventNewest="eventNewest"
                        :zones="rawZones"
                        @zoneSelectedChange="zoneSelectedChange"
                    />
                </div>
            </div>
        </div>
        <!-- Delete all region modal -->
        <b-modal
            centered
            id="delete-region-modal"
            :title="$t('common.confirmation')"
            no-close-on-esc
            no-close-on-backdrop
            :ok-title="$t('common.delete')"
            :cancel-title="$t('common.cancel')"
            ok-variant="danger"
            @ok="deleteAllRegions"
            >{{ $t('draw.confirmDelete') }}</b-modal
        >

        <!-- Select zone -->
        <b-modal
            centered
            id="update-camera-zone-modal"
            title="Chọn vùng"
            no-close-on-esc
            no-close-on-backdrop
            :ok-title="$t('common.update')"
            :cancel-title="$t('common.cancel')"
            @ok="updateZoneRegions"
        >
            <form @submit.prevent="submitUpdateZoneRegions">
                <b-form-select
                    :options="zones"
                    style="padding-top: unset; padding-bottom: unset;"
                    v-model="zoneSelected"
                    text-field="name"
                    v-validate="'required'"
                    name="type"
                    data-vv-as="Vùng"
                    value-field="id"
                ></b-form-select>
                <div v-show="errors.has('type')" class="validation-message text-danger">
                    {{ errors.first('type') }}
                </div>
            </form>
        </b-modal>
        <!-- video modal -->
        <b-modal
            id="modal-video"
            hide-footer
            hide-header
            centered
            size="xl"
            body-class="p-0 d-flex justify-content-center align-items-center video-modal-border"
        >
            <video controls autoplay width="100%" height="auto" :poster="novideo">
                <source :src="videoSrc" type="video/mp4" />
            </video>
            <div
                style="position: absolute; top: 9px; left:15px;"
                class="event-text-color"
                v-if="selectedEvent"
            >
                <div>{{ getCameraName(selectedEvent.cameraId) }}</div>
                <div>{{ selectedEvent.createdAt | formatDateTime }}</div>
            </div>
            <span style="position: absolute; top: 2px; right:5px; z-index: 1">
                <i
                    @click="$bvModal.hide('modal-video')"
                    class="fa fa-lg fa-times cursor-pointer"
                ></i>
            </span>
        </b-modal>
        <!-- camera modal -->
        <b-modal
            id="modal-camera"
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
                    <b-img :src="selectedCamera.liveUrl" class="w-100"></b-img>
                </div>
                <div style="position: absolute; top: 9px; left:15px;" class="event-text-color">
                    <div>{{ selectedCamera.name }}</div>
                </div>
                <span style="position: absolute; top: 2px; right:5px; z-index: 1">
                    <i
                        @click="$bvModal.hide('modal-camera')"
                        class="fa fa-lg fa-times cursor-pointer"
                    ></i>
                </span>
            </div>
        </b-modal>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import _ from 'lodash';
import CONSTANTS from '@/constants';
import moment from 'moment-timezone';
import API_CONFIG from '@/api-config';
const inside = require('point-in-polygon');
import AlertThiefSidebar from '@/components/AlertThiefSidebar';

export default {
    components: { AlertThiefSidebar },
    mounted: function() {
        this.$nextTick(async function() {
            this.getListZones();
            this.reloadData();

            this.filterNewestEventInterval = setInterval(() => {
                this.eventNewest = this.eventNewest.filter(item =>
                    this.isNewestEvent(item.createdAt)
                );

                const newlistCamIdAlert = _.keys(_.keyBy(this.eventNewest, 'cameraId'));
                if (!_.isEqual(this.listCamIdAlert, newlistCamIdAlert)) {
                    this.listCamIdAlert = newlistCamIdAlert;
                }
            }, 5000);
            await this.getCameraList();

            setTimeout(() => {
                this.generateGrid();
            }, 1000);
        });
    },
    computed: {
        drawing() {
            return this.item.points.length > 0;
        },
        ...mapState({
            rawZones: state => state.zone.items,
            message: state => state.websocket.message,
            cameras: state => state.camera.items,
            currentUser: state => state.auth.currentUser
        })
    },
    data() {
        return {
            BASE_URL: API_CONFIG.BASE_URL,
            videoSrc: '',
            typeOptions: [
                { value: 'thief_MB - Benh Vien K - Tan Trieu-1', text: 'Mặt bằng' },
                { value: 'thief_Nha A - KTNV - T1', text: 'Nhà A - KTNV - T1' }
            ],
            typeSelected: 'thief_MB - Benh Vien K - Tan Trieu-1',
            zones: [],
            novideo: '',
            isBrushing: false,
            item: {
                points: []
            },
            hovingPoint: null,
            stageConfig: null,
            zoneSelected: null,
            cameraSelected: null,
            areaPoints: [], // Drawing area points
            areas: [],
            areasChecking: [],
            backgroundImageDimensions: null,
            regions: [],
            filterNewestEventInterval: null,
            fetchDataInterval: null,
            flipInterval: null,
            maxEventId: 0,
            eventNewest: [],
            listCamIdAlert: [],
            listZoneIdAlert: [],
            mapZoneCamera: {},
            selectedEvent: null,
            curMousePos: null,
            camerasPos: [],
            selectedCamera: {},
            grid: { x: [], y: [] },
            blockSnapSize: 45,
            mapZoneThief: {}
        };
    },
    methods: {
        ...mapActions({
            getCameraList: 'camera/getList',
            getListZones: 'zone/getListZones',
            getListZoneCamera: 'zone/getListZoneCamera',
            updateZone: 'zone/updateZone',
            getNewestEventList: 'event/getNewestEventNoCommit',
            updateOrCreate: 'camera/updateOrCreate',
            saveSelectedFloorPlan: 'auth/saveSelectedFloorPlan'
        }),
        convertAreaRatio(areas, widthRatio, heightRatio) {
            const resultAreas = [];
            let resultPoints = [];

            areas.forEach(area => {
                resultPoints = [];
                resultPoints = area.points.map(point => ({
                    x: point[0] * widthRatio,
                    y: point[1] * heightRatio
                }));
                resultAreas.push({
                    ...area,
                    points: resultPoints
                });
            });
            return resultAreas;
        },
        getBackgroundImageUrl() {
            return `/static/img/hospital/${this.typeSelected.replace('thief_', '')}.png`;
        },
        getAreaPathPoints(areaPoints) {
            const tmpPoints = _.cloneDeep(areaPoints);
            const points = tmpPoints; // getAreaPoints(tmpPoints);
            const areaPathPoints = [];
            points.forEach(point => {
                areaPathPoints.push(point.x);
                areaPathPoints.push(point.y);
            });
            return areaPathPoints;
        },
        getAreaTitleConfig(area) {
            let areaXSum = 0;
            let areaYSum = 0;
            area.points.forEach(point => {
                areaXSum += point.x;
                areaYSum += point.y;
            });
            return {
                text: area.title,
                width: 100,
                height: 30,
                fill: 'white',
                align: 'center',
                x: areaXSum / area.points.length - 50,
                y: areaYSum / area.points.length - 15
            };
        },
        getImageConfig(area) {
            let areaXSum = 0;
            let areaYSum = 0;
            area.points.forEach(point => {
                areaXSum += point.x;
                areaYSum += point.y;
            });
            return {
                image: this.mapZoneThief[area.id] ? this.mapZoneThief[area.id].image : undefined,
                width: 50,
                height: 65,
                x: areaXSum / area.points.length - 25,
                y: areaYSum / area.points.length - 85
            };
        },
        onStageClick(event) {
            if (!this.isBrushing) {
                this.openVideoDialog();
            } else {
                const mousePos = this.$refs.stage.getStage().getPointerPosition();
                if (
                    this.areaPoints.length >= 3 &&
                    this.calcDistance(mousePos, this.areaPoints[0]) < 100
                ) {
                    this.finshDrawingArea();
                } else {
                    this.item.points.push([mousePos.x, mousePos.y]);
                    this.areaPoints.push(mousePos);
                }
            }
        },
        mouseMove() {
            const mousePos = this.$refs.stage.getStage().getPointerPosition();
            if (this.areaPoints.length) {
                if (this.calcDistance(mousePos, this.areaPoints[0]) < 100) {
                    this.hovingPoint = 0;
                } else {
                    this.hovingPoint = null;
                }
            }
        },
        finshDrawingArea() {
            // Reset form
            this.areaPathName = '';
            this.$bvModal.show('update-camera-zone-modal');
        },
        calcDistance(point1, point2) {
            return (
                (point1.x - point2.x) * (point1.x - point2.x) +
                (point1.y - point2.y) * (point1.y - point2.y)
            );
        },
        deleteLastObject() {
            if (this.drawing) {
                this.item.points.pop();
                this.areaPoints.pop();
            } else {
                const temp = this.areas.pop();
                const lastRegion = [];
                const wRatio = this.backgroundImageDimensions.width / this.stageConfig.width;
                const hRatio = this.backgroundImageDimensions.height / this.stageConfig.height;
                temp.points.forEach(item => {
                    lastRegion.push([Math.round(item.x * wRatio), Math.round(item.y * hRatio)]);
                });
                for (const zone of this.zones) {
                    if (!zone.regions || zone.regions.length === 0) continue;
                    if (zone.regions.find(item => _.isEqual(item, lastRegion))) {
                        const curZone = _.cloneDeep(zone);
                        curZone.regions = zone.regions.filter(item => !_.isEqual(item, lastRegion));
                        this.updateZone(curZone);
                        break;
                    }
                }
                this.$toaster.success('Đã xoá vùng cuối thành công');
            }
        },
        async deleteAllRegions() {
            for (const zone of this.zones) {
                if (!zone.regions || zone.regions.length === 0) continue;
                const curZone = _.cloneDeep(zone);
                curZone.regions = [];
                await this.updateZone(curZone);
            }
            this.stopBrushing();
            this.$toaster.success('Đã xoá tất cả các vùng thành công');
        },
        updateZoneRegions(modal) {
            modal.preventDefault();
            this.submitUpdateZoneRegions();
        },
        submitUpdateZoneRegions() {
            this.$validator.validateAll().then(result => {
                if (result) {
                    const curZone = _.cloneDeep(
                        this.zones.filter(item => item.id === this.zoneSelected)[0]
                    );
                    curZone.site = this.typeSelected;
                    if (!curZone.regions) curZone.regions = [];
                    const newArea = [];
                    const wRatio = this.backgroundImageDimensions.width / this.stageConfig.width;
                    const hRatio = this.backgroundImageDimensions.height / this.stageConfig.height;
                    this.areaPoints.forEach(item => {
                        newArea.push([Math.round(item.x * wRatio), Math.round(item.y * hRatio)]);
                    });
                    curZone.regions.push(newArea);
                    this.updateZone(curZone);
                    this.stopBrushing();
                    this.$bvModal.hide('update-camera-zone-modal');
                }
            });
        },
        startBrushing() {
            this.areas = [];
            this.areasChecking = [];
            if (this.flipInterval) clearInterval(this.flipInterval);
            if (this.fetchDataInterval) clearInterval(this.fetchDataInterval);
            this.getListZones();
            this.isBrushing = true;
        },
        stopBrushing() {
            this.isBrushing = false;
            this.areas = [];
            this.areaPoints = [];
            this.item.points = [];
            this.listZoneIdAlert = [];
            this.listCamIdAlert = [];
            this.maxEventId = 0;
            this.reloadData();
        },
        scaleArea() {
            this.stageConfig = {
                width: this.$refs.videoThumbnail.clientWidth,
                height: this.$refs.videoThumbnail.clientHeight
            };
            if (this.isBrushing) {
                this.showAllZone();
            } else this.showAlertZone();
        },
        onWindowSizeChange(e) {
            this.scaleArea();
            this.generateGrid();
        },
        async updateListZoneIdAlert(listCameraId) {
            const listZone = [];
            for (const cameraId of listCameraId) {
                const res = await this.getListZoneCamera({ cameraId: cameraId });
                for (const zone of res) {
                    if (_.find(this.zones, { id: zone.zoneId })) {
                        this.mapZoneCamera[zone.zoneId] = cameraId;
                        listZone.push(zone.zoneId);
                    }
                }
            }
            if (!_.isEqual(listZone, this.listZoneIdAlert)) this.listZoneIdAlert = listZone;
        },
        async fetchData() {
            const events = await this.getNewestEventList({
                count: CONSTANTS.MAX_ALERT_EVENT,
                greaterthan: this.maxEventId,
                type: 'suspect'
            });
            for (const event of events) {
                if (event.id > this.maxEventId) this.maxEventId = event.id;
                if (this.isNewestEvent(event.createdAt)) {
                    this.eventNewest.push(event);
                }
            }
        },
        async onChangeFunction() {
            this.maxEventId = 0;
            this.areas = [];
            this.areasChecking = [];
            this.listZoneIdAlert = [];
            this.listCamIdAlert = [];
            this.getListZones();
            this.reloadData();
            await this.getCameraList();
        },
        reloadData() {
            this.fetchData();
            if (this.fetchDataInterval) clearInterval(this.fetchDataInterval);
            this.fetchDataInterval = setInterval(() => {
                this.fetchData();
            }, CONSTANTS.ATTENDANCE_EVENT_INTERVAL);
        },
        isNewestEvent(time) {
            return (
                moment.duration(moment().diff(moment(time))).asMinutes() <=
                CONSTANTS.ALERT_EVENT_TIME_OUT
            );
        },
        showAlertZone() {
            const widthRatio = this.stageConfig.width / this.backgroundImageDimensions.width;
            const heightRatio = this.stageConfig.height / this.backgroundImageDimensions.height;
            const regions = [];
            for (const zone of this.zones) {
                if (this.listZoneIdAlert.includes(zone.id) && zone.regions) {
                    zone.regions.forEach(region => {
                        regions.push({ points: region, title: zone.name, id: zone.id });
                    });
                }
            }
            this.areas = this.convertAreaRatio(regions, widthRatio, heightRatio);
            this.areasChecking = _.cloneDeep(this.areas);
        },
        showAllZone() {
            const widthRatio = this.stageConfig.width / this.backgroundImageDimensions.width;
            const heightRatio = this.stageConfig.height / this.backgroundImageDimensions.height;
            this.areas = this.convertAreaRatio(this.regions, widthRatio, heightRatio);
        },
        async openVideoDialog() {
            this.selectedEvent = null;
            const mousePos = this.$refs.stage.getStage().getPointerPosition();
            const pointClicked = [mousePos.x, mousePos.y];
            for (const area of this.areasChecking) {
                const points = [];
                for (const point of area.points) {
                    points.push([point.x, point.y]);
                }
                if (inside(pointClicked, points)) {
                    this.selectedEvent = _.find(this.eventNewest, {
                        cameraId: +this.mapZoneCamera[area.id]
                    });
                    break;
                }
            }
            if (!this.selectedEvent) return;
            this.videoSrc = `${API_CONFIG.BASE_URL}event-image/${this.selectedEvent.id}/video.mp4`;
            this.novideo = `${API_CONFIG.BASE_URL}event-image/${event.id}/snapshot.jpg`;
            this.$bvModal.show('modal-video');
        },
        getCameraName(id) {
            const camera = this.cameras.find(el => el.id === id);
            if (camera) return camera.name;
        },
        generateGrid() {
            this.grid = { x: [], y: [] };
            for (let i = 0; i < this.stageConfig.width / this.blockSnapSize; i++) {
                this.grid.x.push([
                    Math.round(i * this.blockSnapSize) + 0.5,
                    0,
                    Math.round(i * this.blockSnapSize) + 0.5,
                    this.stageConfig.height
                ]);
            }
            for (let i = 0; i < this.stageConfig.height / this.blockSnapSize; i++) {
                this.grid.y.push([
                    0,
                    Math.round(i * this.blockSnapSize),
                    this.stageConfig.width,
                    Math.round(i * this.blockSnapSize)
                ]);
            }
        },
        updateMapZoneThief() {
            this.mapZoneThief = {};
            for (const event of this.eventNewest) {
                for (const zoneId of _.keys(this.mapZoneCamera)) {
                    if (+this.mapZoneCamera[zoneId] === event.cameraId) {
                        if (!this.mapZoneThief[zoneId]) {
                            const image = new window.Image();
                            image.src = API_CONFIG.BASE_URL + event.image;
                            image.onload = () => {
                                this.mapZoneThief[zoneId] = {
                                    image
                                };
                            };
                        }
                        break;
                    }
                }
            }
        },
        zoneSelectedChange(zoneSelected) {
            if (zoneSelected && this.typeSelected !== zoneSelected.site) {
                this.typeSelected = zoneSelected.site;
                this.onChangeFunction();
            }
        }
    },
    created() {
        window.addEventListener('resize', this.onWindowSizeChange);
    },
    watch: {
        rawZones() {
            this.zones = this.rawZones.filter(
                zone => !zone.site || _.isEqual(zone.site, this.typeSelected)
            );
        },
        zones() {
            this.regions = [];
            for (const zone of this.zones) {
                if (!zone.regions) continue;
                zone.regions.forEach(region => {
                    this.regions.push({ points: region, title: zone.name, id: zone.id });
                });
            }
            this.stageConfig = {
                width: this.$refs.videoThumbnail.clientWidth,
                height: this.$refs.videoThumbnail.clientHeight
            };
            // Get image background dimensions
            const img = new Image();
            img.onload = () => {
                const { width, height } = img;
                this.backgroundImageDimensions = {
                    width,
                    height
                };
                this.scaleArea();
            };
            img.src = this.getBackgroundImageUrl();
        },
        message() {
            if (this.message.view === 'alert' && this.message.type === 'suspect') {
                this.eventNewest.push(this.message);
            }
        },
        listCamIdAlert() {
            this.updateListZoneIdAlert(this.listCamIdAlert);
        },
        listZoneIdAlert() {
            if (this.isBrushing) return;
            let time = true;
            // reset flip
            if (this.flipInterval) clearInterval(this.flipInterval);
            this.areas = [];
            // start flip
            this.flipInterval = setInterval(() => {
                if (time) {
                    this.showAlertZone();
                } else this.areas = [];
                time = !time;
            }, 500);
            this.updateMapZoneThief();
        }
    },
    beforeDestroy() {
        if (this.filterNewestEventInterval) clearInterval(this.filterNewestEventInterval);
        if (this.fetchDataInterval) clearInterval(this.fetchDataInterval);
        if (this.flipInterval) clearInterval(this.flipInterval);
    },
    destroyed() {
        window.removeEventListener('resize', this.onWindowSizeChange);
    }
};
</script>
<style lang="scss">
.video-modal-border {
    border: 2px solid;
    border-color: silver;
}
.event-text-color {
    color: lime;
    background-color: rgba(0, 0, 0, 0.6);
}
.floorplan-select {
    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAMCAYAAABSgIzaAAAAM0lEQVQokWMYAYBRYcWN/7i8+SBCgxGXHBNIMw45nJpgGrEpwqsJWSOyYoKaRgRgYGAAAAPpBA7T8xX8AAAAAElFTkSuQmCC') !important;
    background-position: right 50% !important;
    background-repeat: no-repeat !important;
    max-width: max-content !important;
    padding-top: unset !important;
    padding-bottom: unset !important;
}
</style>
