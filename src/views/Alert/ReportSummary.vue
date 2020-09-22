<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item to="/alert/report/summary" class="text-nowrap">
                        {{ $t('alert.report.summary') }}
                    </b-nav-item>
                    <b-nav-item to="/alert/report/detail" class="text-nowrap">
                        {{ $t('alert.report.detail') }}
                    </b-nav-item>
                </b-navbar-nav>
            </template>
            <template slot="sub-header-middle"></template>
        </sub-header>

        <div class="page-content sub-header-page-content pb-0 p-4">
            <div class="mb-3">
                <div class="d-inline-block mr-3">
                    <div>Chọn thời điểm bắt đầu:</div>
                    <DateTimePicker
                        class="peopleCountInput"
                        @input="onChangeTimeStart"
                        v-model="paramFilter.start"
                    />
                </div>
                <div class="d-inline-block mr-3">
                    <div>Chọn thời điểm kết thúc:</div>
                    <DateTimePicker
                        class="peopleCountInput"
                        @input="onChangeTimeEnd"
                        v-model="paramFilter.end"
                    />
                </div>
                <div class="d-inline-block mr-3">
                    <div>Vị trí:</div>
                    <b-form-select
                        v-model="paramFilter.group"
                        class="mr-3 mx-input"
                        :options="zones"
                        value-field="id"
                        text-field="name"
                        style="border-radius: 0.25rem; height: 34px; margin-bottom: 3px;"
                        @change="loadData"
                    >
                        <template slot="first">
                            <option value>Tất cả</option>
                        </template>
                    </b-form-select>
                </div>
                <div class="d-inline-block mr-3">
                    <div>Mức độ:</div>
                    <b-form-select
                        v-model="paramFilter.level"
                        class="mr-3 mx-input"
                        :options="levelOptions"
                        value-field="id"
                        text-field="label"
                        style="border-radius: 0.25rem; height: 34px; margin-bottom: 3px;"
                        @change="loadData"
                    ></b-form-select>
                </div>
                <div class="d-inline-block mr-3">
                    <div>Loại cảnh báo:</div>
                    <b-form-select
                        v-model="paramFilter.type"
                        class="mr-3 mx-input"
                        :options="typeOptions"
                        value-field="id"
                        text-field="label"
                        style="border-radius: 0.25rem; height: 34px; margin-bottom: 3px;"
                        @change="loadData"
                    ></b-form-select>
                </div>
            </div>
            <b-table
                v-if="!isShowLoading"
                bordered
                striped
                dark
                responsive
                :fields="fields"
                :items="dataTable"
                :current-page="currentPage"
                :per-page="CONSTANTS.ITEM_PEOPLE_COUNT_PER_PAGE"
            >
                <template slot="index" slot-scope="data">
                    {{
                        (currentPage - 1) * CONSTANTS.ITEM_PEOPLE_COUNT_PER_PAGE + (data.index + 1)
                    }}
                </template>
                <template slot="level" slot-scope="data">
                    {{
                        levelOptions.find(level => level.id === data.item.level + '')
                            ? levelOptions.find(level => level.id === data.item.level + '').label
                            : ''
                    }}
                </template>
                <template slot="type" slot-scope="data">
                    {{
                        typeOptions.find(item => item.id === data.item.type)
                            ? typeOptions.find(item => item.id === data.item.type).label
                            : ''
                    }}
                </template>
                <template slot="createdAt" slot-scope="data">{{
                    data.item.createdAt | formatDateTime
                }}</template>
            </b-table>
            <div
                class="my-1"
                v-if="!isShowLoading && dataTable.length > CONSTANTS.ITEM_PEOPLE_COUNT_PER_PAGE"
            >
                <b-pagination
                    v-model="currentPage"
                    :total-rows="dataTable.length"
                    :per-page="CONSTANTS.ITEM_PEOPLE_COUNT_PER_PAGE"
                    :hide-goto-end-buttons="true"
                    :prev-text="$t('common.prevPage')"
                    :next-text="$t('common.nextPage')"
                    class="my-0"
                    align="center"
                ></b-pagination>
            </div>
            <div
                v-if="isShowLoading"
                class="h-100 d-flex flex-column justify-content-center align-items-center"
            >
                <img src="/static/img/loader-green.gif" class="standalone-loading" />
            </div>
        </div>
    </div>
</template>
<script>
import { mapActions, mapState } from 'vuex';
import CONSTANTS from '@/constants';
import moment from 'moment-timezone';
import DateTimePicker from '@/components/DateTimePicker';

export default {
    components: { DateTimePicker },
    mounted: function() {
        this.$nextTick(async () => {
            await this.getListZones();
            await this.getListZoneCamera();
            this.loadData();
            await this.getTypeList();
            this.typeOptions = [
                {
                    id: 'all',
                    label: this.$t('alert.all')
                }
            ].concat(
                this.types.map(item => ({
                    id: item.value,
                    label: item.descVN
                }))
            );
        });
    },
    computed: {
        ...mapState({
            events: state => state.event.events,
            zones: state => state.zone.items,
            types: state => state.event.types,
            zoneCamera: state => state.zone.zoneCamera
        })
    },
    data() {
        return {
            isShowLoading: true,
            CONSTANTS,
            currentPage: 1,
            typeOptions: [],
            levelOptions: [
                {
                    id: 'all',
                    label: this.$t('alert.all')
                },
                {
                    id: '0',
                    label: this.$t('alert.normal')
                },
                {
                    id: '1',
                    label: this.$t('alert.welcome')
                },
                {
                    id: '2',
                    label: this.$t('alert.warning')
                },
                {
                    id: '3',
                    label: this.$t('alert.redAlert')
                }
            ],
            fields: [
                {
                    thClass: 'text-center',
                    tdClass: 'text-center',
                    key: 'index',
                    label: '#'
                },
                {
                    key: 'zone',
                    label: 'Vị trí'
                },
                {
                    class: 'text-center',
                    key: 'level',
                    label: 'Mức độ'
                },
                {
                    class: 'text-center',
                    key: 'type',
                    label: 'Loại cảnh báo'
                },
                {
                    class: 'text-center',
                    key: 'count',
                    label: 'Số lượng'
                }
            ],
            paramFilter: {
                start: moment().subtract(1, 'day'),
                end: moment(),
                group: '',
                level: 'all',
                type: 'all'
            },
            mapZoneCam: {},
            listZoneCamera: [],
            dataTable: []
        };
    },
    methods: {
        ...mapActions({
            getNewestEventListReplace: 'event/getNewestEventListReplace',
            getListZones: 'zone/getListZones',
            getTypeList: 'event/getEventTypes',
            getListZoneCamera: 'zone/getListZoneCamera'
        }),
        onChangeTimeStart(e) {
            setTimeout(() => {
                if (this.isShowLoading) return;
                this.loadData();
            }, 100);
        },
        onChangeTimeEnd(e) {
            setTimeout(() => {
                if (this.isShowLoading) return;
                this.loadData();
            }, 100);
        },
        async loadData() {
            this.isShowLoading = true;
            const params = {
                from: moment(this.paramFilter.start).format('X'),
                to: moment(this.paramFilter.end).format('X'),
                type: this.paramFilter.type,
                level: this.paramFilter.level
            };
            if (params.type === 'all') params.type = null;
            if (params.level === 'all') params.level = null;
            if (this.paramFilter.group) {
                const zoneCamera = this.listZoneCamera.find(
                    item => item.zoneId === this.paramFilter.group
                );
                params.cameraId = zoneCamera ? zoneCamera.cameraId : '-1';
            }
            await this.getNewestEventListReplace(params);
            this.isShowLoading = false;
        }
    },
    watch: {
        events(value) {
            const listCamId = _.uniqBy(value, 'cameraId').map(item => item.cameraId);
            const listZoneId = this.zones.map(item => item.id);
            this.listZoneCamera = this.zoneCamera.filter(item => listZoneId.includes(item.zoneId));
            this.mapZoneCam = {};
            for (const cameraId of listCamId) {
                const zoneCamera = this.listZoneCamera.find(item => item.cameraId === cameraId);
                this.mapZoneCam[cameraId] = {
                    cameraId
                };
                if (zoneCamera) {
                    this.mapZoneCam[cameraId].zoneId = zoneCamera.zoneId;
                    this.mapZoneCam[cameraId].zone = this.zones.find(
                        item => item.id === zoneCamera.zoneId
                    ).name;
                }
            }
            for (const event of value) {
                event.zone = this.mapZoneCam[event.cameraId].zone;
            }
            const items = _.groupBy(value, item => {
                return item.level + '/' + item.type + '/' + item.zone;
            });
            this.dataTable = [];
            for (const item of _.keys(items)) {
                const listKey = item.split('/');
                this.dataTable.push({
                    level: listKey[0],
                    type: listKey[1],
                    zone: listKey[2],
                    count: items[item].length
                });
            }
        }
    }
};
</script>
<style>
.peopleCountInput input {
    width: 100%;
    height: 34px !important;
    padding: 6px 30px;
    padding-left: 10px;
    border: 1px solid #ccc !important;
    border-radius: 4px !important;
    min-height: unset !important;
}
.peopleCountInput button {
    height: 34px !important;
    border-radius: 4px !important;
    min-height: unset !important;
}
</style>
