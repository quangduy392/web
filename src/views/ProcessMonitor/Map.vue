<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item class="text-nowrap" active>
                        {{ $t('processMonitor.commonTitle') }}
                    </b-nav-item>
                </b-navbar-nav>
            </template>
            <template slot="sub-header-middle"></template>
        </sub-header>

        <div class="page-content sub-header-page-content">
            <div class="d-flex h-100">
                <div class="h-100 pr-0 overflow-y-auto flex-1 p-2">
                    <div class="mih-100 d-flex flex-column">
                        <b-row class="flex-grow-1 mb-2 mx-0">
                            <b-col class="px-0">
                                <div id="containerMap" class="h-100 border border-gray-500"></div>
                            </b-col>
                        </b-row>

                        <b-row class="mx-0">
                            <b-col
                                cols="3"
                                v-for="(camera, index) in selectedCameras"
                                :key="camera.id"
                                :class="{
                                    'pl-0 pr-1': index === 0,
                                    'px-1': index > 0 && index < selectedCameras.length - 1,
                                    'pr-0 pl-1': index === selectedCameras.length - 1
                                }"
                            >
                                <cam-live-view :camera="camera"></cam-live-view>
                            </b-col>
                        </b-row>
                    </div>
                </div>
                <div class="att-cam_sidebar h-100">
                    <reception-map-sidebar
                        @doFilter="updateSelectedCameraList"
                        :max-selected-cam="maxSelectedCam"
                        :selected-cam-id="selectedCamId"
                    ></reception-map-sidebar>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import ReceptionMapSidebar from '@/components/ReceptionMapSidebar';
import CamLiveView from '@/components/CamLiveView';
import CONSTANTS from '@/constants';

import { loadModules } from 'esri-loader';

export default {
    components: {
        ReceptionMapSidebar,
        CamLiveView
    },
    mounted: async function() {
        loadModules(['esri/Map', 'esri/views/MapView'], {
            css: true
        }).then(([ArcGISMap, MapView]) => {
            this.map = new ArcGISMap({
                basemap: 'streets-vector'
            });
            this.mapView = new MapView({
                container: document.getElementById('containerMap'),
                map: this.map,
                center: [105.8194541, 21.0227788],
                zoom: 10
            });
        });
    },
    computed: {
        ...mapState({
            receptionCameras: state => state.reception.receptionCameras
        }),
        cameraList() {
            const cameras = this.receptionCameras.map(camera => {
                return {
                    ...camera,
                    district: camera.district ? camera.district.trim() : '',
                    ward: camera.ward ? camera.ward.trim() : ''
                };
            });
            return cameras;
        }
    },
    watch: {
        cameraList() {
            this.updateMarkers();
        },
        map() {
            this.updateMarkers();
        }
    },
    data() {
        return {
            selectedCameras: [{}, {}, {}, {}],
            maxSelectedCam: 4,
            map: null,
            mapView: null,
            selectedCamId: null,
            isFit: false
        };
    },
    methods: {
        async updateSelectedCameraList({ selectedCameras }) {
            if (selectedCameras.length) {
                this.selectedCameras = selectedCameras;
            } else {
                const selectedCameras = [];
                for (let i = 0; i < this.maxSelectedCam; i++) {
                    selectedCameras.push({});
                }
                this.selectedCameras = selectedCameras;
            }
        },
        getCameraName(id) {
            const camera = this.cameras.find(el => el.id === id);
            if (camera) return camera.name;
        },
        updateMarkers() {
            if (!this.map) return;
            loadModules(
                [
                    'esri/Graphic',
                    'esri/layers/GraphicsLayer',
                    'esri/layers/FeatureLayer',
                    'esri/PopupTemplate'
                ],
                {
                    css: true
                }
            ).then(([Graphic, GraphicsLayer, FeatureLayer, PopupTemplate]) => {
                this.map.removeAll();
                const graphicsLayer = new GraphicsLayer();
                this.map.add(graphicsLayer);

                this.cameraList.forEach(
                    ({ id, latitude, longitude, district, ward, status, presentTime }) => {
                        if (!latitude || !longitude) return;
                        const position = {
                            type: 'point',
                            longitude,
                            latitude
                        };

                        let markerIconName = '';
                        let statusText = '';
                        let statusTextClass = '';
                        switch (status) {
                            case CONSTANTS.RECEPTION_CAMERA_STATUSES.PRESENT: {
                                // Present
                                markerIconName = 'marker-green';
                                statusText = this.$t('processMonitor.present');
                                statusTextClass = 'text-success';
                                break;
                            }

                            case CONSTANTS.RECEPTION_CAMERA_STATUSES.ABSENT: {
                                // Absent
                                markerIconName = 'marker-red';
                                statusText = this.$t('processMonitor.absent');
                                statusTextClass = 'text-danger';
                                break;
                            }

                            case CONSTANTS.RECEPTION_CAMERA_STATUSES.BROKEN: {
                                // Broken cam
                                markerIconName = 'marker-gray';
                                statusText = this.$t('processMonitor.brokenCam');
                                statusTextClass = 'text-muted';
                                break;
                            }

                            case CONSTANTS.RECEPTION_CAMERA_STATUSES.NO_SCHEDULE: {
                                // NO_SCHEDULE
                                markerIconName = 'marker-blue';
                                statusText = this.$t('processMonitor.noSchedule');
                                statusTextClass = 'text-primary';
                                break;
                            }
                        }

                        const url = `/static/img/${markerIconName}.png`;
                        const marker = {
                            type: 'picture-marker',
                            url,
                            width: '25px',
                            height: '35px'
                        };

                        const presentHours = Math.floor(presentTime / 60);
                        const presentHoursText =
                            presentHours > 0
                                ? `${presentHours}${this.$t('processMonitor.hour')} `
                                : '';
                        const presentMinutes = presentTime % 60;
                        const presentMinutesText = `${presentMinutes}${this.$t(
                            'processMonitor.minute'
                        )}`;
                        const presentTimeText = `${presentHoursText}${presentMinutesText}`;
                        const infowindowContent =
                            '<div class="text-dark py-2 px-1 text-nowrap">' +
                            `<b>${ward ? ward + ', ' : ''} ${district || ''}</b><br />` +
                            `${this.$t('processMonitor.status')}: ` +
                            `<span class="${statusTextClass} font-weight-bold">${statusText}</span> <br/>` +
                            `${this.$t('processMonitor.present')}: ` +
                            `<span>${presentTimeText}</span>` +
                            '</div>';

                        const popupTemplate = new PopupTemplate({
                            content: () => {
                                this.selectedCamId = id;
                                const template = document.createElement('template');
                                template.innerHTML = infowindowContent;
                                return template.content.firstChild;
                            }
                        });
                        const graphic = new Graphic({
                            geometry: position,
                            symbol: marker,
                            popupTemplate
                        });

                        graphicsLayer.add(graphic);
                        if (!this.isFit) {
                            this.mapView.goTo(graphic);
                            this.isFit = true;
                        }
                    }
                );
            });
        }
    },
    beforeDestroy() {
        if (this.map) {
            this.map.container = null;
        }
    }
};
</script>
